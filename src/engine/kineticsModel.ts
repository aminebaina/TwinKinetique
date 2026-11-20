import {
  CohortSimulationSummary,
  KineticParameters,
  KineticPreset,
  RadarMetric,
  RegimenOptimizationResult,
  ResistanceFactorContribution,
  RiskLevel,
  SensitivityCell,
  SensitivitySurface,
  SimulationResult,
  TimeSeriesPoint,
} from '../types/kinetics';

export const CYTOKINE_PRESETS: KineticPreset[] = [
  {
    id: 'tnf_adalimumab',
    label: 'TNF-α / Adalimumab',
    shortLabel: 'TNF-α · Adalimumab',
    clinicalContext: 'Polyarthrite rhumatoïde active · Biothérapie anti-TNFα',
    description:
      'Neutralisation du TNF-α soluble et transmembranaire par anticorps monoclonal humain IgG1. Sensible à l’émergence d’anticorps anti-médicament (ADA).',
    params: {
      presetId: 'tnf_adalimumab',
      cytokineName: 'TNF-α',
      receptorName: 'TNFR1 / TNFR2',
      antagonistName: 'Adalimumab',
      indication: 'Polyarthrite rhumatoïde',
      mechanism: 'ligand_neutralizer',
      c0_pM: 120,
      kon_C: 18.0, // 1.8e6 M^-1 s^-1
      koff_C: 3.6, // 3.6e-4 s^-1 -> Kd_C = 200 pM
      rTot_pM: 180,
      feedbackGain: 1.15,
      dose_mg: 40,
      interval_days: 14,
      halfLife_days: 14,
      kon_A: 12.0, // 1.2e6 M^-1 s^-1
      koff_A: 0.9, // 0.9e-4 s^-1 -> Kd_A = 75 pM
      molecularWeight_kDa: 148,
      adaRisk: 0.22,
      mutationPenalty: 1.0,
      bypassPathway: 0.12,
      inflammatoryClearance: 1.25,
    },
  },
  {
    id: 'il6_tocilizumab',
    label: 'IL-6 / Tocilizumab',
    shortLabel: 'IL-6 · Tocilizumab',
    clinicalContext: 'Syndrome inflammatoire sévère / PR réfractaire · Anti-IL-6Rα',
    description:
      'Blocage compétitif direct des récepteurs IL-6Rα membranaires et solubles empêchant la dimérisation gp130 et l’activation JAK/STAT3.',
    params: {
      presetId: 'il6_tocilizumab',
      cytokineName: 'IL-6',
      receptorName: 'IL-6Rα / gp130',
      antagonistName: 'Tocilizumab',
      indication: 'PR réfractaire / SRC',
      mechanism: 'receptor_antagonist',
      c0_pM: 210,
      kon_C: 14.0,
      koff_C: 4.2, // Kd_C = 300 pM
      rTot_pM: 260,
      feedbackGain: 1.35,
      dose_mg: 162,
      interval_days: 7,
      halfLife_days: 11,
      kon_A: 9.5,
      koff_A: 1.1, // Kd_A = 115.8 pM
      molecularWeight_kDa: 148,
      adaRisk: 0.12,
      mutationPenalty: 1.0,
      bypassPathway: 0.16,
      inflammatoryClearance: 1.4,
    },
  },
  {
    id: 'il1b_anakinra',
    label: 'IL-1β / Anakinra',
    shortLabel: 'IL-1β · Anakinra',
    clinicalContext: 'Maladie auto-inflammatoire / Péricardite · Antagoniste IL-1R1',
    description:
      'Antagoniste recombinant court du récepteur IL-1R1 à clairance rénale rapide nécessitant une exposition quotidienne soutenue.',
    params: {
      presetId: 'il1b_anakinra',
      cytokineName: 'IL-1β',
      receptorName: 'IL-1R1',
      antagonistName: 'Anakinra',
      indication: 'Péricardite récurrente',
      mechanism: 'receptor_antagonist',
      c0_pM: 95,
      kon_C: 22.0,
      koff_C: 2.2, // Kd_C = 100 pM
      rTot_pM: 140,
      feedbackGain: 1.05,
      dose_mg: 100,
      interval_days: 1,
      halfLife_days: 0.35,
      kon_A: 16.0,
      koff_A: 2.4, // Kd_A = 150 pM
      molecularWeight_kDa: 17.3,
      adaRisk: 0.08,
      mutationPenalty: 1.0,
      bypassPathway: 0.10,
      inflammatoryClearance: 1.15,
    },
  },
  {
    id: 'il17a_secukinumab',
    label: 'IL-17A / Sécukinumab',
    shortLabel: 'IL-17A · Sécukinumab',
    clinicalContext: 'Spondyloarthrite axiale · Neutralisation IL-17A',
    description:
      'Séquestration sélective de l’homodimère IL-17A. Risque d’échappement par redondance compensatoire IL-17F et IL-23.',
    params: {
      presetId: 'il17a_secukinumab',
      cytokineName: 'IL-17A',
      receptorName: 'IL-17RA / RC',
      antagonistName: 'Sécukinumab',
      indication: 'Spondyloarthrite axiale',
      mechanism: 'ligand_neutralizer',
      c0_pM: 150,
      kon_C: 11.0,
      koff_C: 2.75, // Kd_C = 250 pM
      rTot_pM: 160,
      feedbackGain: 0.95,
      dose_mg: 150,
      interval_days: 28,
      halfLife_days: 25,
      kon_A: 8.2,
      koff_A: 1.64, // Kd_A = 200 pM
      molecularWeight_kDa: 148,
      adaRisk: 0.10,
      mutationPenalty: 1.0,
      bypassPathway: 0.24,
      inflammatoryClearance: 1.2,
    },
  },
  {
    id: 'il23_risankizumab',
    label: 'IL-23 (p19) / Risankizumab',
    shortLabel: 'IL-23 · Risankizumab',
    clinicalContext: 'Maladie de Crohn modérée à sévère · Anti-p19 haute affinité',
    description:
      'Inhibition ultra-affine de la sous-unité p19 d’IL-23 bloquant la différenciation Th17 pathogène sur un cycle posologique espacé.',
    params: {
      presetId: 'il23_risankizumab',
      cytokineName: 'IL-23 (p19)',
      receptorName: 'IL-23R / IL-12Rβ1',
      antagonistName: 'Risankizumab',
      indication: 'Maladie de Crohn',
      mechanism: 'ligand_neutralizer',
      c0_pM: 110,
      kon_C: 15.0,
      koff_C: 3.0, // Kd_C = 200 pM
      rTot_pM: 130,
      feedbackGain: 1.0,
      dose_mg: 360,
      interval_days: 28,
      halfLife_days: 28,
      kon_A: 24.0,
      koff_A: 0.65, // Kd_A = 27.1 pM
      molecularWeight_kDa: 149,
      adaRisk: 0.09,
      mutationPenalty: 1.0,
      bypassPathway: 0.14,
      inflammatoryClearance: 1.15,
    },
  },
];

