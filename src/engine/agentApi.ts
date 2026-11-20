import { z } from 'zod';
import {
  autoCalibrateBenchmark,
  CLINICAL_BENCHMARKS,
  evaluateBenchmarkFit,
} from './clinicalBenchmarks.ts';
import {
  computeSensitivitySurface,
  CYTOKINE_PRESETS,
  optimizeRegimen,
  runFullSimulation,
} from './kineticsModel.ts';
import { ClinicalBenchmark, KineticParameters } from '../types/kinetics.ts';

export const PresetIdEnum = z.enum([
  'tnf_adalimumab',
  'il6_tocilizumab',
  'il1b_anakinra',
  'il17a_secukinumab',
  'il23_risankizumab',
]);

export const BenchmarkIdEnum = z.enum([
  'bartelds_ada_neg',
  'bartelds_ada_pos',
  'gibiansky_toci_q2w',
]);

export const ParameterOverridesSchema = z.object({
  mechanism: z.enum(['ligand_neutralizer', 'receptor_antagonist']).optional(),
  c0_pM: z.number().min(5).max(1000).optional(),
  kon_C: z.number().min(0.5).max(100).optional(),
  koff_C: z.number().min(0.1).max(50).optional(),
  rTot_pM: z.number().min(10).max(1000).optional(),
  feedbackGain: z.number().min(0).max(5).optional(),
  dose_mg: z.number().min(1).max(2000).optional(),
  interval_days: z.number().min(0.25).max(90).optional(),
  halfLife_days: z.number().min(0.1).max(60).optional(),
  kon_A: z.number().min(0.5).max(100).optional(),
  koff_A: z.number().min(0.05).max(50).optional(),
  adaRisk: z.number().min(0).max(1).optional(),
  mutationPenalty: z.number().min(1).max(50).optional(),
  bypassPathway: z.number().min(0).max(0.8).optional(),
  inflammatoryClearance: z.number().min(1).max(6).optional(),
});

export const SimulateInputSchema = z.object({
  presetId: PresetIdEnum.default('tnf_adalimumab'),
  overrides: ParameterOverridesSchema.optional(),
  includeTimeSeries: z.boolean().default(false),
});

export const OptimizeInputSchema = z.object({
  presetId: PresetIdEnum.default('tnf_adalimumab'),
  overrides: ParameterOverridesSchema.optional(),
});

export const CalibrateInputSchema = z.object({
  benchmarkId: BenchmarkIdEnum.default('bartelds_ada_neg'),
  autoCalibrate: z.boolean().default(true),
  customObservations: z
    .array(
      z.object({
        week: z.number().min(0.5).max(52),
        observed_ug_mL: z.number().min(0).max(500),
        sd_ug_mL: z.number().min(0.05).max(200).optional(),
      })
    )
    .min(2)
    .optional(),
  overrides: ParameterOverridesSchema.optional(),
});

export const LandscapeInputSchema = z.object({
  presetId: PresetIdEnum.default('tnf_adalimumab'),
  mode: z.enum(['dose_vs_cytokine', 'kd_vs_ada']).default('dose_vs_cytokine'),
  overrides: ParameterOverridesSchema.optional(),
});

export function resolveParameters(
  presetId: string,
  overrides?: z.infer<typeof ParameterOverridesSchema>
): KineticParameters {
  const preset =
    CYTOKINE_PRESETS.find((p) => p.id === presetId) ?? CYTOKINE_PRESETS[0];
  const merged: KineticParameters = { ...preset.params };
  if (overrides) {
    for (const [k, v] of Object.entries(overrides)) {
      if (v !== undefined) {
        (merged as unknown as Record<string, unknown>)[k] = v;
      }
    }
  }
  return merged;
}

export function listPresetsAndBenchmarks() {
  return {
    presets: CYTOKINE_PRESETS.map((p) => ({
      id: p.id,
      label: p.label,
      clinicalContext: p.clinicalContext,
      mechanism: p.params.mechanism,
      defaultRegimen: `${p.params.dose_mg} mg / ${p.params.interval_days} d`,
      parameters: p.params,
    })),
    benchmarks: CLINICAL_BENCHMARKS.map((b) => ({
      id: b.id,
      title: b.title,
      citation: b.citation,
      observedFailureRate_pct: b.observedFailureRate_pct,
      nObservations: b.dataPoints.length,
    })),
  };
}

