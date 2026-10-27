#!/usr/bin/env node
// Logic regression checks for the clinical engine, formulas, meal pipeline and telehealth state machine.
// Run with: node scripts/check-logic.mjs   (uses the project's TypeScript devDependency; no test runner needed)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const assert = require('node:assert');
const ts = require('typescript');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nutricare-logic-'));
const modules = [
  'src/utils/calculations.ts', 'src/utils/dates.ts', 'src/utils/formatters.ts',
  'src/engine/policyEngine.ts', 'src/engine/policyRules.ts', 'src/engine/mealPipeline.ts',
  'src/engine/teleSessionStateMachine.ts', 'src/mock/defaultPatients.ts', 'src/mock/defaultMeals.ts',
  'src/mock/defaultCharts.ts', 'src/mock/mockWearables.ts', 'src/types/meals.ts',
  'src/types/clinical.ts', 'src/types/telehealth.ts', 'src/types/wearables.ts'
];
for (const f of modules) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const dest = path.join(outDir, f.replace(/\.ts$/, '.js'));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, js);
}
const B = outDir;

const r = (p) => require(`${B}/${p}`);
const calc = r('src/utils/calculations.js'), eng = r('src/engine/policyEngine.js'), rules = r('src/engine/policyRules.js');
const pipe = r('src/engine/mealPipeline.js'), sm = r('src/engine/teleSessionStateMachine.js'), dates = r('src/utils/dates.js');
const meals = r('src/mock/defaultMeals.js'), patients = r('src/mock/defaultPatients.js'), charts = r('src/mock/defaultCharts.js'), wear = r('src/mock/mockWearables.js');
let pass = 0; const t = (name, fn) => { fn(); pass++; console.log('PASS', name); };

// Formulas (hand-checked: Devine female 45.5+2.3*(65.0-60); male 50+2.3*(71.65-60))
t('Devine IBW Eleanor 165cm F = 56.9', () => assert.strictEqual(calc.calculateIBW(165, 'Female'), 56.9));
t('Devine IBW Marcus 182cm M = 76.8', () => assert.strictEqual(calc.calculateIBW(182, 'Male'), 76.8));
t('Devine IBW invalid height -> 0 (was 45.5)', () => assert.strictEqual(calc.calculateIBW(0, 'Female'), 0));
t('Mifflin invalid input -> NaN (was 1500)', () => assert.ok(Number.isNaN(calc.calculateMifflinStJeor(0, 165, 62, 'Female'))));
t('Mifflin Eleanor = 1302 (10*74.2+6.25*165-5*62-161)', () => assert.strictEqual(calc.calculateMifflinStJeor(74.2, 165, 62, 'Female'), 1302));
t('CKD-EPI 2021 Eleanor (Scr 1.35, 62y, F) = 44', () => assert.strictEqual(calc.calculateEgfrCkdEpi2021(1.35, 62, 'Female'), 44));
t('CKD-EPI invalid creatinine -> 0', () => assert.strictEqual(calc.calculateEgfrCkdEpi2021(0, 62, 'Female'), 0));
t('Mock patient IBW/eGFR come from formulas', () => {
  assert.strictEqual(patients.DEFAULT_PATIENTS[0].anthropometrics.idealBodyWeightKg, 56.9);
  assert.strictEqual(patients.DEFAULT_PATIENTS[1].anthropometrics.idealBodyWeightKg, 76.8);
  assert.strictEqual(patients.DEFAULT_PATIENTS[0].labs.eGfr, 44);
});