// Deterministic PRNG (Mulberry32) so cohort clouds remain stable per parameter state
export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashParams(p: KineticParameters): number {
  const vals = [
    p.c0_pM,
    p.kon_C,
    p.koff_C,
    p.rTot_pM,
    p.dose_mg,
    p.interval_days,
    p.halfLife_days,
    p.kon_A,
    p.koff_A,
    p.adaRisk,
    p.mutationPenalty,
    p.bypassPathway,
    p.inflammatoryClearance,
  ];
  let h = 2166136261;
  for (let i = 0; i < vals.length; i++) {
    const q = Math.round(vals[i] * 1000);
    h ^= q;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function normalRandom(rng: () => number): number {
  const u1 = Math.max(1e-7, rng());
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function expStep(val: number, prod: number, decay: number, dt: number): number {
  if (decay * dt > 1e-5) {
    const e = Math.exp(-decay * dt);
    return Math.max(0, val * e + (prod / decay) * (1 - e));
  }
  return Math.max(0, val + (prod - decay * val) * dt);
}

export function computeKd_pM(kon: number, koff: number): number {
  // kon in 1e5 M^-1 s^-1, koff in 1e-4 s^-1 => Kd (pM) = 1000 * koff / kon
  return (1000 * Math.max(0.01, koff)) / Math.max(0.1, kon);
}

function computeDoseJump_pM(dose_mg: number, mw_kDa: number): number {
  // Effective central distribution volume Vd (L) scaled by MW (mAb ~4.15L, small biologics ~11L)
  const vd_L = 4.15 + 7.5 * Math.exp(-mw_kDa / 45);
  const bioavailability = mw_kDa < 40 ? 0.92 : 0.78;
  const nM = (bioavailability * dose_mg * 1000) / (Math.max(5, mw_kDa) * vd_L);
  return nM * 1000; // convert nM to pM
}

export interface RawTrajectoryPoint {
  hour: number;
  freeCytokine_pM: number;
  freeAntagonist_nM: number;
  cytokineOccupancy_pct: number;
  antagonistNeutralization_pct: number;
  effectiveSignal_pct: number;
  adaLevel_rel: number;
}

export function simulateOdeTrajectory(
  p: KineticParameters,
  horizonDays = 28,
  dt = 0.125,
  sampleIntervalHours = 4
): RawTrajectoryPoint[] {
  const totalHours = horizonDays * 24;
  const steps = Math.round(totalHours / dt);
  const sampleEvery = Math.max(1, Math.round(sampleIntervalHours / dt));

  // Rate constants in pM^-1 h^-1 and h^-1
  const konC = p.kon_C * 3.6e-4;
  const koffC = p.koff_C * 0.36;
  const konA = p.kon_A * 3.6e-4;
  const koffA_eff = p.koff_A * 0.36 * Math.max(1, p.mutationPenalty);

  // Cytokine baseline turnover (plasma + tissue half-life ~ 2.2 hours => kel_C ~ 0.315 h^-1)
  const kelC = 0.32;
  const baseProdC = kelC * p.c0_pM;

  // Antagonist PK elimination rate
  const kelA_base = Math.LN2 / Math.max(0.1, p.halfLife_days * 24);
  const kelCA = kelA_base * 1.35; // Complex clearance slightly accelerated

  // Dosing schedule
  const doseIntervalHours = Math.max(6, p.interval_days * 24);
  const doseJump_pM = computeDoseJump_pM(p.dose_mg, p.molecularWeight_kDa);

  // Initial state (pre-dose inflammatory steady state)
  const kdC_pM = koffC / Math.max(1e-9, konC);
  const initOcc = p.c0_pM / (p.c0_pM + kdC_pM);
  let C = p.c0_pM;
  let R = p.rTot_pM * (1 - initOcc);
  let CR = p.rTot_pM * initOcc;
  let AR = 0; // Used in receptor_antagonist mode
  let CA = 0; // Used in ligand_neutralizer mode
  let A = doseJump_pM; // First loading dose at t = 0
  let ADA = 0.01 * p.adaRisk; // Latent anti-drug antibody titer (0 to ~3)

  let nextDoseHour = doseIntervalHours;
  const trajectory: RawTrajectoryPoint[] = [];

  for (let step = 0; step <= steps; step++) {
    const hour = step * dt;

    const rSum = Math.max(1e-6, R + CR + AR);
    const occCytokine = Math.min(1, Math.max(0, CR / rSum));

    // Effective pro-inflammatory downstream signal includes redundant bypass pathway
    const rawSignal = occCytokine + p.bypassPathway * (1 - occCytokine) * 0.85;
    const effectiveSignal = Math.min(1, Math.max(0, rawSignal));

    // Neutralization / antagonism metric
    const neutralization =
      p.mechanism === 'receptor_antagonist'
        ? Math.min(1, Math.max(0, AR / rSum))
        : Math.min(1, Math.max(0, CA / Math.max(1, C + CA + CR)));

    if (step % sampleEvery === 0) {
      trajectory.push({
        hour,
        freeCytokine_pM: C,
        freeAntagonist_nM: A / 1000,
        cytokineOccupancy_pct: occCytokine * 100,
        antagonistNeutralization_pct: neutralization * 100,
        effectiveSignal_pct: effectiveSignal * 100,
        adaLevel_rel: ADA,
      });
    }

    if (step === steps) break;

    // Bolus/SC impulse absorption at scheduled dosing times (recorded pre-dose trough first)
    if (step > 0 && hour >= nextDoseHour - 1e-6) {
      A += doseJump_pM;
      nextDoseHour += doseIntervalHours;
    }

    // Autocrine inflammatory cytokine production feedback (Hill function of CR occupancy)
    const hillOcc = Math.pow(occCytokine, 1.6) / (Math.pow(0.28, 1.6) + Math.pow(occCytokine, 1.6));
    const prodC = baseProdC * (1 + p.feedbackGain * hillOcc);

    // Dynamic ADA emergence (germinal-center maturation lag after day 7, peaking across weeks 4-16)
    const elapsedPostLag = Math.max(0, hour - 168);
    const timeFactor =
      elapsedPostLag > 0
        ? Math.pow(elapsedPostLag, 1.6) /
          (Math.pow(420, 1.6) + Math.pow(elapsedPostLag, 1.6))
        : 0;
    const subTherapeuticTrigger = 1 + 0.8 * Math.exp(-A / 2500);
    const adaProd = 0.0085 * p.adaRisk * timeFactor * subTherapeuticTrigger;
    const adaDecay = 0.003;

    // Accelerated clearance from inflammation + ADA-mediated immune complex clearance
    const kelA_eff =
      kelA_base * p.inflammatoryClearance * (1 + 4.2 * ADA);

    if (p.mechanism === 'receptor_antagonist') {
      // C + R <-> CR ; A + R <-> AR
      const pC = prodC + koffC * CR;
      const dC = kelC + konC * R;

      const pA = koffA_eff * AR;
      const dA = kelA_eff + konA * R;

      const pR = koffC * CR + koffA_eff * AR;
      const dR = konC * C + konA * A;

      const pCR = konC * C * R;
      const dCR = koffC;

      const pAR = konA * A * R;
      const dAR = koffA_eff;

      const nextC = expStep(C, pC, dC, dt);
      const nextA = expStep(A, pA, dA, dt);
      let nextR = expStep(R, pR, dR, dt);
      let nextCR = expStep(CR, pCR, dCR, dt);
      let nextAR = expStep(AR, pAR, dAR, dt);

      // Enforce exact receptor mass conservation
      const pool = Math.max(1e-9, nextR + nextCR + nextAR);
      const scale = p.rTot_pM / pool;
      nextR *= scale;
      nextCR *= scale;
      nextAR *= scale;

      C = nextC;
      A = nextA;
      R = nextR;
      CR = nextCR;
      AR = nextAR;
    } else {
      // Ligand neutralizer: C + R <-> CR ; C + A <-> CA
      const pC = prodC + koffC * CR + koffA_eff * CA;
      const dC = kelC + konC * R + konA * A;

      const pA = koffA_eff * CA;
      const dA = kelA_eff + konA * C;

      const pCA = konA * C * A;
      const dCA = koffA_eff + kelCA * (1 + 1.2 * ADA);

      const pR = koffC * CR;
      const dR = konC * C;

      const pCR = konC * C * R;
      const dCR = koffC;

      const nextC = expStep(C, pC, dC, dt);
      const nextA = expStep(A, pA, dA, dt);
      const nextCA = expStep(CA, pCA, dCA, dt);
      let nextR = expStep(R, pR, dR, dt);
      let nextCR = expStep(CR, pCR, dCR, dt);

      const pool = Math.max(1e-9, nextR + nextCR);
      const scale = p.rTot_pM / pool;
      nextR *= scale;
      nextCR *= scale;

      C = nextC;
      A = nextA;
      CA = nextCA;
      R = nextR;
      CR = nextCR;
    }

    ADA = Math.min(3.5, expStep(ADA, adaProd, adaDecay, dt));
  }

  return trajectory;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, x))));
}

