import React, { useState } from 'react';
import { useNutriCare } from '../../../context/NutriCareContext';
import { NCPT_PROBLEM_DICTIONARY, NCPTTerminologyItem } from '../../../mock/defaultCharts';
import { PESStatement } from '../../../types/clinical';
import { 
  Stethoscope, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  Info,
  BookOpen
} from 'lucide-react';

export const Step2DiagnosisPES: React.FC = () => {
  const { chart, addPESStatement, removePESStatement } = useNutriCare();

  const [selectedTerm, setSelectedTerm] = useState<NCPTTerminologyItem>(NCPT_PROBLEM_DICTIONARY[0]);
  const [etiologyText, setEtiologyText] = useState<string>(NCPT_PROBLEM_DICTIONARY[0].defaultEtiologies[0]);
  const [signsSymptomsText, setSignsSymptomsText] = useState<string>(NCPT_PROBLEM_DICTIONARY[0].defaultSignsSymptoms[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-generate preview
  const liveStatement = `${selectedTerm.term} [${selectedTerm.code}] related to ${etiologyText || '...'} as evidenced by ${signsSymptomsText || '...'}.`;

  const handleSelectProblem = (code: string) => {
    const found = NCPT_PROBLEM_DICTIONARY.find(p => p.code === code);
    if (found) {
      setSelectedTerm(found);
      setEtiologyText(found.defaultEtiologies[0] || '');
      setSignsSymptomsText(found.defaultSignsSymptoms[0] || '');
    }
  };

  const handleAddPES = (e: React.FormEvent) => {
    e.preventDefault();
    if (!etiologyText.trim() || !signsSymptomsText.trim()) return;

    addPESStatement({
      domain: selectedTerm.domain,
      problemCode: selectedTerm.code,
      problem: selectedTerm.term,
      etiology: etiologyText.trim(),
      signsSymptoms: signsSymptomsText.trim(),
      fullStatement: liveStatement
    });
  };

  const copyToClipboard = (statement: string, id: string) => {
    navigator.clipboard.writeText(statement);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Active PES Statements Card */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-clinical-teal" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2.1 Active PES Diagnostic Statements ({chart.diagnosisPES.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Standard eNCPT Format: [P] related to [E] as evidenced by [S]
          </span>
        </div>

        {chart.diagnosisPES.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No diagnostic statements added yet. Use the PES Builder below to construct one.
          </div>
        ) : (
          <div className="space-y-3">
            {chart.diagnosisPES.map((pes, idx) => (
              <div
                key={pes.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-clinical-teal">
                      PES #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      {pes.domain}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {pes.problem} ({pes.problemCode})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyToClipboard(pes.fullStatement, pes.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                      title="Copy full PES statement"
                    >
                      {copiedId === pes.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => removePESStatement(pes.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove PES statement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-800 leading-relaxed font-medium">
                  {pes.fullStatement}
                </p>

                {/* Sub-breakdown badges */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap gap-2 text-[10px]">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    <strong className="text-teal-700">Etiology:</strong> {pes.etiology}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    <strong className="text-amber-700">Signs/Symptoms:</strong> {pes.signsSymptoms}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive PES Builder Form */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <BookOpen className="w-4 h-4 text-clinical-teal" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            2.2 Standardized eNCPT PES Statement Builder
          </h3>
        </div>

        <form onSubmit={handleAddPES} className="space-y-4 text-xs">
          {/* Step 1: Select Problem (P) */}
          <div>
            <label className="font-bold text-slate-800 block mb-1 flex items-center justify-between">
              <span>Step P: Select Nutrition Diagnostic Problem [P]</span>
              <span className="text-[10px] text-teal-600 font-semibold">{selectedTerm.domain}</span>
            </label>
            <select
              value={selectedTerm.code}
              onChange={e => handleSelectProblem(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white focus:border-clinical-teal focus:outline-none"
            >
              {NCPT_PROBLEM_DICTIONARY.map(term => (
                <option key={term.code} value={term.code}>
                  [{term.code}] {term.term} — ({term.domain})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Etiology (E) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-800 block">
                Step E: Etiology [E] (Related To...)
              </label>
              <div className="text-[10px] text-slate-400">Select standard preset or write custom</div>
            </div>

            {/* Presets chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedTerm.defaultEtiologies.map((et, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setEtiologyText(et)}
                  className={`text-[10px] px-2 py-1 rounded-lg border text-left transition-colors ${
                    etiologyText === et
                      ? 'bg-teal-50 border-teal-400 text-clinical-teal font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {et}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={etiologyText}
              onChange={e => setEtiologyText(e.target.value)}
              placeholder="Root cause or contributing risk factors..."
              required
              className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-clinical-teal focus:outline-none"
            />
          </div>

          {/* Step 3: Signs & Symptoms (S) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-800 block">
                Step S: Signs & Symptoms [S] (As Evidenced By...)
              </label>
              <div className="text-[10px] text-slate-400">Quantifiable lab or food log metrics</div>
            </div>

            {/* Presets chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedTerm.defaultSignsSymptoms.map((ss, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSignsSymptomsText(ss)}
                  className={`text-[10px] px-2 py-1 rounded-lg border text-left transition-colors ${
                    signsSymptomsText === ss
                      ? 'bg-teal-50 border-teal-400 text-clinical-teal font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {ss}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={signsSymptomsText}
              onChange={e => setSignsSymptomsText(e.target.value)}
              placeholder="Clinical evidence, biometric lab findings, or diet history data..."
              required
              className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-clinical-teal focus:outline-none"
            />
          </div>

          {/* Live Structured PES Statement Preview */}
          <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200">
            <span className="text-[10px] uppercase font-bold text-clinical-teal tracking-wider block mb-1">
              Synthesized eNCPT PES Statement Preview:
            </span>
            <p className="text-xs font-semibold text-slate-900 leading-relaxed italic">
              "{liveStatement}"
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-clinical-navy hover:bg-slate-900 text-white font-bold text-xs shadow-soft-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-teal-400" />
              <span>Append PES Statement to Chart</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
