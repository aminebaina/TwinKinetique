export type BindingMechanism = 'ligand_neutralizer' | 'receptor_antagonist';

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface KineticParameters {
  presetId: string;
  cytokineName: string;
  receptorName: string;
  antagonistName: string;
  indication: string;
  mechanism: BindingMechanism;

  // Cytokine & Receptor parameters
  c0_pM: number; // Initial / baseline inflammatory cytokine concentration (pM)
  kon_C: number; // Cytokine association rate (1e5 M^-1 s^-1)
  koff_C: number; // Cytokine dissociation rate (1e-4 s^-1)
  rTot_pM: number; // Effective tissue receptor density (pM eq.)
  feedbackGain: number; // Autocrine inflammatory amplification factor (0 to 3)

  // Antagonist & PK parameters
  dose_mg: number; // Administered dose (mg)
  interval_days: number; // Dosing interval (days)
  halfLife_days: number; // Elimination half-life (days)
  kon_A: number; // Antagonist association rate (1e5 M^-1 s^-1)
  koff_A: number; // Antagonist dissociation rate (1e-4 s^-1)
  molecularWeight_kDa: number; // MW for mg -> nM plasma conversion

  // Patient Digital Twin Escape / Resistance Modifiers
  adaRisk: number; // Immunogenicity / ADA emergence propensity (0 to 1)
  mutationPenalty: number; // Binding affinity loss factor (1x = wild type, up to 20x Kd shift)
  bypassPathway: number; // Redundant cytokine pathway signaling fraction (0 to 0.65)
  inflammatoryClearance: number; // Target-mediated / inflamed tissue accelerated clearance (1x to 4x)
}

export interface KineticPreset {
  id: string;
  label: string;
  shortLabel: string;
  clinicalContext: string;
  description: string;
  params: KineticParameters;
}

export interface TimeSeriesPoint {
  hour: number;
  day: number;
  freeCytokine_pM: number;
  freeAntagonist_nM: number;
  cytokineOccupancy_pct: number;
  antagonistNeutralization_pct: number;
  effectiveSignal_pct: number;
  adaLevel_rel: number;
  // Cohort confidence bounds (5th - 95th percentile)
  occLower_pct: number;
  occUpper_pct: number;
  signalLower_pct: number;
  signalUpper_pct: number;
}

export interface ResistanceFactorContribution {
  id: string;
  label: string;
  impact_pct: number; // Positive increases resistance, negative is protective
  valueFormatted: string;
  detail: string;
}

export interface RadarMetric {
  axis: string;
  patientValue: number; // 0 to 100 normalized risk load
  optimalThreshold: number; // 0 to 100 reference threshold
  rawLabel: string;
}

export interface CohortSimulationSummary {
  nSamples: number;
  meanResistance_pct: number;
  ci95Lower_pct: number;
  ci95Upper_pct: number;
  primaryResistance_pct: number;
  secondaryResistance_pct: number;
  histogramBins: {
    rangeLabel: string;
    min: number;
    max: number;
    count: number;
    frequency_pct: number;
  }[];
}

export interface SimulationResult {
  params: KineticParameters;
  kdC_pM: number;
  kdA_pM: number;
  kdAEff_pM: number;
  affinityRatio: number; // KdC / KdA_eff
  peakOccupancy_pct: number;
  troughOccupancy_pct: number;
  meanSignal_pct: number;
  troughAntagonist_nM: number;
  targetTrough_nM: number;
  adaPeak_rel: number;
  resistanceProbability_pct: number;
  primaryResistance_pct: number;
  secondaryResistance_pct: number;
  riskLevel: RiskLevel;
  riskLabel: string;
  timeSeries: TimeSeriesPoint[];
  cohort: CohortSimulationSummary;
  attributions: ResistanceFactorContribution[];
  radarMetrics: RadarMetric[];
}

export interface SensitivityCell {
  xIndex: number;
  yIndex: number;
  xValue: number;
  yValue: number;
  resistance_pct: number;
  troughOcc_pct: number;
}

export interface SensitivitySurface {
  xLabel: string;
  xUnit: string;
  yLabel: string;
  yUnit: string;
  xValues: number[];
  yValues: number[];
  cells: SensitivityCell[];
  currentX: number;
  currentY: number;
}

export interface RegimenOptimizationResult {
  recommendedDose_mg: number;
  recommendedInterval_days: number;
  predictedResistance_pct: number;
  predictedTroughOcc_pct: number;
  predictedTroughAntagonist_nM: number;
  deltaResistance_pct: number;
  requiresMechanismSwitch: boolean;
  clinicalRecommendation: string;
}

export interface ClinicalDataPoint {
  week: number;
  day: number;
  observed_ug_mL: number;
  sd_ug_mL: number;
  observed_nM: number;
  sd_nM: number;
  label: string;
}

export interface ClinicalBenchmark {
  id: string;
  title: string;
  citation: string;
  cohortDescription: string;
  observedFailureRate_pct: number;
  horizonDays: number;
  baselineParams: KineticParameters;
  dataPoints: ClinicalDataPoint[];
}

export interface CalibrationPointComparison {
  week: number;
  day: number;
  label: string;
  observed_nM: number;
  sd_nM: number;
  observed_ug_mL: number;
  sd_ug_mL: number;
  predicted_nM: number;
  predicted_ug_mL: number;
  residual_nM: number;
  standardizedResidual: number;
}

export interface CalibrationFitResult {
  benchmark: ClinicalBenchmark;
  fittedParams: KineticParameters;
  horizonTrajectory: {
    day: number;
    week: number;
    predicted_nM: number;
    predicted_ug_mL: number;
    ciLower_nM: number;
    ciUpper_nM: number;
    cytokineOccupancy_pct: number;
    adaLevel_rel: number;
  }[];
  comparisons: CalibrationPointComparison[];
  rmse_nM: number;
  rmse_ug_mL: number;
  mape_pct: number;
  rSquared: number;
  meanBias_nM: number;
  predictedResistance_pct: number;
}