// Policy engine
const ruleLow = rules.DEFAULT_POLICY_RULES.filter(r => r.isActive);
const okNutr = { calories: 400, carbs: 50, protein: 30, fat: 10, sodium: 300, fiber: 6, potassium: 400 };
t('NaN nutrient is never COMPLIANT (single WARNING)', () => {
  const res = eng.validateMealPlan({ ...okNutr, sodium: NaN }, ruleLow);
  assert.strictEqual(res.length, 1); assert.strictEqual(res[0].severity, 'WARNING');
  assert.ok(res.every(x => x.severity !== 'COMPLIANT'));
});
t('Seeded ramen gives sodium VIOLATION', () => {
  const ramen = meals.getInitialMeals('pt-001')[2];
  assert.ok(ramen.validationResults.some(r => r.severity === 'VIOLATION' && r.metric.startsWith('Sodium')));
});
t('Cumulative daily sodium: 450 earlier + 1490 new -> WARNING (projected 1940 of 2000)', () => {
  const res = eng.validateMealPlan({ ...okNutr, sodium: 1490 }, ruleLow, { accumulatedSodium: 450, accumulatedPotassium: 0, accumulatedCarbs: 0 });
  const daily = res.find(x => x.ruleId === 'pol-low-sodium-daily-sodium');
  assert.ok(daily); assert.strictEqual(daily.severity, 'WARNING'); assert.strictEqual(daily.actualValue, 1940);
});
t('Cumulative daily sodium: 1700 earlier + 400 -> VIOLATION', () => {
  const res = eng.validateMealPlan({ ...okNutr, sodium: 400 }, ruleLow, { accumulatedSodium: 1700, accumulatedPotassium: 0, accumulatedCarbs: 0 });
  assert.strictEqual(res.find(x => x.ruleId === 'pol-low-sodium-daily-sodium').severity, 'VIOLATION');
});
t('Daily potassium cap now enforced (1800 + 340 > 2000)', () => {
  const rule = { ...rules.DEFAULT_POLICY_RULES[1], isActive: true };
  const res = eng.validateMealPlan({ ...okNutr, potassium: 340 }, [rule], { accumulatedSodium: 0, accumulatedPotassium: 1800, accumulatedCarbs: 0 });
  const k = res.find(x => x.ruleId === 'pol-diabetic-renal-daily-potassium');
  assert.ok(k); assert.strictEqual(k.severity, 'VIOLATION'); assert.strictEqual(k.actualValue, 2140);
});
t('Meal fat-share rule evaluated (34g fat = 306 of 780 kcal = 39%)', () => {
  const rule = { id: 'x', name: 'Fat', code: 'X', description: '', category: 'General', isActive: true, mealMaxFatPercent: 30 };
  const res = eng.validateMealPlan({ calories: 780, carbs: 86, protein: 29, fat: 34, sodium: 100, fiber: 6, potassium: 100 }, [rule]);
  const f = res.find(x => x.metric.startsWith('Fat'));
  assert.strictEqual(f.severity, 'VIOLATION'); assert.strictEqual(f.actualValue, 39);
});
t('Every rule field now has a handler (no orphans)', () => {
  const rule = { id: 'all', name: 'All', code: 'A', description: '', category: 'General', isActive: true,
    mealMaxSodium: 1, dailyMaxSodium: 1, mealMinCarbs: 1, mealMaxCarbs: 1000, mealMinFiber: 1, mealMaxPotassium: 1, dailyMaxPotassium: 1, mealMaxFatPercent: 1 };
  const res = eng.validateMealPlan(okNutr, [rule], { accumulatedSodium: 0, accumulatedPotassium: 0, accumulatedCarbs: 0 });
  const metrics = new Set(res.map(x => x.metric));
  for (const m of ['Daily Potassium Total', 'Fat (% of meal kcal)']) assert.ok(metrics.has(m), m);
});

