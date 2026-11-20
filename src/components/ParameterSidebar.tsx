import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { formatInterval, Language, TRANSLATIONS } from '../i18n/translations';
import {
  BindingMechanism,
  KineticParameters,
  RegimenOptimizationResult,
} from '../types/kinetics';

interface ParameterSidebarProps {
  params: KineticParameters;
  optimization: RegimenOptimizationResult;
  currentResistancePct: number;
  lang: Language;
  onChangeParam: <K extends keyof KineticParameters>(
    key: K,
    value: KineticParameters[K]
  ) => void;
  onApplyOptimized: () => void;
}

interface SliderControlProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  decimals?: number;
  hint?: string;
  clickToEditTitle: string;
  onChange: (val: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  decimals = 1,
  hint,
  clickToEditTitle,
  onChange,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commitDraft = () => {
    const parsed = parseFloat(draft);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
    }
    setEditing(false);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="text-xs font-medium text-slate-700 truncate"
          title={hint || label}
        >
          {label}
        </label>
        {editing ? (
          <input
            type="number"
            value={draft}
            min={min}
            max={max}
            step={step}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitDraft();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="w-20 px-1.5 py-0.5 text-right text-xs font-mono tabular-nums border border-blue-500 rounded bg-white text-slate-900 focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(value.toFixed(decimals));
              setEditing(true);
            }}
            title={clickToEditTitle}
            className="text-xs font-mono tabular-nums font-medium text-slate-900 hover:text-blue-700 px-1 py-0.5 rounded hover:bg-slate-100 transition-colors shrink-0"
          >
            {value.toFixed(decimals)}{' '}
            <span className="text-slate-400 font-normal">{unit}</span>
          </button>
        )}
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="precision-slider"
      />
      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-400">
        <span>{min}</span>
        {hint && <span className="truncate px-2 text-slate-400 font-sans">{hint}</span>}
        <span>{max}</span>
      </div>
    </div>
  );
};