export function computeResistanceFromTrajectory(
  p: KineticParameters,
  trajectory: RawTrajectoryPoint[]
): {
  resistancePct: number;
  primaryPct: number;
  secondaryPct: number;
  troughOccPct: number;
  peakOccPct: number;
  meanSignalPct: number;
  troughAntagonistNm: number;
  targetTroughNm: number;
  adaPeak: number;
  kdC: number;
  kdA: number;
  kdAEff: number;
  affinityRatio: number;
} {
  const kdC = computeKd_pM(p.kon_C, p.koff_C);
  const kdA = computeKd_pM(p.kon_A, p.koff_A);
  const kdAEff = kdA * Math.max(1, p.mutationPenalty);
  const affinityRatio = kdC / Math.max(0.1, kdAEff);

  // Split early window (day 1-5) vs late trough window (day 14-28)
  const earlySlice = trajectory.filter((pt) => pt.hour >= 24 && pt.hour <= 120);
  const lateSlice = trajectory.filter((pt) => pt.hour >= 336);
  const activeLate = lateSlice.length > 0 ? lateSlice : trajectory;

  let peakOccPct = 0;
  let troughOccPct = 0;
  let minAntagonist = Infinity;
  let sumSignal = 0;
  let adaPeak = 0;

  for (const pt of trajectory) {
    if (pt.cytokineOccupancy_pct > peakOccPct) peakOccPct = pt.cytokineOccupancy_pct;
    sumSignal += pt.effectiveSignal_pct;
    if (pt.adaLevel_rel > adaPeak) adaPeak = pt.adaLevel_rel;
  }

  for (const pt of activeLate) {
    if (pt.cytokineOccupancy_pct > troughOccPct) troughOccPct = pt.cytokineOccupancy_pct;
    if (pt.freeAntagonist_nM < minAntagonist) minAntagonist = pt.freeAntagonist_nM;
  }

  const earlyMeanOcc =
    earlySlice.length > 0
      ? earlySlice.reduce((acc, pt) => acc + pt.cytokineOccupancy_pct, 0) / earlySlice.length
      : troughOccPct;

  const meanSignalPct = sumSignal / Math.max(1, trajectory.length);
  const troughAntagonistNm = Number.isFinite(minAntagonist) ? minAntagonist : 0;

  // Target trough concentration required for >80% cytokine receptor suppression
  const targetTroughNm = Math.max(
    1.5,
    ((4 * kdAEff * (1 + p.c0_pM / Math.max(1, kdC))) / 1000) * (1 + 0.5 * p.bypassPathway)
  );

  // Primary resistance log-odds: initial receptor escape + affinity mismatch + bypass signaling
  const primaryLogit =
    -2.25 +
    0.048 * Math.max(0, earlyMeanOcc - 16) +
    3.6 * Math.max(0, p.bypassPathway - 0.1) +
    0.85 * Math.log10(Math.max(0.1, kdAEff / Math.max(1, kdC) * 2.5));

  // Secondary resistance log-odds: late trough escape + ADA loss of exposure + trough deficit
  const troughDeficit = Math.max(0, 1 - troughAntagonistNm / Math.max(0.5, targetTroughNm));
  const secondaryLogit =
    -2.35 +
    0.052 * Math.max(0, troughOccPct - 18) +
    1.55 * adaPeak +
    1.7 * troughDeficit +
    0.45 * (p.inflammatoryClearance - 1);

  const primaryProb = sigmoid(primaryLogit);
  const secondaryProb = sigmoid(secondaryLogit);

  // Combined probability of therapeutic resistance (union of primary and secondary escape mechanisms)
  const combinedProb = 1 - (1 - primaryProb) * (1 - secondaryProb);

  // Decompose total probability proportionally into primary vs secondary contributors
  const rawSum = primaryProb + secondaryProb + 1e-6;
  const primaryShare = (combinedProb * primaryProb) / rawSum;
  const secondaryShare = (combinedProb * secondaryProb) / rawSum;

  return {
    resistancePct: Math.min(99.5, Math.max(0.5, combinedProb * 100)),
    primaryPct: primaryShare * 100,
    secondaryPct: secondaryShare * 100,
    troughOccPct,
    peakOccPct,
    meanSignalPct,
    troughAntagonistNm,
    targetTroughNm,
    adaPeak,
    kdC,
    kdA,
    kdAEff,
    affinityRatio,
  };
}