// Meal pipeline (cumulative validation + today-only totals)
const today = dates.localIsoDate();
t('Seed meals: 2 today, 1 yesterday; dates are local', () => {
  const seeded = meals.getInitialMeals('pt-001');
  assert.strictEqual(seeded.filter(m => m.date === today).length, 2);
  const yest = dates.localIsoDate(dates.localDateAt(1, 12, 0));
  assert.strictEqual(seeded[2].date, yest);
});
t('Daily totals exclude yesterday (today: 860 kcal, 450 mg Na, 106 g carbs)', () => {
  const seeded = pipe.validateMealsCumulative(meals.getInitialMeals('pt-001'), rules.DEFAULT_POLICY_RULES);
  const tot = pipe.totalsForDay(seeded, today);
  assert.strictEqual(tot.calories, 860); assert.strictEqual(tot.sodium, 450); assert.strictEqual(tot.carbs, 106);
});
t('Logging a large meal today: cumulative daily WARNING (110+340+1490 = 1940 of 2000)', () => {
  const seeded = meals.getInitialMeals('pt-001');
  const now = new Date();
  const added = { id: 'new', patientId: 'pt-001', name: 'Ramen', slot: 'Dinner', timestamp: 'x', date: today, loggedAt: now.getTime() + 1000,
    nutrition: { calories: 780, carbs: 86, protein: 29, fat: 34, sodium: 1490, fiber: 2.8, potassium: 480, water: 400 }, source: 'manual', validationResults: [] };
  const out = pipe.validateMealsCumulative([...seeded, added], rules.DEFAULT_POLICY_RULES);
  const daily = out.find(m => m.id === 'new').validationResults.find(r => r.ruleId === 'pol-low-sodium-daily-sodium');
  assert.ok(daily, 'cumulative daily result present');
  assert.strictEqual(daily.severity, 'WARNING'); assert.strictEqual(daily.actualValue, 1940);
});
t('Cumulative order: earlier meals count, later meals do not', () => {
  const a = { id: 'a', date: today, loggedAt: 1, nutrition: { calories: 1, carbs: 0, protein: 0, fat: 0, sodium: 1500, fiber: 5, potassium: 0 } };
  const b = { id: 'b', date: today, loggedAt: 2, nutrition: { calories: 1, carbs: 0, protein: 0, fat: 0, sodium: 300, fiber: 5, potassium: 0 } };
  const out = pipe.validateMealsCumulative([b, a], rules.DEFAULT_POLICY_RULES);
  const dailyB = out.find(m => m.id === 'b').validationResults.find(r => r.ruleId === 'pol-low-sodium-daily-sodium');
  assert.ok(dailyB && dailyB.severity === 'WARNING' && dailyB.actualValue === 1800, 'b logged after a (1500) should see 1800 projected (WARNING, cap 2000)');
  const dailyA = out.find(m => m.id === 'a').validationResults.find(r => r.ruleId === 'pol-low-sodium-daily-sodium');
  assert.strictEqual(dailyA, undefined, 'a is first, 1500 alone is under cap');
});

// Telehealth state machine
t('Completed cannot re-enter In Session', () => assert.strictEqual(sm.canTransition('Completed', 'In Session'), false));
t('Upcoming -> In Session allowed', () => assert.strictEqual(sm.canTransition('Upcoming', 'In Session'), true));
t('Cancelled is terminal', () => assert.strictEqual(sm.canTransition('Cancelled', 'Upcoming'), false));
t('isSessionStatus rejects prototype keys', () => { assert.strictEqual(sm.isSessionStatus('toString'), false); assert.strictEqual(sm.isSessionStatus('Completed'), true); });

// Per-patient data
t('Blank chart for pt-002 has his own labs and no PES', () => {
  const c = charts.createBlankChart(patients.DEFAULT_PATIENTS[1]);
  assert.strictEqual(c.patientId, 'pt-002'); assert.strictEqual(c.assessment.labs.hba1cPercent, 6.1); assert.strictEqual(c.diagnosisPES.length, 0);
});
t('Empty wearables are zeroed', () => { const w = wear.createEmptyWearables(); assert.strictEqual(w.steps, 0); assert.strictEqual(w.lastSyncTimestamp, 'Never'); });
t('Local date helper uses local calendar day', () => { const d = new Date(2026, 9, 27, 23, 59); assert.strictEqual(dates.localIsoDate(d), '2026-10-27'); });
console.log(`\n${pass} checks passed`);
fs.rmSync(outDir, { recursive: true, force: true });
