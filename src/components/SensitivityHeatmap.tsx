import React, { useMemo, useState } from 'react';
import { computeSensitivitySurface } from '../engine/kineticsModel';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { KineticParameters, SensitivityCell } from '../types/kinetics';

interface SensitivityHeatmapProps {
  params: KineticParameters;
  lang: Language;
  onApplyCell: (patch: Partial<KineticParameters>) => void;
}

function colorForResistance(pct: number): string {
  // Discrete calibrated ramp: Cyan -> Slate-Light -> Amber -> Rose
  if (pct < 12) return '#0E7490'; // Cyan 700 (Strong response)
  if (pct < 22) return '#0891B2'; // Cyan 600
  if (pct < 32) return '#67E8F9'; // Cyan 300
  if (pct < 42) return '#E2E8F0'; // Slate 200 (Borderline zone)
  if (pct < 55) return '#FDE68A'; // Amber 200
  if (pct < 70) return '#F59E0B'; // Amber 500
  if (pct < 85) return '#F43F5E'; // Rose 500
  return '#BE123C'; // Rose 700 (Severe escape)
}

export const SensitivityHeatmap: React.FC<SensitivityHeatmapProps> = ({
  params,
  lang,
  onApplyCell,
}) => {
  const t = TRANSLATIONS[lang].sensitivity;
  const [mode, setMode] = useState<'dose_vs_cytokine' | 'kd_vs_ada'>(
    'dose_vs_cytokine'
  );
  const [hoveredCell, setHoveredCell] = useState<SensitivityCell | null>(null);

  const surface = useMemo(
    () => computeSensitivitySurface(params, mode),
    [params, mode]
  );

  const xLabel = mode === 'dose_vs_cytokine' ? t.xLabelDose : t.xLabelKd;
  const yLabel = mode === 'dose_vs_cytokine' ? t.yLabelCyt : t.yLabelAda;
  const xUnit = mode === 'dose_vs_cytokine' ? 'mg' : t.unitTimes;
  const yUnit = mode === 'dose_vs_cytokine' ? 'pM' : t.unitIndex;

  const cellW = 46;
  const cellH = 30;
  const xCount = surface.xValues.length;
  const yCount = surface.yValues.length;
  const pad = { top: 20, right: 24, bottom: 52, left: 72 };
  const width = pad.left + xCount * cellW + pad.right;
  const height = pad.top + yCount * cellH + pad.bottom;

  // Locate nearest cell to current operating point
  const nearestX = surface.xValues.reduce(
    (best, val, idx) =>
      Math.abs(val - surface.currentX) < Math.abs(surface.xValues[best] - surface.currentX)
        ? idx
        : best,
    0
  );
  const nearestY = surface.yValues.reduce(
    (best, val, idx) =>
      Math.abs(val - surface.currentY) < Math.abs(surface.yValues[best] - surface.currentY)
        ? idx
        : best,
    0
  );

  const inspected =
    hoveredCell ??
    surface.cells.find((c) => c.xIndex === nearestX && c.yIndex === nearestY) ??
    surface.cells[0];

  const handleCellApply = (cell: SensitivityCell) => {
    if (mode === 'dose_vs_cytokine') {
      onApplyCell({ dose_mg: cell.xValue, c0_pM: cell.yValue });
    } else {
      onApplyCell({ mutationPenalty: cell.xValue, adaRisk: cell.yValue });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {t.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
          <button
            type="button"
            onClick={() => setMode('dose_vs_cytokine')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              mode === 'dose_vs_cytokine'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.modeDoseVsCyt}
          </button>
          <button
            type="button"
            onClick={() => setMode('kd_vs_ada')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              mode === 'kd_vs_ada'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.modeKdVsAda}
          </button>
        </div>
      </div>

      {/* Inspected Cell HUD */}
      <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-center justify-between gap-4 text-xs font-mono tabular-nums">
        <div className="flex flex-wrap items-center gap-5">
          <span>
            <span className="text-slate-500">{xLabel}: </span>
            <strong className="text-slate-900">
              {inspected.xValue} {xUnit}
            </strong>
          </span>
          <span>
            <span className="text-slate-500">{yLabel}: </span>
            <strong className="text-slate-900">
              {inspected.yValue} {yUnit}
            </strong>
          </span>
          <span>
            <span className="text-slate-500">{t.pResistanceLabel}: </span>
            <strong
              className={
                inspected.resistance_pct >= 50
                  ? 'text-rose-700'
                  : inspected.resistance_pct >= 25
                    ? 'text-amber-700'
                    : 'text-cyan-800'
              }
            >
              {inspected.resistance_pct.toFixed(1)} %
            </strong>
          </span>
          <span>
            <span className="text-slate-500">{t.troughOccLabel}: </span>
            <strong className="text-slate-900">
              {inspected.troughOcc_pct.toFixed(1)} %
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleCellApply(inspected)}
          className="font-sans px-3 py-1 text-xs font-medium text-blue-700 bg-white border border-slate-300 hover:border-blue-500 rounded transition-colors"
        >
          {t.applyScenario}
        </button>
      </div>

      {/* Heatmap Matrix SVG */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[680px] h-auto select-none"
          role="img"
          aria-label={t.title}
        >
          {surface.cells.map((cell) => {
            // Invert Y so higher Y values sit at the top
            const svgX = pad.left + cell.xIndex * cellW;
            const svgY = pad.top + (yCount - 1 - cell.yIndex) * cellH;
            const isHovered =
              hoveredCell?.xIndex === cell.xIndex && hoveredCell?.yIndex === cell.yIndex;
            return (
              <g
                key={`${cell.xIndex}-${cell.yIndex}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredCell(cell)}
                onMouseLeave={() => setHoveredCell(null)}
                onClick={() => handleCellApply(cell)}
              >
                <rect
                  x={svgX + 0.5}
                  y={svgY + 0.5}
                  width={cellW - 1}
                  height={cellH - 1}
                  fill={colorForResistance(cell.resistance_pct)}
                  stroke={isHovered ? '#0F172A' : 'none'}
                  strokeWidth={isHovered ? 1.5 : 0}
                />
                <text
                  x={svgX + cellW / 2}
                  y={svgY + cellH / 2 + 3.5}
                  textAnchor="middle"
                  className={`text-[9px] font-mono pointer-events-none ${
                    cell.resistance_pct < 22 || cell.resistance_pct >= 70
                      ? 'fill-white font-medium'
                      : 'fill-slate-800'
                  }`}
                >
                  {cell.resistance_pct.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Current Patient Operating Reticle */}
          {(() => {
            const cx = pad.left + nearestX * cellW + cellW / 2;
            const cy = pad.top + (yCount - 1 - nearestY) * cellH + cellH / 2;
            return (
              <g className="pointer-events-none">
                <rect
                  x={pad.left + nearestX * cellW + 1}
                  y={pad.top + (yCount - 1 - nearestY) * cellH + 1}
                  width={cellW - 2}
                  height={cellH - 2}
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth={2}
                />
                <circle
                  cx={cx}
                  cy={cy - cellH / 2 + 4}
                  r={3}
                  fill="#0F172A"
                />
              </g>
            );
          })()}

          {/* Y-axis ticks */}
          {surface.yValues.map((val, yIdx) => {
            const y = pad.top + (yCount - 1 - yIdx) * cellH + cellH / 2 + 3.5;
            return (
              <text
                key={yIdx}
                x={pad.left - 8}
                y={y}
                textAnchor="end"
                className="fill-slate-600 text-[10px] font-mono"
              >
                {val}
              </text>
            );
          })}

          {/* X-axis ticks */}
          {surface.xValues.map((val, xIdx) => {
            if (xIdx % 2 !== 0 && xIdx !== xCount - 1) return null;
            const x = pad.left + xIdx * cellW + cellW / 2;
            return (
              <text
                key={xIdx}
                x={x}
                y={pad.top + yCount * cellH + 16}
                textAnchor="middle"
                className="fill-slate-600 text-[10px] font-mono"
              >
                {val}
              </text>
            );
          })}

          {/* Axis Labels */}
          <text
            x={pad.left + (xCount * cellW) / 2}
            y={height - 10}
            textAnchor="middle"
            className="fill-slate-700 text-[11px] font-medium"
          >
            {xLabel} ({xUnit})
          </text>
          <text
            x={16}
            y={pad.top + (yCount * cellH) / 2}
            textAnchor="middle"
            transform={`rotate(-90, 16, ${pad.top + (yCount * cellH) / 2})`}
            className="fill-slate-700 text-[11px] font-medium"
          >
            {yLabel} ({yUnit})
          </text>
        </svg>
      </div>

      {/* Discrete Calibrated Legend */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">{t.scaleLabel}</span>
          <div className="flex items-center gap-0.5 font-mono text-[10px]">
            {[
              { color: '#0E7490', label: '<12%' },
              { color: '#0891B2', label: '12–22' },
              { color: '#67E8F9', label: '22–32' },
              { color: '#E2E8F0', label: '32–42' },
              { color: '#FDE68A', label: '42–55' },
              { color: '#F59E0B', label: '55–70' },
              { color: '#F43F5E', label: '70–85' },
              { color: '#BE123C', label: '>85%' },
            ].map((step) => (
              <div key={step.label} className="flex flex-col items-center">
                <span
                  className="w-9 h-3 block border border-slate-200"
                  style={{ backgroundColor: step.color }}
                />
                <span className="text-slate-500 mt-1">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <span className="w-3.5 h-3.5 border-2 border-slate-900 inline-block" />
          <span>{t.currentPointLabel}</span>
        </div>
      </div>
    </div>
  );
};