export function runFullSimulation(params: KineticParameters): SimulationResult {
  const baseTraj = simulateOdeTrajectory(params, 28, 0.125, 4);
  const baseEval = computeResistanceFromTrajectory(params, baseTraj);

  // Monte Carlo Virtual Patient Cohort (N = 140 stochastic trajectories for fast 60fps reactivity)
  const nSamples = 140;
  const rng = createSeededRng(hashParams(params));
  const nPoints = baseTraj.length;
  const occMatrix: number[][] = Array.from({ length: nPoints }, () => []);
  const sigMatrix: number[][] = Array.from({ length: nPoints }, () => []);
  const resistanceSamples: number[] = [];
  const primarySamples: number[] = [];
  const secondarySamples: number[] = [];

  for (let i = 0; i < nSamples; i++) {
    // Log-normal inter-individual variability (CV ~18% PK, ~20% cytokine, ~25% ADA)
    const perturbed: KineticParameters = {
      ...params,
      c0_pM: Math.max(10, params.c0_pM * Math.exp(0.22 * normalRandom(rng))),
      halfLife_days: Math.max(0.15, params.halfLife_days * Math.exp(0.18 * normalRandom(rng))),
      rTot_pM: Math.max(20, params.rTot_pM * Math.exp(0.16 * normalRandom(rng))),
      adaRisk: Math.min(1, Math.max(0, params.adaRisk * Math.exp(0.28 * normalRandom(rng)))),
      bypassPathway: Math.min(
        0.65,
        Math.max(0, params.bypassPathway + 0.04 * normalRandom(rng))
      ),
      inflammatoryClearance: Math.max(
        1,
        params.inflammatoryClearance * Math.exp(0.14 * normalRandom(rng))
      ),
    };

    const sampleTraj = simulateOdeTrajectory(perturbed, 28, 0.25, 4);
    const sampleEval = computeResistanceFromTrajectory(perturbed, sampleTraj);

    resistanceSamples.push(sampleEval.resistancePct);
    primarySamples.push(sampleEval.primaryPct);
    secondarySamples.push(sampleEval.secondaryPct);

    for (let t = 0; t < nPoints; t++) {
      const pt = sampleTraj[Math.min(t, sampleTraj.length - 1)];
      occMatrix[t].push(pt.cytokineOccupancy_pct);
      sigMatrix[t].push(pt.effectiveSignal_pct);
    }
  }

  // Sort samples for percentiles
  const sortedRes = [...resistanceSamples].sort((a, b) => a - b);
  const ci95Lower = sortedRes[Math.floor(0.05 * nSamples)] ?? baseEval.resistancePct;
  const ci95Upper = sortedRes[Math.min(nSamples - 1, Math.floor(0.95 * nSamples))] ?? baseEval.resistancePct;
  const meanResistance = resistanceSamples.reduce((a, b) => a + b, 0) / nSamples;
  const meanPrimary = primarySamples.reduce((a, b) => a + b, 0) / nSamples;
  const meanSecondary = secondarySamples.reduce((a, b) => a + b, 0) / nSamples;

  // Build 10-bin histogram (0-10%, 10-20%, ..., 90-100%)
  const histogramBins = Array.from({ length: 10 }, (_, idx) => {
    const min = idx * 10;
    const max = (idx + 1) * 10;
    const count = resistanceSamples.filter((v) =>
      idx === 9 ? v >= min && v <= max : v >= min && v < max
    ).length;
    return {
      rangeLabel: `${min}–${max}%`,
      min,
      max,
      count,
      frequency_pct: (count / nSamples) * 100,
    };
  });

  const timeSeries: TimeSeriesPoint[] = baseTraj.map((pt, idx) => {
    const occSorted = [...occMatrix[idx]].sort((a, b) => a - b);
    const sigSorted = [...sigMatrix[idx]].sort((a, b) => a - b);
    const lo = Math.floor(0.05 * nSamples);
    const hi = Math.min(nSamples - 1, Math.floor(0.95 * nSamples));
    return {
      hour: pt.hour,
      day: Number((pt.hour / 24).toFixed(2)),
      freeCytokine_pM: pt.freeCytokine_pM,
      freeAntagonist_nM: pt.freeAntagonist_nM,
      cytokineOccupancy_pct: pt.cytokineOccupancy_pct,
      antagonistNeutralization_pct: pt.antagonistNeutralization_pct,
      effectiveSignal_pct: pt.effectiveSignal_pct,
      adaLevel_rel: pt.adaLevel_rel,
      occLower_pct: occSorted[lo] ?? pt.cytokineOccupancy_pct,
      occUpper_pct: occSorted[hi] ?? pt.cytokineOccupancy_pct,
      signalLower_pct: sigSorted[lo] ?? pt.effectiveSignal_pct,
      signalUpper_pct: sigSorted[hi] ?? pt.effectiveSignal_pct,
    };
  });

  const riskLevel: RiskLevel =
    baseEval.resistancePct >= 50 ? 'high' : baseEval.resistancePct >= 25 ? 'moderate' : 'low';
  const riskLabel =
    riskLevel === 'high'
      ? 'Résistance Élevée'
      : riskLevel === 'moderate'
        ? 'Risque Modéré'
        : 'Réponse Probable';

  // Factor attribution (Sensitivity perturbation analysis around baseline)
  const attributions = computeAttributions(params, baseEval.resistancePct);

  // 6-Axis Radar Profile (normalized 0-100 risk load)
  const radarMetrics: RadarMetric[] = [
    {
      axis: 'Charge Cytokinique',
      patientValue: Math.min(100, (params.c0_pM / 450) * 100),
      optimalThreshold: 35,
      rawLabel: `${params.c0_pM.toFixed(0)} pM`,
    },
    {
      axis: 'Déficit Affinité',
      patientValue: Math.min(100, (baseEval.kdAEff / Math.max(1, baseEval.kdC)) * 45),
      optimalThreshold: 25,
      rawLabel: `Kd ${baseEval.kdAEff.toFixed(0)} pM`,
    },
    {
      axis: 'Immunogénicité ADA',
      patientValue: Math.min(100, params.adaRisk * 100),
      optimalThreshold: 20,
      rawLabel: `${(params.adaRisk * 100).toFixed(0)} %`,
    },
    {
      axis: 'Clairance PK',
      patientValue: Math.min(
        100,
        ((params.inflammatoryClearance - 1) / 3) * 60 +
          Math.max(0, 1 - baseEval.troughAntagonistNm / Math.max(1, baseEval.targetTroughNm)) * 40
      ),
      optimalThreshold: 30,
      rawLabel: `${params.inflammatoryClearance.toFixed(2)}×`,
    },
    {
      axis: 'Bypass Tissulaire',
      patientValue: Math.min(100, (params.bypassPathway / 0.65) * 100),
      optimalThreshold: 24,
      rawLabel: `${(params.bypassPathway * 100).toFixed(0)} %`,
    },
    {
      axis: 'Densité Récepteurs',
      patientValue: Math.min(100, (params.rTot_pM / 500) * 100),
      optimalThreshold: 40,
      rawLabel: `${params.rTot_pM.toFixed(0)} pM`,
    },
  ];

  return {
    params,
    kdC_pM: baseEval.kdC,
    kdA_pM: baseEval.kdA,
    kdAEff_pM: baseEval.kdAEff,
    affinityRatio: baseEval.affinityRatio,
    peakOccupancy_pct: baseEval.peakOccPct,
    troughOccupancy_pct: baseEval.troughOccPct,
    meanSignal_pct: baseEval.meanSignalPct,
    troughAntagonist_nM: baseEval.troughAntagonistNm,
    targetTrough_nM: baseEval.targetTroughNm,
    adaPeak_rel: baseEval.adaPeak,
    resistanceProbability_pct: baseEval.resistancePct,
    primaryResistance_pct: baseEval.primaryPct,
    secondaryResistance_pct: baseEval.secondaryPct,
    riskLevel,
    riskLabel,
    timeSeries,
    cohort: {
      nSamples,
      meanResistance_pct: meanResistance,
      ci95Lower_pct: ci95Lower,
      ci95Upper_pct: ci95Upper,
      primaryResistance_pct: meanPrimary,
      secondaryResistance_pct: meanSecondary,
      histogramBins,
    },
    attributions,
    radarMetrics,
  };
}