export const ParameterSidebar: React.FC<ParameterSidebarProps> = ({
  params,
  optimization,
  currentResistancePct,
  lang,
  onChangeParam,
  onApplyOptimized,
}) => {
  const t = TRANSLATIONS[lang];
  const s = t.sidebar;
  const [openGroups, setOpenGroups] = useState({
    cytokine: true,
    antagonist: true,
    escape: true,
  });

  const toggleGroup = (key: keyof typeof openGroups) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const recIntervalStr = formatInterval(optimization.recommendedInterval_days, lang);
  const curIntervalStr = formatInterval(params.interval_days, lang);
  const localizedRecommendation =
    currentResistancePct < 22
      ? t.recommendation.adequate(params.dose_mg, curIntervalStr)
      : optimization.requiresMechanismSwitch
        ? t.recommendation.switchNeeded(optimization.predictedResistance_pct)
        : t.recommendation.adjust(
            optimization.recommendedDose_mg,
            recIntervalStr,
            Math.abs(optimization.deltaResistance_pct)
          );

  return (
    <aside
      aria-label={s.ariaLabel}
      className="w-full lg:w-[340px] xl:w-[360px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between"
    >
      <div className="divide-y divide-slate-200">
        {/* Group 1: Cytokine & Receptor Kinetics */}
        <div>
          <button
            type="button"
            onClick={() => toggleGroup('cytokine')}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
          >
            <span className="text-xs font-semibold text-slate-900 tracking-wide">
              {s.group1Prefix} ({params.cytokineName})
            </span>
            {openGroups.cytokine ? (
              <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
            )}
          </button>
          {openGroups.cytokine && (
            <div className="px-5 pb-5 pt-1 space-y-4">
              <SliderControl
                id="c0_pM"
                label={s.c0Label}
                value={params.c0_pM}
                min={20}
                max={450}
                step={5}
                unit="pM"
                decimals={0}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('c0_pM', v)}
              />
              <SliderControl
                id="kon_C"
                label={s.konCLabel}
                value={params.kon_C}
                min={2}
                max={40}
                step={0.5}
                unit="×10⁵ M⁻¹s⁻¹"
                decimals={1}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('kon_C', v)}
              />
              <SliderControl
                id="koff_C"
                label={s.koffCLabel}
                value={params.koff_C}
                min={0.5}
                max={12}
                step={0.1}
                unit="×10⁻⁴ s⁻¹"
                decimals={1}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('koff_C', v)}
              />
              <SliderControl
                id="rTot_pM"
                label={`${s.densityPrefix} ${params.receptorName}`}
                value={params.rTot_pM}
                min={40}
                max={500}
                step={10}
                unit="pM"
                decimals={0}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('rTot_pM', v)}
              />
              <SliderControl
                id="feedbackGain"
                label={s.feedbackLabel}
                value={params.feedbackGain}
                min={0}
                max={2.5}
                step={0.05}
                unit="×"
                decimals={2}
                hint={s.feedbackHint}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('feedbackGain', v)}
              />
            </div>
          )}
        </div>

        {/* Group 2: Antagonist & Dosing Regimen */}
        <div>
          <button
            type="button"
            onClick={() => toggleGroup('antagonist')}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
          >
            <span className="text-xs font-semibold text-slate-900 tracking-wide">
              {s.group2Prefix} ({params.antagonistName})
            </span>
            {openGroups.antagonist ? (
              <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
            )}
          </button>
          {openGroups.antagonist && (
            <div className="px-5 pb-5 pt-1 space-y-4">
              {/* Mechanism Selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-700 block">
                  {s.mechanismLabel}
                </span>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-md">
                  {(
                    [
                      { id: 'ligand_neutralizer', label: s.mechNeutralizerShort },
                      { id: 'receptor_antagonist', label: s.mechReceptorShort },
                    ] as { id: BindingMechanism; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeParam('mechanism', opt.id)}
                      className={`px-2 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                        params.mechanism === opt.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <SliderControl
                id="dose_mg"
                label={s.doseLabel}
                value={params.dose_mg}
                min={10}
                max={600}
                step={5}
                unit="mg"
                decimals={0}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('dose_mg', v)}
              />
              <SliderControl
                id="interval_days"
                label={s.intervalLabel}
                value={params.interval_days}
                min={0.5}
                max={28}
                step={0.5}
                unit={s.unitDays}
                decimals={1}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('interval_days', v)}
              />
              <SliderControl
                id="halfLife_days"
                label={s.halfLifeLabel}
                value={params.halfLife_days}
                min={0.2}
                max={35}
                step={0.2}
                unit={s.unitDays}
                decimals={1}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('halfLife_days', v)}
              />
              <SliderControl
                id="kon_A"
                label={s.konALabel}
                value={params.kon_A}
                min={1}
                max={40}
                step={0.5}
                unit="×10⁵ M⁻¹s⁻¹"
                decimals={1}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('kon_A', v)}
              />
              <SliderControl
                id="koff_A"
                label={s.koffALabel}
                value={params.koff_A}
                min={0.2}
                max={10}
                step={0.1}
                unit="×10⁻⁴ s⁻¹"
                decimals={1}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('koff_A', v)}
              />
            </div>
          )}
        </div>

        {/* Group 3: Patient Digital Twin Escape Factors */}
        <div>
          <button
            type="button"
            onClick={() => toggleGroup('escape')}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
          >
            <span className="text-xs font-semibold text-slate-900 tracking-wide">
              {s.group3}
            </span>
            {openGroups.escape ? (
              <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
            )}
          </button>
          {openGroups.escape && (
            <div className="px-5 pb-5 pt-1 space-y-4">
              <SliderControl
                id="adaRisk"
                label={s.adaLabel}
                value={params.adaRisk}
                min={0}
                max={1}
                step={0.02}
                unit={s.unitIndex}
                decimals={2}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('adaRisk', v)}
              />
              <SliderControl
                id="mutationPenalty"
                label={s.mutationLabel}
                value={params.mutationPenalty}
                min={1}
                max={15}
                step={0.2}
                unit="×"
                decimals={1}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('mutationPenalty', v)}
              />
              <SliderControl
                id="bypassPathway"
                label={s.bypassLabel}
                value={params.bypassPathway}
                min={0}
                max={0.65}
                step={0.02}
                unit={s.unitFraction}
                decimals={2}
                hint={s.bypassHint}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('bypassPathway', v)}
              />
              <SliderControl
                id="inflammatoryClearance"
                label={s.clearanceLabel}
                value={params.inflammatoryClearance}
                min={1}
                max={3.5}
                step={0.05}
                unit="×"
                decimals={2}
                clickToEditTitle={s.clickToEdit}
                onChange={(v) => onChangeParam('inflammatoryClearance', v)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Optimization Summary Box (hairline border, no thick left bar) */}
      <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900">
            {s.recommendationTitle}
          </span>
          <span className="text-xs font-mono tabular-nums text-blue-700 font-medium">
            {optimization.recommendedDose_mg} mg / {recIntervalStr}
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {localizedRecommendation}
        </p>
        {Math.abs(optimization.deltaResistance_pct) >= 1 && (
          <button
            type="button"
            onClick={onApplyOptimized}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <span>
              {s.applyPrefix} ({optimization.predictedResistance_pct.toFixed(1)} %{' '}
              {s.resistanceSuffix})
            </span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </aside>
  );
};
