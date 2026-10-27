# NutriCare OS (prototype)

Tele-nutrition workstation prototype: a consumer meal/telemetry portal and a provider
dashboard (eNCPT charting, telehealth, policy audit). **All data is mock data.** There is no
backend, authentication, encryption or audit persistence, so this must not be used with real
patient information or for clinical decisions.

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS 3 (PostCSS + Autoprefixer)
- oxlint for linting
- lucide-react icons

## Scripts

| Command | What it does |
| --- | --- |
| `npm install` | Install locked dependencies |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and produce a production build |
| `npm run lint` | Run oxlint with `.oxlintrc.json` |
| `npm run preview` | Serve the production build locally |

## Layout

- `src/context/NutriCareContext.tsx`: app state. Meals, eNCPT charts, wearables and sync history
  are stored per patient; the UI reads the active patient's slice.
- `src/engine/`: clinical policy engine (`policyEngine.ts`, `policyRules.ts`) and the telehealth
  session state machine (`teleSessionStateMachine.ts`).
- `src/utils/`: formulas (BMI, Devine IBW, Mifflin-St Jeor, CKD-EPI 2021 eGFR), formatters and
  local-date helpers.
- `src/mock/`: seed data.
- `src/components/`: consumer portal, provider dashboard and eNCPT chart steps.

## Known limitations

See the audit report for the full list. Notable open items: no role-based access control,
patient-scoped policy assignments are not implemented, the Jitsi embed uses the public
meet.jit.si service (unsuitable for PHI), and the macronutrient targets and CKD staging text
need clinician review.
