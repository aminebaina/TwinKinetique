import React, { useMemo, useState } from 'react';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { SimulationResult } from '../types/kinetics';

interface KineticsChartProps {
  simulation: SimulationResult;
  lang: Language;
}

export const KineticsChart: React.FC<KineticsChartProps> = ({ simulation, lang }) => {
  const t = TRANSLATIONS[lang].kineticsChart;
  const unitAu = TRANSLATIONS[lang].equations.unitAu;
  const { timeSeries, params, targetTrough_nM } = simulation;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [layers, setLayers] = useState({
    ci95: true,
    neutralization: true,
    antagonistPk: true,
    effectiveSignal: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Chart dimensions
  const width = 920;
  const height = 380;
  const pad = { top: 24, right: 64, bottom: 40, left: 54 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxAntagonistNm = useMemo(() => {
    const peak = Math.max(
      10,
      ...timeSeries.map((pt) => pt.freeAntagonist_nM)
    );
    return Math.ceil(peak * 1.15);
  }, [timeSeries]);

  const maxCytokinePm = useMemo(() => {
    const peak = Math.max(50, ...timeSeries.map((pt) => pt.freeCytokine_pM));
    return Math.ceil(peak * 1.15);
  }, [timeSeries]);

  const xScale = (day: number) => pad.left + (day / 28) * plotW;
  const yPctScale = (pct: number) =>
    pad.top + plotH - (Math.min(100, Math.max(0, pct)) / 100) * plotH;
  const yPkScale = (nm: number) =>
    pad.top + plotH - (Math.min(maxAntagonistNm, Math.max(0, nm)) / maxAntagonistNm) * plotH;

  const buildPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    return pts
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(' ');
  };

  const buildBandPath = (
    upper: { x: number; y: number }[],
    lower: { x: number; y: number }[]
  ) => {
    if (upper.length === 0) return '';
    const topStr = upper
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(' ');
    const botStr = [...lower]
      .reverse()
      .map((pt) => `L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(' ');
    return `${topStr} ${botStr} Z`;
  };

  const occPoints = timeSeries.map((pt) => ({
    x: xScale(pt.day),
    y: yPctScale(pt.cytokineOccupancy_pct),
  }));
  const occUpperPoints = timeSeries.map((pt) => ({
    x: xScale(pt.day),
    y: yPctScale(pt.occUpper_pct),
  }));
  const occLowerPoints = timeSeries.map((pt) => ({
    x: xScale(pt.day),
    y: yPctScale(pt.occLower_pct),
  }));
  const signalPoints = timeSeries.map((pt) => ({
    x: xScale(pt.day),
    y: yPctScale(pt.effectiveSignal_pct),
  }));
  const neutPoints = timeSeries.map((pt) => ({
    x: xScale(pt.day),
    y: yPctScale(pt.antagonistNeutralization_pct),
  }));
  const pkPoints = timeSeries.map((pt) => ({
    x: xScale(pt.day),
    y: yPkScale(pt.freeAntagonist_nM),
  }));

  // Dose administration markers along day axis
  const doseDays = useMemo(() => {
    const days: number[] = [];
    const step = Math.max(0.5, params.interval_days);
    for (let d = 0; d <= 28; d += step) {
      days.push(Number(d.toFixed(2)));
    }
    return days;
  }, [params.interval_days]);

  const activePoint =
    hoverIdx !== null
      ? timeSeries[Math.min(timeSeries.length - 1, Math.max(0, hoverIdx))]
      : timeSeries[timeSeries.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    const clampedDay = Math.min(28, Math.max(0, ((relX - pad.left) / plotW) * 28));
    const idx = Math.round((clampedDay / 28) * (timeSeries.length - 1));
    setHoverIdx(idx);
  };

  // Secondary chart (Free Cytokine + ADA trajectory)
  const subH = 185;
  const subPlotH = subH - 24 - 34;
  const yCytScale = (pm: number) =>
    24 + subPlotH - (Math.min(maxCytokinePm, Math.max(0, pm)) / maxCytokinePm) * subPlotH;
  const yAdaScale = (ada: number) =>
    24 + subPlotH - (Math.min(3.0, Math.max(0, ada)) / 3.0) * subPlotH;

  const cytPoints = timeSeries.map((pt) => ({
    x: xScale(pt.day),
    y: yCytScale(pt.freeCytokine_pM),
  }));
  const adaPoints = timeSeries.map((pt) => ({
    x: xScale(pt.day),
    y: yAdaScale(pt.adaLevel_rel),
  }));

  return (
    <div className="space-y-6">
      {/* Primary Dual-Axis PK/PD Plot */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {t.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.subtitle} ({params.cytokineName} ↔ {params.antagonistName}) · {t.legend.ci95Band}
            </p>
          </div>

          {/* Interactive Layer Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { key: 'ci95', label: t.layers.ci95 },
                { key: 'effectiveSignal', label: t.layers.effectiveSignal },
                { key: 'neutralization', label: t.layers.neutralization },
                { key: 'antagonistPk', label: t.layers.antagonistPk },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleLayer(item.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap ${
                  layers[item.key]
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Monospace Crosshair Readout HUD */}
        <div className="mt-3 mb-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-center justify-between gap-4 text-xs font-mono tabular-nums">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-900 font-semibold">
              t = {t.hud.dayPrefix} {activePoint.day.toFixed(1)} ({activePoint.hour} h)
            </span>
            <span className="text-rose-700">
              θCR: {activePoint.cytokineOccupancy_pct.toFixed(1)}%
            </span>
            <span className="text-amber-700">
              {t.hud.signalEff}: {activePoint.effectiveSignal_pct.toFixed(1)}%
            </span>
            <span className="text-cyan-700">
              {t.hud.neutral}: {activePoint.antagonistNeutralization_pct.toFixed(1)}%
            </span>
            <span className="text-blue-700">
              [{params.antagonistName}]: {activePoint.freeAntagonist_nM.toFixed(1)} nM
            </span>
          </div>
          <span className="text-slate-400 hidden sm:inline">
            {hoverIdx !== null ? t.hud.probeActive : t.hud.cycleEnd}
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full min-w-[640px] h-auto cursor-crosshair select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIdx(null)}
            role="img"
            aria-label={t.title}
          >
            {/* Horizontal grid lines */}
            {[0, 20, 40, 60, 80, 100].map((pct) => {
              const y = yPctScale(pct);
              return (
                <g key={pct}>
                  <line
                    x1={pad.left}
                    y1={y}
                    x2={width - pad.right}
                    y2={y}
                    stroke={pct === 20 ? '#FCA5A5' : '#E2E8F0'}
                    strokeDasharray={pct === 20 ? '4 3' : undefined}
                    strokeWidth={1}
                  />
                  <text
                    x={pad.left - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="fill-slate-500 text-[10px] font-mono"
                  >
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Threshold annotation */}
            <text
              x={pad.left + 8}
              y={yPctScale(20) - 5}
              className="fill-rose-600 text-[10px] font-mono font-medium"
            >
              {t.escapeThreshold}
            </text>

            {/* Vertical grid lines (every 7 days) */}
            {[0, 7, 14, 21, 28].map((day) => {
              const x = xScale(day);
              return (
                <g key={day}>
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
                    y={height - 12}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] font-mono"
                  >
                    {t.hud.dayPrefix}{day}
                  </text>
                </g>
              );
            })}

            {/* Right Y-axis ticks (Antagonist nM) */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const val = frac * maxAntagonistNm;
              const y = yPkScale(val);
              return (
                <text
                  key={frac}
                  x={width - pad.right + 8}
                  y={y + 3.5}
                  textAnchor="start"
                  className="fill-blue-600 text-[10px] font-mono"
                >
                  {val.toFixed(0)} nM
                </text>
              );
            })}

            {/* Target Trough reference line on PK axis if inside range */}
            {layers.antagonistPk && targetTrough_nM < maxAntagonistNm && (
              <line
                x1={pad.left}
                y1={yPkScale(targetTrough_nM)}
                x2={width - pad.right}
                y2={yPkScale(targetTrough_nM)}
                stroke="#93C5FD"
                strokeDasharray="2 3"
                strokeWidth={1}
              />
            )}

            {/* Dosing tick markers on X-axis */}
            {doseDays.map((d) => (
              <path
                key={d}
                d={`M ${xScale(d)} ${pad.top + plotH} l -3 6 l 6 0 z`}
                className="fill-blue-600"
              />
            ))}

            {/* 95% CI Cohort Band */}
            {layers.ci95 && (
              <path
                d={buildBandPath(occUpperPoints, occLowerPoints)}
                fill="#E11D48"
                fillOpacity={0.11}
              />
            )}

            {/* Antagonist PK Curve (Right Axis) */}
            {layers.antagonistPk && (
              <path
                d={buildPath(pkPoints)}
                fill="none"
                stroke="#2563EB"
                strokeWidth={1.75}
                strokeDasharray="5 3"
              />
            )}

            {/* Antagonist Neutralization Curve */}
            {layers.neutralization && (
              <path
                d={buildPath(neutPoints)}
                fill="none"
                stroke="#0891B2"
                strokeWidth={2}
              />
            )}

            {/* Effective Bypass Signal Curve */}
            {layers.effectiveSignal && (
              <path
                d={buildPath(signalPoints)}
                fill="none"
                stroke="#D97706"
                strokeWidth={1.75}
                strokeDasharray="2 2"
              />
            )}

            {/* Primary Cytokine Receptor Occupancy Curve */}
            <path
              d={buildPath(occPoints)}
              fill="none"
              stroke="#E11D48"
              strokeWidth={2.5}
            />

            {/* Axes border */}
            <rect
              x={pad.left}
              y={pad.top}
              width={plotW}
              height={plotH}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth={1}
            />

            {/* Hover crosshair */}
            {hoverIdx !== null && (
              <g>
                <line
                  x1={xScale(activePoint.day)}
                  y1={pad.top}
                  x2={xScale(activePoint.day)}
                  y2={pad.top + plotH}
                  stroke="#0F172A"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <circle
                  cx={xScale(activePoint.day)}
                  cy={yPctScale(activePoint.cytokineOccupancy_pct)}
                  r={4}
                  className="fill-rose-600 stroke-white"
                  strokeWidth={1.5}
                />
                {layers.neutralization && (
                  <circle
                    cx={xScale(activePoint.day)}
                    cy={yPctScale(activePoint.antagonistNeutralization_pct)}
                    r={3.5}
                    className="fill-cyan-600 stroke-white"
                    strokeWidth={1.5}
                  />
                )}
                {layers.antagonistPk && (
                  <circle
                    cx={xScale(activePoint.day)}
                    cy={yPkScale(activePoint.freeAntagonist_nM)}
                    r={3.5}
                    className="fill-blue-600 stroke-white"
                    strokeWidth={1.5}
                  />
                )}
              </g>
            )}
          </svg>
        </div>

        {/* Clean inline legend */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-0.5 bg-rose-600 inline-block" />
            {params.cytokineName} {t.legend.occupancyPrefix}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-0.5 bg-amber-600 inline-block border-t border-dashed border-amber-600" />
            {t.legend.signalBypass}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-0.5 bg-cyan-600 inline-block" />
            {params.antagonistName} {t.legend.neutralPrefix}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-0.5 bg-blue-600 inline-block" />
            [{params.antagonistName}] {t.legend.concPrefix}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-2.5 bg-rose-600/15 border border-rose-300 inline-block" />
            {t.legend.ci95Band}
          </span>
        </div>
      </div>

      {/* Secondary Panel: Free Cytokine & Emerging ADA Dynamics */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {t.subTitle} ([{params.cytokineName}])
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.subSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <span className="text-slate-700">
              [{params.cytokineName}] {t.cytEndLabel}: {activePoint.freeCytokine_pM.toFixed(1)} pM
            </span>
            <span className="text-violet-700">
              {t.adaIndexLabel}: {activePoint.adaLevel_rel.toFixed(2)} {unitAu}
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto mt-3">
          <svg
            viewBox={`0 0 ${width} ${subH}`}
            className="w-full min-w-[640px] h-auto select-none"
            role="img"
            aria-label={t.subTitle}
          >
            {[0, 0.5, 1].map((frac) => {
              const cytVal = frac * maxCytokinePm;
              const y = yCytScale(cytVal);
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
                    {cytVal.toFixed(0)} pM
                  </text>
                  <text
                    x={width - pad.right + 8}
                    y={y + 3.5}
                    textAnchor="start"
                    className="fill-violet-700 text-[10px] font-mono"
                  >
                    {(frac * 3.0).toFixed(1)} ADA
                  </text>
                </g>
              );
            })}

            {[0, 7, 14, 21, 28].map((day) => (
              <text
                key={day}
                x={xScale(day)}
                y={subH - 10}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-mono"
              >
                {t.hud.dayPrefix}{day}
              </text>
            ))}

            <path
              d={buildPath(cytPoints)}
              fill="none"
              stroke="#0F172A"
              strokeWidth={1.75}
            />
            <path
              d={buildPath(adaPoints)}
              fill="none"
              stroke="#6D28D9"
              strokeWidth={1.75}
              strokeDasharray="4 3"
            />

            <rect
              x={pad.left}
              y={24}
              width={plotW}
              height={subPlotH}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth={1}
            />

            {hoverIdx !== null && (
              <line
                x1={xScale(activePoint.day)}
                y1={24}
                x2={xScale(activePoint.day)}
                y2={24 + subPlotH}
                stroke="#0F172A"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            )}
          </svg>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-0.5 bg-slate-900 inline-block" />
            [{params.cytokineName}] {t.subLegendCytPrefix}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-0.5 bg-violet-700 inline-block" />
            {t.subLegendAda}
          </span>
        </div>
      </div>
    </div>
  );
};
