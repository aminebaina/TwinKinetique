import React from 'react';
import { formatInterval, Language, TRANSLATIONS } from '../i18n/translations';
import { RegimenOptimizationResult, SimulationResult } from '../types/kinetics';

interface CohortAnalysisProps {
  simulation: SimulationResult;
  optimization: RegimenOptimizationResult;
  lang: Language;
  onApplyOptimized: () => void;
}

export const CohortAnalysis: React.FC<CohortAnalysisProps> = ({
  simulation,
  optimization,
  lang,
  onApplyOptimized,
}) => {
  const t = TRANSLATIONS[lang];
  const c = t.cohort;
  const { radarMetrics, cohort, attributions, params, resistanceProbability_pct } = simulation;

  const recIntervalStr = formatInterval(optimization.recommendedInterval_days, lang);
  const curIntervalStr = formatInterval(params.interval_days, lang);
  const localizedRecommendation =
    resistanceProbability_pct < 22
      ? t.recommendation.adequate(params.dose_mg, curIntervalStr)
      : optimization.requiresMechanismSwitch
        ? t.recommendation.switchNeeded(optimization.predictedResistance_pct)
        : t.recommendation.adjust(
            optimization.recommendedDose_mg,
            recIntervalStr,
            Math.abs(optimization.deltaResistance_pct)
          );

  const formatAttrValue = (id: string, fallback: string): string => {
    switch (id) {
      case 'ada':
        return lang === 'en'
          ? `${(params.adaRisk * 100).toFixed(0)}% risk`
          : `${(params.adaRisk * 100).toFixed(0)} % risque`;
      case 'bypass':
        return lang === 'en'
          ? `${(params.bypassPathway * 100).toFixed(0)}% alt. axis`
          : `${(params.bypassPathway * 100).toFixed(0)} % voie alt.`;
      case 'cytokine_load':
        return `${params.c0_pM.toFixed(0)} pM`;
      case 'mutation':
        return lang === 'en'
          ? `${params.mutationPenalty.toFixed(1)}× Kd penalty`
          : `${params.mutationPenalty.toFixed(1)}× pénalité Kd`;
      case 'clearance':
        return lang === 'en'
          ? `${params.inflammatoryClearance.toFixed(2)}× baseline`
          : `${params.inflammatoryClearance.toFixed(2)}× basal`;
      case 'dose_headroom':
        return `${params.dose_mg.toFixed(0)} mg / ${curIntervalStr}`;
      default:
        return fallback;
    }
  };

  // Radar Geometry (6 axes)
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 108;
  const nAxes = radarMetrics.length;

  const polarPoint = (angleIdx: number, pct: number) => {
    const angle = (Math.PI * 2 * angleIdx) / nAxes - Math.PI / 2;
    const r = (Math.min(100, Math.max(0, pct)) / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const patientPolygon = radarMetrics
    .map((m, idx) => {
      const pt = polarPoint(idx, m.patientValue);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  const optimalPolygon = radarMetrics
    .map((m, idx) => {
      const pt = polarPoint(idx, m.optimalThreshold);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  const maxFreq = Math.max(
    15,
    ...cohort.histogramBins.map((b) => b.frequency_pct)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Chart 1: 6-Axis Spider / Radar Calibration */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              {c.radarTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {c.radarSubtitle}
            </p>
          </div>

          <div className="flex justify-center my-2">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full max-w-[340px] h-auto"
              role="img"
              aria-label={c.radarTitle}
            >
              {/* Polygonal rings (25%, 50%, 75%, 100%) */}
              {[25, 50, 75, 100].map((ring) => {
                const pts = radarMetrics
                  .map((_, idx) => {
                    const p = polarPoint(idx, ring);
                    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={ring}
                    points={pts}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Radial axis lines */}
              {radarMetrics.map((_, idx) => {
                const edge = polarPoint(idx, 100);
                return (
                  <line
                    key={idx}
                    x1={cx}
                    y1={cy}
                    x2={edge.x}
                    y2={edge.y}
                    stroke="#CBD5E1"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Optimal Threshold Polygon */}
              <polygon
                points={optimalPolygon}
                fill="#0891B2"
                fillOpacity={0.12}
                stroke="#0891B2"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />

              {/* Patient Twin Polygon */}
              <polygon
                points={patientPolygon}
                fill="#2563EB"
                fillOpacity={0.18}
                stroke="#2563EB"
                strokeWidth={2}
              />

              {/* Axis vertices & labels */}
              {radarMetrics.map((m, idx) => {
                const pt = polarPoint(idx, m.patientValue);
                const lbl = polarPoint(idx, 126);
                const anchor =
                  Math.abs(lbl.x - cx) < 12
                    ? 'middle'
                    : lbl.x > cx
                      ? 'start'
                      : 'end';
                return (
                  <g key={m.axis}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={3.5}
                      className="fill-blue-600 stroke-white"
                      strokeWidth={1.5}
                    />
                    <text
                      x={lbl.x}
                      y={lbl.y}
                      textAnchor={anchor}
                      className="fill-slate-700 text-[10px] font-medium"
                    >
                      {c.radarAxes[m.axis] ?? m.axis}
                    </text>
                    <text
                      x={lbl.x}
                      y={lbl.y + 12}
                      textAnchor={anchor}
                      className="fill-slate-500 text-[9px] font-mono"
                    >
                      {m.rawLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-600/20 border-2 border-blue-600 inline-block" />
              {c.radarLegendPatient}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 bg-cyan-600/15 border border-dashed border-cyan-600 inline-block" />
              {c.radarLegendOptimal}
            </span>
          </div>
        </div>

        {/* Monte Carlo Cohort Histogram */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              {c.histTitlePrefix} {cohort.nSamples} {c.histTitleSuffix}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {c.histSubtitlePrefix}{' '}
              <span className="font-mono tabular-nums text-slate-900 font-medium">
                {cohort.meanResistance_pct.toFixed(1)} %
              </span>
            </p>
          </div>

          <div className="py-4 flex-1 flex flex-col justify-end">
            <div className="h-52 flex items-end gap-2 border-b border-slate-200 pb-1">
              {cohort.histogramBins.map((bin) => {
                const heightPct = (bin.frequency_pct / maxFreq) * 100;
                const barColor =
                  bin.min >= 50
                    ? 'bg-rose-600'
                    : bin.min >= 30
                      ? 'bg-amber-500'
                      : 'bg-cyan-600';
                return (
                  <div
                    key={bin.rangeLabel}
                    className="flex-1 h-full flex flex-col justify-end items-center group"
                  >
                    <span className="text-[10px] font-mono tabular-nums text-slate-500 mb-1">
                      {bin.count > 0 ? `${bin.frequency_pct.toFixed(0)}%` : ''}
                    </span>
                    <div
                      className={`w-full rounded-t-xs transition-all duration-150 ${barColor}`}
                      style={{
                        height: `${Math.max(bin.count > 0 ? 4 : 0, heightPct)}%`,
                      }}
                      title={`${bin.rangeLabel}: ${bin.count} ${c.histTitleSuffix.replace(')', '')} (${bin.frequency_pct.toFixed(1)}%)`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-10 gap-2 pt-2 text-center text-[10px] font-mono tabular-nums text-slate-500">
              {cohort.histogramBins.map((bin) => (
                <span key={bin.rangeLabel} className="truncate">
                  {bin.min}–{bin.max}
                </span>
              ))}
            </div>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              {c.histXAxis}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-4 text-xs font-mono tabular-nums">
            <div>
              <span className="text-slate-500 font-sans block">{c.ci95Label}</span>
              <span className="text-slate-900 font-semibold">
                [{cohort.ci95Lower_pct.toFixed(1)} – {cohort.ci95Upper_pct.toFixed(1)} %]
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-sans block">{c.primaryShareLabel}</span>
              <span className="text-slate-900 font-semibold">
                {cohort.primaryResistance_pct.toFixed(1)} %
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-sans block">{c.secondaryShareLabel}</span>
              <span className="text-slate-900 font-semibold">
                {cohort.secondaryResistance_pct.toFixed(1)} %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mechanistic Attribution Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            {c.attrTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {c.attrSubtitle}
          </p>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 pr-4 font-medium">{c.colFactor}</th>
                <th className="py-2.5 px-4 font-medium">{c.colPatientVal}</th>
                <th className="py-2.5 px-4 font-medium text-right">{c.colImpact}</th>
                <th className="py-2.5 pl-4 font-medium">{c.colInterpretation}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attributions.map((item) => {
                const isProtective = item.impact_pct < 0;
                const localizedAttr = c.attributions[item.id];
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 pr-4 font-medium text-slate-900 whitespace-nowrap">
                      {localizedAttr?.label ?? item.label}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {formatAttrValue(item.id, item.valueFormatted)}
                    </td>
                    <td
                      className={`py-3 px-4 font-mono tabular-nums text-right font-semibold whitespace-nowrap ${
                        isProtective
                          ? 'text-cyan-700'
                          : item.impact_pct > 10
                            ? 'text-rose-700'
                            : 'text-slate-800'
                      }`}
                    >
                      {item.impact_pct >= 0 ? '+' : ''}
                      {item.impact_pct.toFixed(1)} {c.ptsUnit}
                    </td>
                    <td className="py-3 pl-4 text-slate-600">
                      {localizedAttr?.detail ?? item.detail}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regimen Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {c.compTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {localizedRecommendation}
            </p>
          </div>
          {Math.abs(optimization.deltaResistance_pct) >= 1 && (
            <button
              type="button"
              onClick={onApplyOptimized}
              className="px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap"
            >
              {c.switchBtn}
            </button>
          )}
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4 font-medium">{c.colScenario}</th>
                <th className="py-2 px-4 font-medium">
                  {c.colRegimen} ({params.antagonistName})
                </th>
                <th className="py-2 px-4 font-medium text-right">{c.colTrough}</th>
                <th className="py-2 px-4 font-medium text-right">{c.colOcc}</th>
                <th className="py-2 pl-4 font-medium text-right">{c.colResistance}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              <tr>
                <td className="py-3 pr-4 font-sans font-medium text-slate-900">
                  {c.currentScenario}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {params.dose_mg} mg / {curIntervalStr}
                </td>
                <td className="py-3 px-4 text-right text-slate-700">
                  {simulation.troughAntagonist_nM.toFixed(1)} nM
                </td>
                <td className="py-3 px-4 text-right text-slate-700">
                  {simulation.troughOccupancy_pct.toFixed(1)} %
                </td>
                <td className="py-3 pl-4 text-right font-semibold text-slate-900">
                  {simulation.resistanceProbability_pct.toFixed(1)} %
                </td>
              </tr>
              <tr className="bg-slate-50/70">
                <td className="py-3 pr-4 font-sans font-medium text-blue-700">
                  {c.optimizedScenario}
                </td>
                <td className="py-3 px-4 text-slate-900 font-medium">
                  {optimization.recommendedDose_mg} mg / {recIntervalStr}
                </td>
                <td className="py-3 px-4 text-right text-slate-900">
                  {optimization.predictedTroughAntagonist_nM.toFixed(1)} nM
                </td>
                <td className="py-3 px-4 text-right text-slate-900">
                  {optimization.predictedTroughOcc_pct.toFixed(1)} %
                </td>
                <td className="py-3 pl-4 text-right font-semibold text-blue-700">
                  {optimization.predictedResistance_pct.toFixed(1)} %{' '}
                  <span className="text-slate-500 font-normal">
                    ({optimization.deltaResistance_pct >= 0 ? '+' : ''}
                    {optimization.deltaResistance_pct.toFixed(1)} {c.ptsUnit})
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