export function runSimulationTool(rawInput: unknown) {
  const input = SimulateInputSchema.parse(rawInput);
  const params = resolveParameters(input.presetId, input.overrides);
  const sim = runFullSimulation(params);

  return {
    axis: `${params.cytokineName} / ${params.antagonistName}`,
    mechanism: params.mechanism,
    parameters: params,
    biophysics: {
      kdCytokine_pM: Number(sim.kdC_pM.toFixed(2)),
      kdAntagonistNative_pM: Number(sim.kdA_pM.toFixed(2)),
      kdAntagonistEffective_pM: Number(sim.kdAEff_pM.toFixed(2)),
      affinityRatio_KdC_over_KdAeff: Number(sim.affinityRatio.toFixed(3)),
    },
    predictions: {
      resistanceProbability_pct: Number(sim.resistanceProbability_pct.toFixed(2)),
      primaryResistance_pct: Number(sim.primaryResistance_pct.toFixed(2)),
      secondaryResistance_pct: Number(sim.secondaryResistance_pct.toFixed(2)),
      riskLevel: sim.riskLevel,
      riskLabel: sim.riskLabel,
      cohortMeanResistance_pct: Number(sim.cohort.meanResistance_pct.toFixed(2)),
      cohortCI95_pct: [
        Number(sim.cohort.ci95Lower_pct.toFixed(2)),
        Number(sim.cohort.ci95Upper_pct.toFixed(2)),
      ],
      troughCytokineOccupancy_pct: Number(sim.troughOccupancy_pct.toFixed(2)),
      peakCytokineOccupancy_pct: Number(sim.peakOccupancy_pct.toFixed(2)),
      troughAntagonist_nM: Number(sim.troughAntagonist_nM.toFixed(2)),
      targetTrough_nM: Number(sim.targetTrough_nM.toFixed(2)),
      adaPeak_rel: Number(sim.adaPeak_rel.toFixed(3)),
    },
    attributions: sim.attributions.map((a) => ({
      factor: a.label,
      value: a.valueFormatted,
      deltaResistance_pts: Number(a.impact_pct.toFixed(2)),
    })),
    ...(input.includeTimeSeries
      ? {
          dailyTimeSeries: sim.timeSeries.filter((pt) => pt.hour % 24 === 0),
        }
      : {}),
  };
}

export function runOptimizeTool(rawInput: unknown) {
  const input = OptimizeInputSchema.parse(rawInput);
  const params = resolveParameters(input.presetId, input.overrides);
  const sim = runFullSimulation(params);
  const opt = optimizeRegimen(params, sim.resistanceProbability_pct);

  return {
    axis: `${params.cytokineName} / ${params.antagonistName}`,
    baselineRegimen: {
      dose_mg: params.dose_mg,
      interval_days: params.interval_days,
      resistanceProbability_pct: Number(sim.resistanceProbability_pct.toFixed(2)),
      troughAntagonist_nM: Number(sim.troughAntagonist_nM.toFixed(2)),
    },
    optimizedRegimen: {
      recommendedDose_mg: opt.recommendedDose_mg,
      recommendedInterval_days: opt.recommendedInterval_days,
      predictedResistance_pct: Number(opt.predictedResistance_pct.toFixed(2)),
      deltaResistance_pts: Number(opt.deltaResistance_pct.toFixed(2)),
      predictedTroughOccupancy_pct: Number(opt.predictedTroughOcc_pct.toFixed(2)),
      predictedTroughAntagonist_nM: Number(
        opt.predictedTroughAntagonist_nM.toFixed(2)
      ),
      requiresMechanismSwitch: opt.requiresMechanismSwitch,
      clinicalRecommendation: opt.clinicalRecommendation,
    },
  };
}

