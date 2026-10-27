import React, { useState, useMemo, useRef } from 'react';
import { useNutriCare } from '../../context/NutriCareContext';
import { MealSlot, NutritionalValues } from '../../types/meals';
import { PRESET_MEALS, PresetMealTemplate } from '../../mock/defaultMeals';
import { validateMealPlan } from '../../engine/policyEngine';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  Plus, 
  X,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const EMPTY_NUTRITION: NutritionalValues = {
  calories: 450,
  carbs: 50,
  protein: 30,
  fat: 14,
  sodium: 420,
  fiber: 6,
  potassium: 550,
  water: 250
};

/** Upper bound per field. Keeps typos (e.g. an extra zero) from silently distorting totals. */
const NUMERIC_LIMITS: Record<keyof NutritionalValues, number> = {
  calories: 5000,
  carbs: 1000,
  protein: 500,
  fat: 500,
  sodium: 10000,
  fiber: 200,
  potassium: 10000,
  water: 10000
};

/** Non-numeric or negative input becomes 0; values above the field limit are clamped. */
function parseBounded(raw: string, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, max);
}

export const MealTracker: React.FC = () => {
  const { addMeal, policyRules, dailyTotals } = useNutriCare();

  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealSlot, setMealSlot] = useState<MealSlot>('Lunch');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [source, setSource] = useState<'manual' | 'photo_scan' | 'preset'>('manual');
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Nutritional values state
  const [nutrition, setNutrition] = useState<NutritionalValues>(EMPTY_NUTRITION);

  const setField = (key: keyof NutritionalValues, raw: string) => {
    setNutrition(prev => ({ ...prev, [key]: parseBounded(raw, NUMERIC_LIMITS[key]) }));
  };

  // Real-time policy pre-validation
  const liveValidation = useMemo(() => {
    const activeRules = policyRules.filter(r => r.isActive);
    return validateMealPlan(nutrition, activeRules, {
      accumulatedSodium: dailyTotals.sodium,
      accumulatedPotassium: dailyTotals.potassium,
      accumulatedCarbs: dailyTotals.carbs
    });
  }, [nutrition, policyRules, dailyTotals]);

  const hasViolation = liveValidation.some(r => r.severity === 'VIOLATION');
  const hasWarning = !hasViolation && liveValidation.some(r => r.severity === 'WARNING');

  // Handle Preset Selection
  const applyPreset = (preset: PresetMealTemplate) => {
    setMealName(preset.name);
    setMealSlot(preset.slot);
    setImageUrl(preset.imageUrl);
    setNutrition({ ...preset.nutrition });
    setSource('preset');
    setFileError(null);
  };

  // Accepts only images under the size limit; the photo is kept for the record, nutrient values stay manual.
  const loadPhotoFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFileError('Please choose an image file (PNG, JPG or WEBP).');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setFileError('That photo is larger than 5 MB. Choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setImageUrl(result);
        setSource('manual');
        setFileError(null);
        if (!mealName) {
          setMealName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
      }
    };
    reader.onerror = () => setFileError('Could not read that file. Try another photo.');
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    loadPhotoFile(e.dataTransfer.files?.[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadPhotoFile(e.target.files?.[0]);
  };

  const resetForm = () => {
    setMealName('');
    setImageUrl('');
    setSource('manual');
    setFileError(null);
    setNutrition(EMPTY_NUTRITION);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    const stored = addMeal({
      name: mealName.trim(),
      slot: mealSlot,
      nutrition,
      imageUrl: imageUrl || undefined,
      source
    });
    if (!stored) return;

    setIsLoggingOpen(false);
    resetForm();
  };

  return (
    <div className="bg-white rounded-2xl border border-canvas-border p-4 shadow-soft-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-clinical-teal flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Smart Meal & Photo Logger
            </h3>
            <p className="text-[11px] text-slate-400">
              Validated against active clinical dietary policies
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsLoggingOpen(!isLoggingOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-clinical-teal hover:bg-teal-700 text-white shadow-soft-sm transition-all"
        >
          {isLoggingOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isLoggingOpen ? 'Close Logger' : 'Log New Meal'}</span>
        </button>
      </div>

      {isLoggingOpen && (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-slate-100 space-y-4">
          {/* Quick Presets Carousel */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-clinical-teal" />
                Quick Clinical Presets & Violation Demos:
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Click to auto-populate</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_MEALS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 text-left transition-all group"
                >
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-slate-800 block truncate">
                      {preset.name}
                    </span>
                    <span
                      className={`text-[9px] font-semibold px-1 py-0.5 rounded inline-block ${
                        preset.isViolationDemo
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {preset.tag}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Meal Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meal Name / Description
              </label>
              <input
                type="text"
                value={mealName}
                onChange={e => setMealName(e.target.value)}
                placeholder="e.g. Quinoa Salmon Bowl, Lentil Vegetable Soup"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-clinical-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meal Timing / Slot
              </label>
              <select
                value={mealSlot}
                onChange={e => setMealSlot(e.target.value as MealSlot)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-clinical-teal bg-white"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
          </div>

          {/* Interactive Photo Logging Drag-and-Drop Simulator */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meal Photo Logging (Drag & Drop or Upload)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                isDragOver
                  ? 'border-clinical-teal bg-teal-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              {imageUrl ? (
                <div className="flex items-center gap-4 text-left">
                  <img
                    src={imageUrl}
                    alt="Uploaded meal"
                    className="w-20 h-20 rounded-xl object-cover shadow-soft-sm border border-slate-200"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" /> Photo attached
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Nutrient values below are entered manually; the photo is kept with the log.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setImageUrl(''); setSource('manual'); }}
                      className="text-[11px] text-rose-600 font-semibold hover:underline mt-1.5"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <Upload className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700">
                    Drag and drop your meal photo here, or{' '}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-clinical-teal hover:underline font-bold"
                      >
                        browse
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="sr-only"
                        aria-label="Upload meal photo"
                      />
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports PNG, JPG, WEBP. Or select one of the clinical presets above.
                  </p>
                </div>
              )}
            </div>
          </div>

          {fileError && (
            <p role="alert" className="text-[11px] text-rose-700 font-semibold">{fileError}</p>
          )}

          {/* Nutrient Input Sliders & Number Fields */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <span className="text-xs font-bold text-slate-800 block mb-2">
              Nutrient Breakdown (Real-Time Policy Validated)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Calories (kcal)</label>
                <input
                  type="number" step="any"
                  min="0"
                  value={nutrition.calories}
                  onChange={e => setField('calories', e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Carbohydrates (g)</label>
                <input
                  type="number" step="any"
                  min="0"
                  value={nutrition.carbs}
                  onChange={e => setField('carbs', e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Protein (g)</label>
                <input
                  type="number" step="any"
                  min="0"
                  value={nutrition.protein}
                  onChange={e => setField('protein', e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Fat (g)</label>
                <input
                  type="number" step="any"
                  min="0"
                  value={nutrition.fat}
                  onChange={e => setField('fat', e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 font-semibold"
                />
              </div>

              {/* Crucial Clinical Parameters for Policy Engine */}
              <div>
                <label className="text-[11px] font-bold text-rose-700 block">
                  Sodium (mg) *Policy Guard
                </label>
                <input
                  type="number" step="any"
                  min="0"
                  value={nutrition.sodium}
                  onChange={e => setField('sodium', e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-rose-300 font-bold bg-white text-rose-900 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-700 block">
                  Fiber (g) *Clinical Target
                </label>
                <input
                  type="number" step="any"
                  min="0"
                  value={nutrition.fiber}
                  onChange={e => setField('fiber', e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-emerald-300 font-bold bg-white text-emerald-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-700 block">
                  Potassium (mg) *Renal Guard
                </label>
                <input
                  type="number" step="any"
                  min="0"
                  value={nutrition.potassium}
                  onChange={e => setField('potassium', e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-amber-300 font-bold bg-white text-amber-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Water / Liquid (ml)</label>
                <input
                  type="number" step="any"
                  min="0"
                  value={nutrition.water ?? 0}
                  onChange={e => setField('water', e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* REAL-TIME POLICY VALIDATION PREVIEW BANNER */}
          <div
            role="status"
            aria-live="polite"
            className={`p-3 rounded-xl border text-xs transition-all ${
              hasViolation
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : hasWarning
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              {hasViolation ? (
                <>
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Dietary Policy Violation Detected:</span>
                </>
              ) : hasWarning ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Dietary Policy Caution:</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Compliant with Active Dietary Policies</span>
                </>
              )}
            </div>

            <ul className="space-y-1 pl-6 list-disc text-[11px]">
              {liveValidation.map((res, i) => (
                <li key={i} className={res.passed ? 'text-emerald-700' : res.severity === 'VIOLATION' ? 'text-rose-700 font-semibold' : 'text-amber-800'}>
                  {res.message}
                </li>
              ))}
            </ul>
          </div>

          {/* Submission Button */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsLoggingOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-clinical-navy hover:bg-slate-900 text-white rounded-xl shadow-soft-md transition-all active:scale-95"
            >
              Confirm & Log Meal
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
