import React, { useState, useMemo } from 'react';
import { useNutriCare } from '../../context/NutriCareContext';
import { MealSlot, NutritionalValues } from '../../types/meals';
import { PRESET_MEALS, PresetMealTemplate } from '../../mock/defaultMeals';
import { validateMealPlan } from '../../engine/policyEngine';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Plus, 
  Utensils, 
  X,
  FileImage,
  Flame,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const MealTracker: React.FC = () => {
  const { addMeal, policyRules, dailyTotals } = useNutriCare();

  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealSlot, setMealSlot] = useState<MealSlot>('Lunch');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Nutritional values state
  const [nutrition, setNutrition] = useState<NutritionalValues>({
    calories: 450,
    carbs: 50,
    protein: 30,
    fat: 14,
    sodium: 420,
    fiber: 6,
    potassium: 550,
    water: 250
  });

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
  };

  // Handle File Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          if (!mealName) {
            setMealName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          if (!mealName) {
            setMealName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    addMeal({
      name: mealName.trim(),
      slot: mealSlot,
      nutrition,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
      source: imageUrl ? 'photo_scan' : 'manual'
    });

    // Reset & close
    setIsLoggingOpen(false);
    setMealName('');
    setImageUrl('');
    setNutrition({
      calories: 450,
      carbs: 50,
      protein: 30,
      fat: 14,
      sodium: 420,
      fiber: 6,
      potassium: 550,
      water: 250
    });
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
                      className={`text-[9px] font-semibold px-1 py-0.2 rounded inline-block ${
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
                      <CheckCircle2 className="w-4 h-4" /> Photo Attached & Scanned
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Macronutrients extracted from computer vision simulation.
                    </p>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
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
                    <label className="text-clinical-teal cursor-pointer hover:underline font-bold">
                      browse
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports PNG, JPG, WEBP. Or select one of the clinical presets above.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Nutrient Input Sliders & Number Fields */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <span className="text-xs font-bold text-slate-800 block mb-2">
              Nutrient Breakdown (Real-Time Policy Validated)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Calories (kcal)</label>
                <input
                  type="number"
                  min="0"
                  value={nutrition.calories}
                  onChange={e => setNutrition({ ...nutrition, calories: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Carbohydrates (g)</label>
                <input
                  type="number"
                  min="0"
                  value={nutrition.carbs}
                  onChange={e => setNutrition({ ...nutrition, carbs: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Protein (g)</label>
                <input
                  type="number"
                  min="0"
                  value={nutrition.protein}
                  onChange={e => setNutrition({ ...nutrition, protein: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Fat (g)</label>
                <input
                  type="number"
                  min="0"
                  value={nutrition.fat}
                  onChange={e => setNutrition({ ...nutrition, fat: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 font-semibold"
                />
              </div>

              {/* Crucial Clinical Parameters for Policy Engine */}
              <div>
                <label className="text-[11px] font-bold text-rose-700 block">
                  Sodium (mg) *Policy Guard
                </label>
                <input
                  type="number"
                  min="0"
                  value={nutrition.sodium}
                  onChange={e => setNutrition({ ...nutrition, sodium: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded-lg border border-rose-300 font-bold bg-white text-rose-900 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-700 block">
                  Fiber (g) *Clinical Target
                </label>
                <input
                  type="number"
                  min="0"
                  value={nutrition.fiber}
                  onChange={e => setNutrition({ ...nutrition, fiber: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded-lg border border-emerald-300 font-bold bg-white text-emerald-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-700 block">
                  Potassium (mg) *Renal Guard
                </label>
                <input
                  type="number"
                  min="0"
                  value={nutrition.potassium}
                  onChange={e => setNutrition({ ...nutrition, potassium: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded-lg border border-amber-300 font-bold bg-white text-amber-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Water / Liquid (ml)</label>
                <input
                  type="number"
                  min="0"
                  value={nutrition.water || 0}
                  onChange={e => setNutrition({ ...nutrition, water: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* REAL-TIME POLICY VALIDATION PREVIEW BANNER */}
          <div
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
