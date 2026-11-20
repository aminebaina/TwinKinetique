import React, { useMemo, useState } from 'react';
import { Check, Crosshair, RotateCcw } from 'lucide-react';
import {
  autoCalibrateBenchmark,
  CLINICAL_BENCHMARKS,
  evaluateBenchmarkFit,
} from '../engine/clinicalBenchmarks';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { KineticParameters } from '../types/kinetics';

interface CalibrationPanelProps {
  currentParams: KineticParameters;
  lang: Language;
  onApplyCalibratedParams: (params: KineticParameters) => void;
}

export const CalibrationPanel: React.FC<CalibrationPanelProps> = ({
  currentParams,
  lang,
  onApplyCalibratedParams,
}) => {
  const t = TRANSLATIONS[lang];
  const c = t.calibration;
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>(
    CLINICAL_BENCHMARKS[0].id
  );
  const [unit, setUnit] = useState<'ug_mL' | 'nM'>('ug_mL');
  const [evalMode, setEvalMode] = useState<'benchmark_baseline' | 'live_twin'>(
    'benchmark_baseline'
  );
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [calibratedFeedback, setCalibratedFeedback] = useState(false);

  const benchmark = useMemo(
    () =>
      CLINICAL_BENCHMARKS.find((b) => b.id === selectedBenchmarkId) ??
      CLINICAL_BENCHMARKS[0],
    [selectedBenchmarkId]
  );

  const benchmarkText = c.benchmarks[benchmark.id];
  const formatVisitLabel = (week: number, rawLabel: string) =>
    lang === 'en'
      ? `${c.weekPrefix}${week}${rawLabel.includes('vallée') ? ` (${c.troughWord})` : ''}`
      : rawLabel;

  const evaluatedParams =
    evalMode === 'live_twin' ? currentParams : benchmark.baselineParams;

  const fit = useMemo(
    () => evaluateBenchmarkFit(benchmark, evaluatedParams),
    [benchmark, evaluatedParams]
  );

  const handleSelectBenchmark = (id: string) => {
    setSelectedBenchmarkId(id);
    setEvalMode('benchmark_baseline');
    setHoveredWeek(null);
  };

  const handleAutoCalibrate = () => {
    const baseSeed =
      evalMode === 'live_twin' ? currentParams : benchmark.baselineParams;
    const optimized = autoCalibrateBenchmark(benchmark, baseSeed);
    onApplyCalibratedParams(optimized);
    setEvalMode('live_twin');
    setCalibratedFeedback(true);
    setTimeout(() => setCalibratedFeedback(false), 2400);
  };

  const handleLoadBaselineToTwin = () => {
    onApplyCalibratedParams({ ...benchmark.baselineParams });
    setEvalMode('live_twin');
    setCalibratedFeedback(true);
    setTimeout(() => setCalibratedFeedback(false), 2400);
  };

  // Chart geometry (0 to 24 weeks = 168 days)
  const width = 920;
  const height = 350;
  const pad = { top: 24, right: 32, bottom: 42, left: 58 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxY = useMemo(() => {
    const valTraj = fit.horizonTrajectory.map((pt) =>
      unit === 'ug_mL' ? pt.ciUpper_nM / 6.757 : pt.ciUpper_nM
    );
    const valObs = fit.comparisons.map((c) =>
      unit === 'ug_mL' ? c.observed_ug_mL + c.sd_ug_mL : c.observed_nM + c.sd_nM
    );
    const rawMax = Math.max(10, ...valTraj, ...valObs);
    return Math.ceil(rawMax * 1.12);
  }, [fit, unit]);

  const xScale = (day: number) => pad.left + (day / benchmark.horizonDays) * plotW;
  const yScale = (val: number) =>
    pad.top + plotH - (Math.min(maxY, Math.max(0, val)) / maxY) * plotH;

  const toVal = (nM: number) => (unit === 'ug_mL' ? nM / 6.757 : nM);

  const curvePath = fit.horizonTrajectory
    .map((pt, idx) => {
      const x = xScale(pt.day);
      const y = yScale(toVal(pt.predicted_nM));
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const bandPath = useMemo(() => {
    if (fit.horizonTrajectory.length === 0) return '';
    const topStr = fit.horizonTrajectory
      .map((pt, i) => {
        const x = xScale(pt.day);
        const y = yScale(toVal(pt.ciUpper_nM));
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
    const botStr = [...fit.horizonTrajectory]
      .reverse()
      .map((pt) => {
        const x = xScale(pt.day);
        const y = yScale(toVal(pt.ciLower_nM));
        return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
    return `${topStr} ${botStr} Z`;
  }, [fit.horizonTrajectory, unit, maxY]);

  const activeComparison =
    fit.comparisons.find((c) => c.week === hoveredWeek) ??
    fit.comparisons[fit.comparisons.length - 1];

  // Residuals Chart Geometry
  const resH = 155;
  const resPlotH = resH - 20 - 32;
  const yResScale = (wres: number) => {
    const clamped = Math.max(-3.5, Math.min(3.5, wres));
    return 20 + resPlotH / 2 - (clamped / 3.5) * (resPlotH / 2);
  };

  return (
    <div className="space-y-6">
      {/* Benchmark Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1 max-w-3xl">
            <h2 className="text-base font-semibold text-slate-900">
              {c.title}
            </h2>
            <p className="text-xs text-slate-600">
              {benchmarkText?.cohortDescription ?? benchmark.cohortDescription}
            </p>
            <p className="text-xs font-mono text-slate-500">
              {c.sourcePrefix} {benchmark.citation}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
              <button
                type="button"
                onClick={() => setUnit('ug_mL')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  unit === 'ug_mL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                µg/mL
              </button>
              <button
                type="button"
                onClick={() => setUnit('nM')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  unit === 'nM'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                nM
              </button>
            </div>

            <button
              type="button"
              onClick={handleAutoCalibrate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap"
            >
              {calibratedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{c.calibratedDone}</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{c.autoCalibrate}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Benchmark Selector Tabs + Mode Switch */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {CLINICAL_BENCHMARKS.map((item) => {
              const active = item.id === benchmark.id;
              const itemTitle = c.benchmarks[item.id]?.title ?? item.title;
              const parts = itemTitle.split(' — ');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectBenchmark(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {parts[0]} · {parts[1]}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
              <button
                type="button"
                onClick={() => setEvalMode('benchmark_baseline')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  evalMode === 'benchmark_baseline'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.modeStudy}
              </button>
              <button
                type="button"
                onClick={() => setEvalMode('live_twin')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  evalMode === 'live_twin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.modeLive}
              </button>
            </div>
            {evalMode === 'benchmark_baseline' && (
              <button
                type="button"
                onClick={handleLoadBaselineToTwin}
                title={c.loadIntoSimTitle}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>{c.loadIntoSim}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Column Goodness-of-Fit Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200 rounded-md divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-slate-50/60">
          <div className="p-3.5">
            <span className="text-xs text-slate-500 block">{c.r2Label}</span>
            <span
              className={`mt-1 text-xl font-semibold font-mono tabular-nums block ${
                fit.rSquared >= 0.85
                  ? 'text-emerald-700'
                  : fit.rSquared >= 0.65
                    ? 'text-amber-700'
                    : 'text-rose-700'
              }`}
            >
              {fit.rSquared.toFixed(3)}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-xs text-slate-500 block">{c.rmseLabel}</span>
            <span className="mt-1 text-xl font-semibold font-mono tabular-nums text-slate-900 block">
              {unit === 'ug_mL'
                ? `${fit.rmse_ug_mL.toFixed(2)} µg/mL`
                : `${fit.rmse_nM.toFixed(1)} nM`}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-xs text-slate-500 block">{c.mapeLabel}</span>
            <span className="mt-1 text-xl font-semibold font-mono tabular-nums text-slate-900 block">
              {fit.mape_pct.toFixed(1)} %
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-xs text-slate-500 block">
              {c.predVsObsLabel}
            </span>
            <span className="mt-1 text-xl font-semibold font-mono tabular-nums text-slate-900 block">
              {fit.predictedResistance_pct.toFixed(0)} %{' '}
              <span className="text-xs font-normal text-slate-500">
                / {benchmark.observedFailureRate_pct.toFixed(0)} % {c.obsShort}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* VPC Calibration Chart (0–24 Weeks) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {c.vpcTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {c.vpcSubtitle}
            </p>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono tabular-nums flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-900">
              {formatVisitLabel(activeComparison.week, activeComparison.label)}
            </span>
            <span className="text-slate-700">
              {c.obsPrefix}{' '}
              {unit === 'ug_mL'
                ? `${activeComparison.observed_ug_mL.toFixed(1)} ± ${activeComparison.sd_ug_mL.toFixed(1)} µg/mL`
                : `${activeComparison.observed_nM.toFixed(1)} ± ${activeComparison.sd_nM.toFixed(1)} nM`}
            </span>
            <span className="text-blue-700">
              {c.predPrefix}{' '}
              {unit === 'ug_mL'
                ? `${activeComparison.predicted_ug_mL.toFixed(2)} µg/mL`
                : `${activeComparison.predicted_nM.toFixed(1)} nM`}
            </span>
            <span className="text-slate-500">
              WRES: {activeComparison.standardizedResidual >= 0 ? '+' : ''}
              {activeComparison.standardizedResidual.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto mt-3">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full min-w-[640px] h-auto select-none"
            role="img"
            aria-label={c.vpcTitle}
          >
            {/* Horizontal grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const val = frac * maxY;
              const y = yScale(val);
              return (
                <g key={frac}>
                  <line
                    x1={pad.left}
                    y1={y}
                    x2={width - pad.right}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth={1}
                  />
                  <text
                    x={pad.left - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="fill-slate-500 text-[10px] font-mono"
                  >
                    {val.toFixed(unit === 'ug_mL' ? 1 : 0)}
                  </text>
                </g>
              );
            })}

            {/* Vertical grid (Weeks 0, 4, 8, 12, 16, 20, 24) */}
            {[0, 4, 8, 12, 16, 20, 24].map((wk) => {
              const x = xScale(wk * 7);
              return (
                <g key={wk}>
                  <line
                    x1={x}
                    y1={pad.top}
                    x2={x}
                    y2={pad.top + plotH}
                    stroke="#F1F5F9"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={height - 14}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] font-mono"
                  >
                    {c.weekPrefix}{wk}
                  </text>
                </g>
              );
            })}

            {/* Y-axis label */}
            <text
              x={16}
              y={pad.top + plotH / 2}
              textAnchor="middle"
              transform={`rotate(-90, 16, ${pad.top + plotH / 2})`}
              className="fill-slate-600 text-[11px] font-medium"
            >
              {c.yAxisLabel} ({unit === 'ug_mL' ? 'µg/mL' : 'nM'})
            </text>

            {/* 5th-95th VPC Shaded Band */}
            <path d={bandPath} fill="#2563EB" fillOpacity={0.12} />

            {/* Predicted Trajectory */}
            <path
              d={curvePath}
              fill="none"
              stroke="#2563EB"
              strokeWidth={2}
            />

            {/* Empirical Observations with ± 1 SD Error Bars */}
            {fit.comparisons.map((obs) => {
              const cx = xScale(obs.day);
              const val = unit === 'ug_mL' ? obs.observed_ug_mL : obs.observed_nM;
              const sd = unit === 'ug_mL' ? obs.sd_ug_mL : obs.sd_nM;
              const cy = yScale(val);
              const yTop = yScale(val + sd);
              const yBot = yScale(Math.max(0, val - sd));
              const isHovered = hoveredWeek === obs.week;

              return (
                <g
                  key={obs.week}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredWeek(obs.week)}
                  onMouseLeave={() => setHoveredWeek(null)}
                >
                  <line
                    x1={cx}
                    y1={yTop}
                    x2={cx}
                    y2={yBot}
                    stroke="#0F172A"
                    strokeWidth={1.5}
                  />
                  <line
                    x1={cx - 4}
                    y1={yTop}
                    x2={cx + 4}
                    y2={yTop}
                    stroke="#0F172A"
                    strokeWidth={1.5}
                  />
                  <line
                    x1={cx - 4}
                    y1={yBot}
                    x2={cx + 4}
                    y2={yBot}
                    stroke="#0F172A"
                    strokeWidth={1.5}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 4.5}
                    className="fill-rose-600 stroke-white"
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}

            <rect
              x={pad.left}
              y={pad.top}
              width={plotW}
              height={plotH}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth={1}
            />
          </svg>
        </div>

        <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-0.5 bg-blue-600 inline-block" />
            {c.legendPred}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-2.5 bg-blue-600/15 border border-blue-300 inline-block" />
            {c.legendVpc}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            {c.legendObs}
          </span>
        </div>
      </div>

      {/* Standardized Residuals (WRES) + Point-by-Point Table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              {c.wresTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {c.wresSubtitle}
            </p>
          </div>
          <div className="mt-3">
            <svg
              viewBox={`0 0 460 ${resH}`}
              className="w-full h-auto"
              role="img"
              aria-label={c.wresTitle}
            >
              {/* ±2 SD Acceptable Band */}
              <rect
                x={44}
                y={yResScale(2)}
                width={396}
                height={yResScale(-2) - yResScale(2)}
                fill="#0891B2"
                fillOpacity={0.08}
              />
              {[-2, 0, 2].map((val) => (
                <g key={val}>
                  <line
                    x1={44}
                    y1={yResScale(val)}
                    x2={440}
                    y2={yResScale(val)}
                    stroke={val === 0 ? '#94A3B8' : '#67E8F9'}
                    strokeDasharray={val === 0 ? undefined : '4 3'}
                    strokeWidth={1}
                  />
                  <text
                    x={36}
                    y={yResScale(val) + 3.5}
                    textAnchor="end"
                    className="fill-slate-500 text-[10px] font-mono"
                  >
                    {val > 0 ? `+${val}` : val}
                  </text>
                </g>
              ))}
              {fit.comparisons.map((obs) => {
                const x = 44 + (obs.day / benchmark.horizonDays) * 396;
                const y = yResScale(obs.standardizedResidual);
                const outside = Math.abs(obs.standardizedResidual) > 2;
                return (
                  <g key={obs.week}>
                    <line
                      x1={x}
                      y1={yResScale(0)}
                      x2={x}
                      y2={y}
                      stroke={outside ? '#E11D48' : '#0F172A'}
                      strokeWidth={1.5}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={4}
                      className={outside ? 'fill-rose-600' : 'fill-slate-900'}
                    />
                    <text
                      x={x}
                      y={resH - 8}
                      textAnchor="middle"
                      className="fill-slate-500 text-[10px] font-mono"
                    >
                      {c.weekPrefix}{obs.week}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              {c.visitsTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {c.activeParamsPrefix} t₁/₂ = {evaluatedParams.halfLife_days.toFixed(1)}{' '}
              {t.ribbon.dayShort} · ADA = {(evaluatedParams.adaRisk * 100).toFixed(0)} % · TMDD ={' '}
              {evaluatedParams.inflammatoryClearance.toFixed(2)}×
            </p>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3 font-medium">{c.colVisit}</th>
                  <th className="py-2 px-3 font-medium text-right">
                    {c.colObsSd}
                  </th>
                  <th className="py-2 px-3 font-medium text-right">{c.colPredOde}</th>
                  <th className="py-2 pl-3 font-medium text-right">WRES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {fit.comparisons.map((row) => {
                  const outside = Math.abs(row.standardizedResidual) > 2;
                  return (
                    <tr
                      key={row.week}
                      onMouseEnter={() => setHoveredWeek(row.week)}
                      onMouseLeave={() => setHoveredWeek(null)}
                      className="hover:bg-slate-50"
                    >
                      <td className="py-2 pr-3 font-sans font-medium text-slate-900">
                        {formatVisitLabel(row.week, row.label)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        {unit === 'ug_mL'
                          ? `${row.observed_ug_mL.toFixed(1)} ± ${row.sd_ug_mL.toFixed(1)}`
                          : `${row.observed_nM.toFixed(1)} ± ${row.sd_nM.toFixed(1)}`}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-700">
                        {unit === 'ug_mL'
                          ? row.predicted_ug_mL.toFixed(2)
                          : row.predicted_nM.toFixed(1)}
                      </td>
                      <td
                        className={`py-2 pl-3 text-right font-medium ${
                          outside ? 'text-rose-700' : 'text-slate-700'
                        }`}
                      >
                        {row.standardizedResidual >= 0 ? '+' : ''}
                        {row.standardizedResidual.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
