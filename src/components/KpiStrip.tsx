import React from 'react';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { SimulationResult } from '../types/kinetics';

interface KpiStripProps {
  simulation: SimulationResult;
  lang: Language;
}

export const KpiStrip: React.FC<KpiStripProps> = ({ simulation, lang }) => {
  const t = TRANSLATIONS[lang].kpi;
  const {
    resistanceProbability_pct,
    primaryResistance_pct,
    secondaryResistance_pct,
    cohort,
    troughOccupancy_pct,
    peakOccupancy_pct,
    kdAEff_pM,
    kdC_pM,
    affinityRatio,
    troughAntagonist_nM,
    targetTrough_nM,
    riskLevel,
  } = simulation;

  const resTone =
    riskLevel === 'high'
      ? 'text-rose-700'
      : riskLevel === 'moderate'
        ? 'text-amber-700'
        : 'text-emerald-700';

  const occTone =
    troughOccupancy_pct > 25
      ? 'text-rose-700'
      : troughOccupancy_pct > 15
        ? 'text-amber-700'
        : 'text-slate-900';

  const troughOk = troughAntagonist_nM >= targetTrough_nM;
  const ciPrefix = lang === 'en' ? '95% CI' : 'IC95';

  return (
    <section
      aria-label={t.ariaLabel}
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-white border-b border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200"
    >
      {/* KPI 1: Therapeutic Resistance Probability */}
      <div className="px-5 py-4">
        <p className="text-xs font-medium text-slate-500 tracking-wide">
          {t.resistanceTitle}
        </p>
        <div className="mt-1.5 flex items-baseline">
          <span className={`text-2xl font-semibold font-mono tabular-nums ${resTone}`}>
            {resistanceProbability_pct.toFixed(1)}
          </span>
          <span className="text-xs font-mono text-slate-400 ml-1.5">%</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500">
          <span>
            {ciPrefix} [{cohort.ci95Lower_pct.toFixed(0)}–{cohort.ci95Upper_pct.toFixed(0)}%]
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {t.primaryShort} {primaryResistance_pct.toFixed(0)}% / {t.secondaryShort}{' '}
            {secondaryResistance_pct.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* KPI 2: Cytokine Receptor Occupancy */}
      <div className="px-5 py-4">
        <p className="text-xs font-medium text-slate-500 tracking-wide">
          {t.occupancyTitle}
        </p>
        <div className="mt-1.5 flex items-baseline">
          <span className={`text-2xl font-semibold font-mono tabular-nums ${occTone}`}>
            {troughOccupancy_pct.toFixed(1)}
          </span>
          <span className="text-xs font-mono text-slate-400 ml-1.5">%</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500">
          <span>
            {t.peakLabel} {peakOccupancy_pct.toFixed(1)} %
          </span>
          <span aria-hidden="true">·</span>
          <span>{t.targetLt}</span>
        </div>
      </div>

      {/* KPI 3: Competitive Affinity Ratio */}
      <div className="px-5 py-4">
        <p className="text-xs font-medium text-slate-500 tracking-wide">
          {t.affinityTitle}
        </p>
        <div className="mt-1.5 flex items-baseline">
          <span className="text-2xl font-semibold font-mono tabular-nums text-slate-900">
            {affinityRatio.toFixed(2)}
          </span>
          <span className="text-xs font-mono text-slate-400 ml-1.5">×</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500">
          <span>Kd A {kdAEff_pM.toFixed(1)} pM</span>
          <span aria-hidden="true">·</span>
          <span>Kd C {kdC_pM.toFixed(0)} pM</span>
        </div>
      </div>

      {/* KPI 4: Trough Antagonist Concentration */}
      <div className="px-5 py-4">
        <p className="text-xs font-medium text-slate-500 tracking-wide">
          {t.troughTitle}
        </p>
        <div className="mt-1.5 flex items-baseline">
          <span
            className={`text-2xl font-semibold font-mono tabular-nums ${
              troughOk ? 'text-blue-700' : 'text-amber-700'
            }`}
          >
            {troughAntagonist_nM.toFixed(1)}
          </span>
          <span className="text-xs font-mono text-slate-400 ml-1.5">nM</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500">
          <span>
            {t.thresholdGe} {targetTrough_nM.toFixed(1)} nM
          </span>
          <span aria-hidden="true">·</span>
          <span className={troughOk ? 'text-emerald-700' : 'text-amber-700'}>
            {troughOk ? t.exposureCovered : t.underExposed}
          </span>
        </div>
      </div>
    </section>
  );
};