function computeAttributions(
  params: KineticParameters,
  baseResistance: number
): ResistanceFactorContribution[] {
  const evalScenario = (override: Partial<KineticParameters>) => {
    const traj = simulateOdeTrajectory({ ...params, ...override }, 28, 0.25, 4);
    return computeResistanceFromTrajectory({ ...params, ...override }, traj).resistancePct;
  };

  // Counterfactual reference (idealized low-risk baseline for each driver)
  const noAdaRes = evalScenario({ adaRisk: 0 });
  const noBypassRes = evalScenario({ bypassPathway: 0 });
  const noMutRes = evalScenario({ mutationPenalty: 1.0 });
  const normClearanceRes = evalScenario({ inflammatoryClearance: 1.0 });
  const normCytokineRes = evalScenario({ c0_pM: 60, feedbackGain: 0.4 });
  const doubleDoseRes = evalScenario({ dose_mg: params.dose_mg * 2 });

  const items: ResistanceFactorContribution[] = [
    {
      id: 'ada',
      label: 'Anticorps anti-médicament (ADA)',
      impact_pct: baseResistance - noAdaRes,
      valueFormatted: `${(params.adaRisk * 100).toFixed(0)} % risque`,
      detail: 'Accélère la clairance sérique et réduit la concentration résiduelle.',
    },
    {
      id: 'bypass',
      label: 'Redondance / Bypass cytokinique',
      impact_pct: baseResistance - noBypassRes,
      valueFormatted: `${(params.bypassPathway * 100).toFixed(0)} % voie alt.`,
      detail: 'Signalisation pro-inflammatoire maintenue via des axes parallèles.',
    },
    {
      id: 'cytokine_load',
      label: 'Charge cytokinaire & rétroaction',
      impact_pct: baseResistance - normCytokineRes,
      valueFormatted: `${params.c0_pM.toFixed(0)} pM`,
      detail: 'Pression compétitive élevée saturant l’antagoniste en phase tissulaire.',
    },
    {
      id: 'mutation',
      label: 'Perte d’affinité / Variant Kd',
      impact_pct: baseResistance - noMutRes,
      valueFormatted: `${params.mutationPenalty.toFixed(1)}× pénalité Kd`,
      detail: 'Altération stérique ou mutation du site de liaison augmentant koff.',
    },
    {
      id: 'clearance',
      label: 'Clairance inflammatoire (TMDD)',
      impact_pct: baseResistance - normClearanceRes,
      valueFormatted: `${params.inflammatoryClearance.toFixed(2)}× basal`,
      detail: 'Consommation tissulaire accrue de l’antagoniste en foyer inflammatoire.',
    },
    {
      id: 'dose_headroom',
      label: 'Marge d’escalade posologique (2×)',
      impact_pct: doubleDoseRes - baseResistance,
      valueFormatted: `${params.dose_mg.toFixed(0)} mg / ${params.interval_days} j`,
      detail: 'Réduction attendue du risque de résistance en doublant la dose unitaire.',
    },
  ];

  return items.sort((a, b) => Math.abs(b.impact_pct) - Math.abs(a.impact_pct));
}

