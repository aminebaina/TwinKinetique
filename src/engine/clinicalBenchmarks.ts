import {
  CalibrationFitResult,
  CalibrationPointComparison,
  ClinicalBenchmark,
  ClinicalDataPoint,
  KineticParameters,
} from '../types/kinetics';
import {
  computeResistanceFromTrajectory,
  createSeededRng,
  CYTOKINE_PRESETS,
  hashParams,
  normalRandom,
  simulateOdeTrajectory,
} from './kineticsModel';

const UG_ML_TO_NM = 1000 / 148; // 1 ug/mL IgG1 (148 kDa) = 6.757 nM

function pt(
  week: number,
  observed_ug_mL: number,
  sd_ug_mL: number,
  label: string
): ClinicalDataPoint {
  return {
    week,
    day: week * 7,
    observed_ug_mL,
    sd_ug_mL,
    observed_nM: Number((observed_ug_mL * UG_ML_TO_NM).toFixed(2)),
    sd_nM: Number((sd_ug_mL * UG_ML_TO_NM).toFixed(2)),
    label,
  };
}

const adaBase = CYTOKINE_PRESETS[0].params;
const tociBase = CYTOKINE_PRESETS[1].params;

export const CLINICAL_BENCHMARKS: ClinicalBenchmark[] = [
  {
    id: 'bartelds_ada_neg',
    title: 'Adalimumab 40 mg SC / 14 j — Cohorte ADA− (Répondeurs)',
    citation:
      'Bartelds GM et al., JAMA 2011;305(14):1460-1468 · Ternant D et al., Clin Pharmacokinet 2015',
    cohortDescription:
      'Polyarthrite rhumatoïde active (n = 196 patients sans anticorps anti-adalimumab), suivi longitudinal des concentrations résiduelles sur 24 semaines.',
    observedFailureRate_pct: 18.0,
    horizonDays: 168,
    baselineParams: {
      ...adaBase,
      halfLife_days: 17.5,
      adaRisk: 0,
      inflammatoryClearance: 1.0,
      bypassPathway: 0.10,
    },
    dataPoints: [
      pt(2, 3.1, 1.1, 'S2 (vallée)'),
      pt(4, 4.9, 1.5, 'S4 (vallée)'),
      pt(8, 6.4, 1.8, 'S8 (vallée)'),
      pt(12, 7.1, 2.0, 'S12 (vallée)'),
      pt(16, 7.4, 2.1, 'S16 (vallée)'),
      pt(24, 7.5, 2.2, 'S24 (vallée)'),
    ],
  },
  {
    id: 'bartelds_ada_pos',
    title: 'Adalimumab 40 mg SC / 14 j — Cohorte ADA+ (Échappement)',
    citation:
      'Bartelds GM et al., JAMA 2011;305(14):1460-1468 (Sous-groupe ADA+ > 12 AU/mL)',
    cohortDescription:
      'Polyarthrite rhumatoïde active (n = 76 patients développant des anticorps anti-adalimumab), perte d’exposition sérique et résistance secondaire entre S8 et S24.',
    observedFailureRate_pct: 78.0,
    horizonDays: 168,
    baselineParams: {
      ...adaBase,
      halfLife_days: 14.5,
      adaRisk: 0.72,
      inflammatoryClearance: 1.1,
      bypassPathway: 0.15,
    },
    dataPoints: [
      pt(2, 2.7, 0.9, 'S2 (vallée)'),
      pt(4, 3.2, 1.1, 'S4 (vallée)'),
      pt(8, 1.6, 0.8, 'S8 (vallée)'),
      pt(12, 0.8, 0.5, 'S12 (vallée)'),
      pt(16, 0.4, 0.3, 'S16 (vallée)'),
      pt(24, 0.2, 0.2, 'S24 (vallée)'),
    ],
  },
  {
    id: 'gibiansky_toci_q2w',
    title: 'Tocilizumab 162 mg SC / 7 j — Étude SUMMACTA (Modèle TMDD)',
    citation:
      'Burmester GR et al., Ann Rheum Dis 2014;73:69-74 · Gibiansky L et al., J Pharmacokinet Pharmacodyn 2011',
    cohortDescription:
      'Polyarthrite rhumatoïde active sous anti-IL-6Rα sous-cutané hebdomadaire (162 mg qw), suivi de l’accumulation sérique et saturation TMDD sur 24 semaines.',
    observedFailureRate_pct: 22.0,
    horizonDays: 168,
    baselineParams: {
      ...tociBase,
      dose_mg: 162,
      interval_days: 7,
      halfLife_days: 11.5,
      adaRisk: 0,
      inflammatoryClearance: 1.2,
      bypassPathway: 0.12,
    },
    dataPoints: [
      pt(2, 19.5, 4.8, 'S2 (vallée)'),
      pt(4, 29.8, 6.9, 'S4 (vallée)'),
      pt(8, 36.2, 8.2, 'S8 (vallée)'),
      pt(12, 38.4, 8.8, 'S12 (vallée)'),
      pt(16, 39.2, 9.1, 'S16 (vallée)'),
      pt(24, 39.6, 9.2, 'S24 (vallée)'),
    ],
  },
];

