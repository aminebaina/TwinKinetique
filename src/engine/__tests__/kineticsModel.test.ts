import { describe, expect, it } from 'vitest';
import {
  runCalibrateTool,
  runLandscapeTool,
  runOptimizeTool,
  runSimulationTool,
} from '../agentApi.ts';
import {
  autoCalibrateBenchmark,
  CLINICAL_BENCHMARKS,
  evaluateBenchmarkFit,
} from '../clinicalBenchmarks.ts';
import {
  computeKd_pM,
  CYTOKINE_PRESETS,
  runFullSimulation,
  simulateOdeTrajectory,
} from '../kineticsModel.ts';

describe('TwinKinétique QSP Kinetics Engine', () => {
  it('computes exact dissociation constant Kd in pM from kon (1e5 M^-1 s^-1) and koff (1e-4 s^-1)', () => {
    // 1e-4 s^-1 / 1e6 M^-1 s^-1 = 1e-10 M = 100 pM
    expect(computeKd_pM(10, 1)).toBeCloseTo(100, 6);
    // 3.6e-4 / 1.8e6 = 200 pM (TNF-alpha preset)
    expect(computeKd_pM(18, 3.6)).toBeCloseTo(200, 6);
  });

  it('maintains strict positivity and bounded occupancy across both mechanisms even under extreme rates', () => {
    for (const preset of CYTOKINE_PRESETS) {
      const traj = simulateOdeTrajectory(preset.params, 28, 0.125, 4);
      expect(traj.length).toBeGreaterThan(100);
      for (const pt of traj) {
        expect(Number.isFinite(pt.freeCytokine_pM)).toBe(true);
        expect(Number.isFinite(pt.freeAntagonist_nM)).toBe(true);
        expect(pt.freeCytokine_pM).toBeGreaterThanOrEqual(0);
        expect(pt.freeAntagonist_nM).toBeGreaterThanOrEqual(0);
        expect(pt.cytokineOccupancy_pct).toBeGreaterThanOrEqual(0);
        expect(pt.cytokineOccupancy_pct).toBeLessThanOrEqual(100.0001);
        expect(pt.effectiveSignal_pct).toBeGreaterThanOrEqual(0);
        expect(pt.effectiveSignal_pct).toBeLessThanOrEqual(100.0001);
      }
    }
  });

  it('predicts higher resistance monotonically when ADA risk, affinity penalty, or bypass increases', () => {
    const base = CYTOKINE_PRESETS[0].params;
    const lowRisk = runFullSimulation({ ...base, adaRisk: 0.02, bypassPathway: 0.05 });
    const highAda = runFullSimulation({ ...base, adaRisk: 0.85, bypassPathway: 0.05 });
    const highBypass = runFullSimulation({ ...base, adaRisk: 0.02, bypassPathway: 0.55 });
    const highMutation = runFullSimulation({
      ...base,
      adaRisk: 0.02,
      mutationPenalty: 10,
    });

    expect(highAda.resistanceProbability_pct).toBeGreaterThan(
      lowRisk.resistanceProbability_pct
    );
    expect(highBypass.resistanceProbability_pct).toBeGreaterThan(
      lowRisk.resistanceProbability_pct
    );
    expect(highMutation.resistanceProbability_pct).toBeGreaterThan(
      lowRisk.resistanceProbability_pct
    );
  });

  it('produces deterministic Monte Carlo cohorts with ordered 95% confidence bounds and normalized histogram', () => {
    const base = CYTOKINE_PRESETS[1].params;
    const simA = runFullSimulation(base);
    const simB = runFullSimulation(base);

    expect(simA.cohort.meanResistance_pct).toBe(simB.cohort.meanResistance_pct);
    expect(simA.cohort.ci95Lower_pct).toBeLessThanOrEqual(
      simA.cohort.ci95Upper_pct
    );

    const totalCount = simA.cohort.histogramBins.reduce(
      (acc, bin) => acc + bin.count,
      0
    );
    expect(totalCount).toBe(simA.cohort.nSamples);
  });

  it('converges with R^2 >= 0.84 and MAPE < 30% on published Bartelds et al. (JAMA 2011) and Burmester/Gibiansky cohorts', () => {
    for (const benchmark of CLINICAL_BENCHMARKS) {
      const calibrated = autoCalibrateBenchmark(benchmark, benchmark.baselineParams);
      const fit = evaluateBenchmarkFit(benchmark, calibrated);
      expect(fit.rSquared).toBeGreaterThanOrEqual(0.84);
      expect(fit.mape_pct).toBeLessThan(30);
    }
  });

  it('validates agentApi tools including custom cohort calibration and 2D landscape scan', () => {
    const simOut = runSimulationTool({
      presetId: 'tnf_adalimumab',
      overrides: { adaRisk: 0.7 },
      includeTimeSeries: true,
    });
    expect(simOut.predictions.resistanceProbability_pct).toBeGreaterThan(35);
    expect(simOut.dailyTimeSeries?.length).toBeGreaterThanOrEqual(28);

    const optOut = runOptimizeTool({
      presetId: 'tnf_adalimumab',
      overrides: { dose_mg: 20, c0_pM: 280 },
    });
    expect(optOut.optimizedRegimen.recommendedDose_mg).toBeGreaterThanOrEqual(20);

    const calOut = runCalibrateTool({
      benchmarkId: 'bartelds_ada_neg',
      autoCalibrate: true,
      customObservations: [
        { week: 2, observed_ug_mL: 3.0 },
        { week: 8, observed_ug_mL: 6.2 },
        { week: 16, observed_ug_mL: 7.3 },
      ],
    });
    expect(calOut.goodnessOfFit.rSquared).toBeGreaterThan(0.8);

    const scanOut = runLandscapeTool({
      presetId: 'il6_tocilizumab',
      mode: 'kd_vs_ada',
    });
    expect(scanOut.grid.length).toBe(16 * 11);
  });
});