export function computeSensitivitySurface(
  params: KineticParameters,
  mode: 'dose_vs_cytokine' | 'kd_vs_ada' = 'dose_vs_cytokine'
): SensitivitySurface {
  const xSteps = 16;
  const ySteps = 11;

  if (mode === 'dose_vs_cytokine') {
    const minDose = Math.max(10, Math.round(params.dose_mg * 0.25));
    const maxDose = Math.max(100, Math.round(params.dose_mg * 2.5));
    const xValues = Array.from({ length: xSteps }, (_, i) =>
      Math.round(minDose + ((maxDose - minDose) * i) / (xSteps - 1))
    );
    const yValues = Array.from({ length: ySteps }, (_, j) =>
      Math.round(40 + ((420 - 40) * j) / (ySteps - 1))
    );

    const cells: SensitivityCell[] = [];
    for (let yIdx = 0; yIdx < ySteps; yIdx++) {
      for (let xIdx = 0; xIdx < xSteps; xIdx++) {
        const testP: KineticParameters = {
          ...params,
          dose_mg: xValues[xIdx],
          c0_pM: yValues[yIdx],
        };
        const traj = simulateOdeTrajectory(testP, 28, 0.25, 8);
        const ev = computeResistanceFromTrajectory(testP, traj);
        cells.push({
          xIndex: xIdx,
          yIndex: yIdx,
          xValue: xValues[xIdx],
          yValue: yValues[yIdx],
          resistance_pct: ev.resistancePct,
          troughOcc_pct: ev.troughOccPct,
        });
      }
    }

    return {
      xLabel: 'Dose unitaire administrée',
      xUnit: 'mg',
      yLabel: 'Concentration cytokinaire basale [C]₀',
      yUnit: 'pM',
      xValues,
      yValues,
      cells,
      currentX: params.dose_mg,
      currentY: params.c0_pM,
    };
  }

  // Mode: kd_vs_ada (Mutation/Kd penalty vs ADA immunogenicity)
  const xValues = Array.from({ length: xSteps }, (_, i) =>
    Number((1 + ((12 - 1) * i) / (xSteps - 1)).toFixed(1))
  );
  const yValues = Array.from({ length: ySteps }, (_, j) =>
    Number(((0.8 * j) / (ySteps - 1)).toFixed(2))
  );

  const cells: SensitivityCell[] = [];
  for (let yIdx = 0; yIdx < ySteps; yIdx++) {
    for (let xIdx = 0; xIdx < xSteps; xIdx++) {
      const testP: KineticParameters = {
        ...params,
        mutationPenalty: xValues[xIdx],
        adaRisk: yValues[yIdx],
      };
      const traj = simulateOdeTrajectory(testP, 28, 0.25, 8);
      const ev = computeResistanceFromTrajectory(testP, traj);
      cells.push({
        xIndex: xIdx,
        yIndex: yIdx,
        xValue: xValues[xIdx],
        yValue: yValues[yIdx],
        resistance_pct: ev.resistancePct,
        troughOcc_pct: ev.troughOccPct,
      });
    }
  }

  return {
    xLabel: 'Facteur de perte d’affinité (Kd eff / Kd)',
    xUnit: '×',
    yLabel: 'Risque d’immunogénicité (ADA)',
    yUnit: 'indice',
    xValues,
    yValues,
    cells,
    currentX: params.mutationPenalty,
    currentY: params.adaRisk,
  };
}