export function evaluateBenchmarkFit(
  benchmark: ClinicalBenchmark,
  params: KineticParameters
): CalibrationFitResult {
  // Sample every 24h over horizonDays (e.g. 168 days) for longitudinal curve & exact day-aligned troughs
  const baseTraj = simulateOdeTrajectory(params, benchmark.horizonDays, 0.25, 24);
  const evalFull = computeResistanceFromTrajectory(params, baseTraj);

  // Stochastic VPC envelope (N = 60 virtual patients) over 168 days
  const nVpc = 60;
  const rng = createSeededRng(hashParams(params) ^ 0x9e3779b9);
  const concMatrix: number[][] = Array.from({ length: baseTraj.length }, () => []);

  for (let i = 0; i < nVpc; i++) {
    const perturbed: KineticParameters = {
      ...params,
      halfLife_days: Math.max(1, params.halfLife_days * Math.exp(0.16 * normalRandom(rng))),
      adaRisk: Math.min(1, Math.max(0, params.adaRisk * Math.exp(0.24 * normalRandom(rng)))),
      inflammatoryClearance: Math.max(
        1,
        params.inflammatoryClearance * Math.exp(0.14 * normalRandom(rng))
      ),
    };
    const traj = simulateOdeTrajectory(perturbed, benchmark.horizonDays, 0.5, 24);
    for (let t = 0; t < baseTraj.length; t++) {
      const idx = Math.min(t, traj.length - 1);
      concMatrix[t].push(traj[idx].freeAntagonist_nM);
    }
  }

  const horizonTrajectory = baseTraj.map((pt, idx) => {
    const sorted = [...concMatrix[idx]].sort((a, b) => a - b);
    const lo = sorted[Math.floor(0.05 * nVpc)] ?? pt.freeAntagonist_nM;
    const hi = sorted[Math.min(nVpc - 1, Math.floor(0.95 * nVpc))] ?? pt.freeAntagonist_nM;
    const day = pt.hour / 24;
    return {
      day,
      week: Number((day / 7).toFixed(2)),
      predicted_nM: pt.freeAntagonist_nM,
      predicted_ug_mL: pt.freeAntagonist_nM / UG_ML_TO_NM,
      ciLower_nM: lo,
      ciUpper_nM: hi,
      cytokineOccupancy_pct: pt.cytokineOccupancy_pct,
      adaLevel_rel: pt.adaLevel_rel,
    };
  });

  // Match empirical data points by exact day
  const comparisons: CalibrationPointComparison[] = benchmark.dataPoints.map((obs) => {
    const nearest = horizonTrajectory.reduce((best, cand) =>
      Math.abs(cand.day - obs.day) < Math.abs(best.day - obs.day) ? cand : best
    );
    const predNm = nearest.predicted_nM;
    const predUg = nearest.predicted_ug_mL;
    const residual = predNm - obs.observed_nM;
    const stdRes = residual / Math.max(0.5, obs.sd_nM);
    return {
      week: obs.week,
      day: obs.day,
      label: obs.label,
      observed_nM: obs.observed_nM,
      sd_nM: obs.sd_nM,
      observed_ug_mL: obs.observed_ug_mL,
      sd_ug_mL: obs.sd_ug_mL,
      predicted_nM: predNm,
      predicted_ug_mL: predUg,
      residual_nM: residual,
      standardizedResidual: stdRes,
    };
  });

  const n = comparisons.length;
  const sqErrSum = comparisons.reduce((acc, c) => acc + c.residual_nM * c.residual_nM, 0);
  const rmse_nM = Math.sqrt(sqErrSum / Math.max(1, n));
  const rmse_ug_mL = rmse_nM / UG_ML_TO_NM;

  const apeSum = comparisons.reduce(
    (acc, c) => acc + Math.abs(c.residual_nM) / Math.max(0.5, c.observed_nM),
    0
  );
  const mape_pct = (apeSum / Math.max(1, n)) * 100;

  const meanObs =
    comparisons.reduce((acc, c) => acc + c.observed_nM, 0) / Math.max(1, n);
  const ssTot = comparisons.reduce(
    (acc, c) => acc + Math.pow(c.observed_nM - meanObs, 2),
    0
  );
  const rSquared = ssTot > 1e-6 ? Math.max(0, 1 - sqErrSum / ssTot) : 1;

  const meanBias_nM =
    comparisons.reduce((acc, c) => acc + c.residual_nM, 0) / Math.max(1, n);

  return {
    benchmark,
    fittedParams: params,
    horizonTrajectory,
    comparisons,
    rmse_nM,
    rmse_ug_mL,
    mape_pct,
    rSquared,
    meanBias_nM,
    predictedResistance_pct: evalFull.resistancePct,
  };
}