export function runCalibrateTool(rawInput: unknown) {
  const input = CalibrateInputSchema.parse(rawInput);
  const baseBenchmark =
    CLINICAL_BENCHMARKS.find((b) => b.id === input.benchmarkId) ??
    CLINICAL_BENCHMARKS[0];

  const ugMlToNm = 1000 / Math.max(5, baseBenchmark.baselineParams.molecularWeight_kDa);

  const benchmark: ClinicalBenchmark = input.customObservations
    ? {
        ...baseBenchmark,
        id: 'custom_cohort',
        title: 'Custom Cohort Observations',
        citation: 'Agent-supplied empirical dataset',
        horizonDays: Math.max(
          28,
          Math.ceil(Math.max(...input.customObservations.map((o) => o.week)) * 7)
        ),
        dataPoints: input.customObservations.map((o) => ({
          week: o.week,
          day: Math.round(o.week * 7),
          observed_ug_mL: o.observed_ug_mL,
          sd_ug_mL: o.sd_ug_mL ?? Math.max(0.2, o.observed_ug_mL * 0.25),
          observed_nM: Number((o.observed_ug_mL * ugMlToNm).toFixed(2)),
          sd_nM: Number(
            ((o.sd_ug_mL ?? Math.max(0.2, o.observed_ug_mL * 0.25)) * ugMlToNm).toFixed(2)
          ),
          label: `S${o.week}`,
        })),
      }
    : baseBenchmark;

  let params = { ...benchmark.baselineParams };
  if (input.overrides) {
    for (const [k, v] of Object.entries(input.overrides)) {
      if (v !== undefined) {
        (params as unknown as Record<string, unknown>)[k] = v;
      }
    }
  }

  if (input.autoCalibrate) {
    params = autoCalibrateBenchmark(benchmark, params);
  }

  const fit = evaluateBenchmarkFit(benchmark, params);

  return {
    benchmark: {
      id: benchmark.id,
      title: benchmark.title,
      citation: benchmark.citation,
      observedFailureRate_pct: benchmark.observedFailureRate_pct,
    },
    autoCalibrated: input.autoCalibrate,
    fittedParameters: {
      halfLife_days: params.halfLife_days,
      adaRisk: params.adaRisk,
      inflammatoryClearance: params.inflammatoryClearance,
      dose_mg: params.dose_mg,
      interval_days: params.interval_days,
    },
    goodnessOfFit: {
      rSquared: Number(fit.rSquared.toFixed(4)),
      rmse_ug_mL: Number(fit.rmse_ug_mL.toFixed(3)),
      rmse_nM: Number(fit.rmse_nM.toFixed(2)),
      mape_pct: Number(fit.mape_pct.toFixed(2)),
      meanBias_nM: Number(fit.meanBias_nM.toFixed(2)),
      predictedResistance_pct: Number(fit.predictedResistance_pct.toFixed(2)),
    },
    pointComparisons: fit.comparisons.map((c) => ({
      week: c.week,
      observed_ug_mL: c.observed_ug_mL,
      predicted_ug_mL: Number(c.predicted_ug_mL.toFixed(2)),
      standardizedResidual_WRES: Number(c.standardizedResidual.toFixed(2)),
    })),
  };
}

export function runLandscapeTool(rawInput: unknown) {
  const input = LandscapeInputSchema.parse(rawInput);
  const params = resolveParameters(input.presetId, input.overrides);
  const surface = computeSensitivitySurface(params, input.mode);

  const responderCells = surface.cells.filter((c) => c.resistance_pct < 25);
  const escapeCells = surface.cells.filter((c) => c.resistance_pct >= 50);

  return {
    axis: `${params.cytokineName} / ${params.antagonistName}`,
    mode: input.mode,
    xAxis: `${surface.xLabel} (${surface.xUnit})`,
    yAxis: `${surface.yLabel} (${surface.yUnit})`,
    currentOperatingPoint: {
      x: surface.currentX,
      y: surface.currentY,
    },
    summary: {
      totalCells: surface.cells.length,
      responderZoneCells_lt25pct: responderCells.length,
      highResistanceCells_gte50pct: escapeCells.length,
      minResistance_pct: Number(
        Math.min(...surface.cells.map((c) => c.resistance_pct)).toFixed(2)
      ),
      maxResistance_pct: Number(
        Math.max(...surface.cells.map((c) => c.resistance_pct)).toFixed(2)
      ),
    },
    xValues: surface.xValues,
    yValues: surface.yValues,
    grid: surface.cells.map((c) => ({
      x: c.xValue,
      y: c.yValue,
      resistance_pct: Number(c.resistance_pct.toFixed(1)),
      troughOcc_pct: Number(c.troughOcc_pct.toFixed(1)),
    })),
  };
}