export function optimizeRegimen(
  params: KineticParameters,
  currentResistancePct: number
): RegimenOptimizationResult {
  const doseMultipliers = [1.0, 1.25, 1.5, 2.0, 2.5];
  const candidateIntervals =
    params.interval_days <= 2
      ? [1, 0.5]
      : [params.interval_days, Math.max(7, Math.round(params.interval_days / 2))];

  let bestDose = params.dose_mg;
  let bestInterval = params.interval_days;
  let bestRes = currentResistancePct;
  let bestTroughOcc = 100;
  let bestTroughAntagonist = 0;

  for (const mult of doseMultipliers) {
    for (const interval of candidateIntervals) {
      const candDose = Math.round(params.dose_mg * mult);
      const testP: KineticParameters = {
        ...params,
        dose_mg: candDose,
        interval_days: interval,
      };
      const traj = simulateOdeTrajectory(testP, 28, 0.25, 4);
      const ev = computeResistanceFromTrajectory(testP, traj);

      // Prefer lowest resistance, tie-break with lower cumulative drug exposure
      if (ev.resistancePct < bestRes - 0.5) {
        bestRes = ev.resistancePct;
        bestDose = candDose;
        bestInterval = interval;
        bestTroughOcc = ev.troughOccPct;
        bestTroughAntagonist = ev.troughAntagonistNm;
      }
    }
  }

  const delta = bestRes - currentResistancePct;
  const requiresMechanismSwitch = bestRes > 42 || params.bypassPathway >= 0.35;

  let clinicalRecommendation = '';
  if (currentResistancePct < 22) {
    clinicalRecommendation = `Le schéma actuel (${params.dose_mg} mg / ${params.interval_days} j) maintient une suppression cytokinaire adéquate sans escalade nécessaire.`;
  } else if (requiresMechanismSwitch) {
    clinicalRecommendation = `Résistance intrinsèque persistante (${bestRes.toFixed(1)} %) malgré l'optimisation de dose : une bascule vers un autre axe cytokinique ou une bithérapie ciblée est recommandée.`;
  } else {
    clinicalRecommendation = `Ajuster la posologie à ${bestDose} mg toutes les ${bestInterval === 0.5 ? '12 h' : `${bestInterval} j`} réduit la probabilité de résistance de ${Math.abs(delta).toFixed(1)} points.`;
  }

  return {
    recommendedDose_mg: bestDose,
    recommendedInterval_days: bestInterval,
    predictedResistance_pct: bestRes,
    predictedTroughOcc_pct: bestTroughOcc,
    predictedTroughAntagonist_nM: bestTroughAntagonist,
    deltaResistance_pct: delta,
    requiresMechanismSwitch,
    clinicalRecommendation,
  };
}
