import React from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { CYTOKINE_PRESETS } from '../engine/kineticsModel';
import { formatInterval, Language, TRANSLATIONS } from '../i18n/translations';
import { KineticParameters, RiskLevel } from '../types/kinetics';

interface TelemetryRibbonProps {
  params: KineticParameters;
  riskLevel: RiskLevel;
  lang: Language;
  onChangeLanguage: (lang: Language) => void;
  onSelectPreset: (presetId: string) => void;
  onResetPreset: () => void;
  onApplyOptimization: () => void;
}

const RISK_STYLE: Record<RiskLevel, { glyph: string; textClass: string }> = {
  low: { glyph: '●', textClass: 'text-emerald-700' },
  moderate: { glyph: '▲', textClass: 'text-amber-700' },
  high: { glyph: '✖', textClass: 'text-rose-700' },
};

export const TelemetryRibbon: React.FC<TelemetryRibbonProps> = ({
  params,
  riskLevel,
  lang,
  onChangeLanguage,
  onSelectPreset,
  onResetPreset,
  onApplyOptimization,
}) => {
  const t = TRANSLATIONS[lang];
  const riskMeta = RISK_STYLE[riskLevel];
  const riskLabel = t.ribbon.riskLabels[riskLevel];
  const presetMeta = t.presets[params.presetId];
  const indication = presetMeta?.indication ?? params.indication;

  const mechanismLabel =
    params.mechanism === 'ligand_neutralizer'
      ? t.ribbon.mechNeutralizer
      : t.ribbon.mechReceptor;

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <label
            htmlFor="preset-selector"
            className="text-xs font-medium text-slate-500 whitespace-nowrap"
          >
            {t.ribbon.axisLabel}
          </label>
          <select
            id="preset-selector"
            value={params.presetId}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="h-8 px-2.5 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {CYTOKINE_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {t.presets[preset.id]?.label ?? preset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 truncate">
          <span>{indication}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-700">
            {params.dose_mg} mg / {formatInterval(params.interval_days, lang)}
          </span>
          <span aria-hidden="true">·</span>
          <span>{mechanismLabel}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <div
          className={`inline-flex items-center gap-1.5 text-xs font-semibold font-mono tabular-nums whitespace-nowrap ${riskMeta.textClass}`}
          aria-live="polite"
        >
          <span aria-hidden="true">{riskMeta.glyph}</span>
          <span>
            {t.ribbon.statusPrefix}: {riskLabel}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200" aria-hidden="true" />

        <button
          type="button"
          onClick={onApplyOptimization}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.ribbon.optimizeBtn}</span>
        </button>

        <button
          type="button"
          onClick={onResetPreset}
          title={t.ribbon.resetTitle}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.ribbon.resetBtn}</span>
        </button>

        <div
          role="group"
          aria-label="Language selector"
          className="flex items-center gap-0.5 p-0.5 bg-slate-200/80 rounded-md shrink-0"
        >
          {(['en', 'fr'] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onChangeLanguage(code)}
              className={`px-2 py-1 text-[11px] font-mono font-semibold uppercase rounded transition-colors whitespace-nowrap ${
                lang === code
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