/**
 * Deterministic coordinate-descent least-squares optimizer minimizing SSE
 * over (halfLife_days, adaRisk, inflammatoryClearance) against published cohort data.
 */
export function autoCalibrateBenchmark(
  benchmark: ClinicalBenchmark,
  initialParams: KineticParameters
): KineticParameters {
  let best = { ...initialParams };

  const loss = (p: KineticParameters) => {
    const traj = simulateOdeTrajectory(p, benchmark.horizonDays, 0.5, 24);
    let sse = 0;
    for (const obs of benchmark.dataPoints) {
      const idx = Math.min(traj.length - 1, Math.round(obs.day));
      const predNm = traj[idx].freeAntagonist_nM;
      const err = (predNm - obs.observed_nM) / Math.max(1, obs.sd_nM);
      sse += err * err;
    }
    return sse;
  };

  let bestLoss = loss(best);

  const steps: {
    key: 'halfLife_days' | 'adaRisk' | 'inflammatoryClearance';
    deltas: number[];
    min: number;
    max: number;
  }[] = [
    { key: 'halfLife_days', deltas: [2.5, 1.0, 0.4], min: 4, max: 30 },
    { key: 'adaRisk', deltas: [0.18, 0.06, 0.02], min: 0, max: 0.95 },
    { key: 'inflammatoryClearance', deltas: [0.25, 0.08, 0.03], min: 1.0, max: 3.0 },
  ];

  for (let pass = 0; pass < 3; pass++) {
    for (const dim of steps) {
      const delta = dim.deltas[pass];
      let improved = true;
      let iter = 0;
      while (improved && iter < 4) {
        improved = false;
        iter++;
        for (const dir of [-1, 1]) {
          const candidateVal = Math.min(
            dim.max,
            Math.max(dim.min, Number((best[dim.key] + dir * delta).toFixed(3)))
          );
          const cand = { ...best, [dim.key]: candidateVal };
          const candLoss = loss(cand);
          if (candLoss < bestLoss - 1e-6) {
            best = cand;
            bestLoss = candLoss;
            improved = true;
          }
        }
      }
    }
  }

  return best;
}
