import React from 'react';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { SimulationResult } from '../types/kinetics';

interface EquationsPanelProps {
  simulation: SimulationResult;
  lang: Language;
}

export const EquationsPanel: React.FC<EquationsPanelProps> = ({ simulation, lang }) => {
  const t = TRANSLATIONS[lang].equations;
  const { params, kdC_pM, kdA_pM, kdAEff_pM } = simulation;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            {t.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Binding Equations */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.sec1Title}
            </h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-800 space-y-2 leading-relaxed">
              <p>d[CR]/dt = kon,C · [C] · [R] − koff,C · [CR]</p>
              {params.mechanism === 'receptor_antagonist' ? (
                <>
                  <p>d[AR]/dt = kon,A · [A] · [R] − koff,A,eff · [AR]</p>
                  <p>[R]tot = [R] + [CR] + [AR]</p>
                </>
              ) : (
                <>
                  <p>d[CA]/dt = kon,A · [C] · [A] − (koff,A,eff + kel,CA) · [CA]</p>
                  <p>[R]tot = [R] + [CR]</p>
                </>
              )}
              <p>koff,A,eff = koff,A · αmut {t.mutNote}</p>
              <p>θCR(t) = [CR](t) / [R]tot</p>
            </div>
          </div>

          {/* Feedback & ADA Equations */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.sec2Title}
            </h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-800 space-y-2 leading-relaxed">
              <p>SC(t) = kel,C · [C]0 · (1 + γfb · θCR^1.6 / (0.28^1.6 + θCR^1.6))</p>
              <p>kel,A(t) = (ln2 / t1/2) · αTMDD · (1 + 2.4 · ADA(t))</p>
              <p>Seff(t) = θCR(t) + 0.85 · βbypass · (1 − θCR(t))</p>
              <p>
                {lang === 'en'
                  ? 'P(Resistance) = 1 − (1 − P1st(θearly, βbypass, Kd)) · (1 − P2nd(θtrough, ADA, Ctrough))'
                  : 'P(Résistance) = 1 − (1 − P1ʳᵉ(θearly, βbypass, Kd)) · (1 − P2ⁿᵈ(θtrough, ADA, Ctrough))'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Calibrated Constants Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100">
          {t.tableTitle} ({params.cytokineName} / {params.antagonistName})
        </h3>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4 font-medium">{t.colParam}</th>
                <th className="py-2 px-4 font-medium">{t.colSymbol}</th>
                <th className="py-2 px-4 font-medium text-right">{t.colValue}</th>
                <th className="py-2 pl-4 font-medium">{t.colUnit}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              <tr>
                <td className="py-2.5 pr-4 font-sans text-slate-900">{t.rows.kdC}</td>
                <td className="py-2.5 px-4 text-slate-600">Kd,C = koff,C / kon,C</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">{kdC_pM.toFixed(1)}</td>
                <td className="py-2.5 pl-4 text-slate-500">pM</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans text-slate-900">{t.rows.kdA}</td>
                <td className="py-2.5 px-4 text-slate-600">Kd,A = koff,A / kon,A</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">{kdA_pM.toFixed(1)}</td>
                <td className="py-2.5 pl-4 text-slate-500">pM</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans text-slate-900">{t.rows.kdAEff}</td>
                <td className="py-2.5 px-4 text-slate-600">Kd,A,eff = Kd,A · αmut</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">{kdAEff_pM.toFixed(1)}</td>
                <td className="py-2.5 pl-4 text-slate-500">pM</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans text-slate-900">{t.rows.mw}</td>
                <td className="py-2.5 px-4 text-slate-600">MW</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">{params.molecularWeight_kDa.toFixed(1)}</td>
                <td className="py-2.5 pl-4 text-slate-500">kDa</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans text-slate-900">{t.rows.occ}</td>
                <td className="py-2.5 px-4 text-slate-600">θCR</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                  {simulation.troughOccupancy_pct.toFixed(1)} / {simulation.peakOccupancy_pct.toFixed(1)}
                </td>
                <td className="py-2.5 pl-4 text-slate-500">%</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans text-slate-900">{t.rows.adaPeak}</td>
                <td className="py-2.5 px-4 text-slate-600">ADA max</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                  {simulation.adaPeak_rel.toFixed(2)}
                </td>
                <td className="py-2.5 pl-4 text-slate-500">{t.unitAu}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
