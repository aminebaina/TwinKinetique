export type Language = 'en' | 'fr';

export interface TranslationDictionary {
  meta: {
    pageTitle: string;
    footerLeft: string;
    footerRight: string;
    exportFilenameSuffix: string;
  };
  nav: {
    kinetics: string;
    calibration: string;
    sensitivity: string;
    cohort: string;
    equations: string;
    exportReport: string;
    ariaLabel: string;
  };
  mobileNav: {
    kinetics: string;
    calibration: string;
    sensitivity: string;
    cohort: string;
    equations: string;
  };
  ribbon: {
    axisLabel: string;
    mechNeutralizer: string;
    mechReceptor: string;
    statusPrefix: string;
    optimizeBtn: string;
    resetBtn: string;
    resetTitle: string;
    dayShort: string;
    hourShort: string;
    riskLabels: {
      low: string;
      moderate: string;
      high: string;
    };
  };
  presets: Record<
    string,
    {
      label: string;
      indication: string;
      clinicalContext: string;
      description: string;
    }
  >;
  kpi: {
    ariaLabel: string;
    resistanceTitle: string;
    primaryShort: string;
    secondaryShort: string;
    occupancyTitle: string;
    peakLabel: string;
    targetLt: string;
    affinityTitle: string;
    troughTitle: string;
    thresholdGe: string;
    exposureCovered: string;
    underExposed: string;
  };
  sidebar: {
    ariaLabel: string;
    group1Prefix: string;
    group2Prefix: string;
    group3: string;
    clickToEdit: string;
    c0Label: string;
    konCLabel: string;
    koffCLabel: string;
    densityPrefix: string;
    feedbackLabel: string;
    feedbackHint: string;
    mechanismLabel: string;
    mechNeutralizerShort: string;
    mechReceptorShort: string;
    doseLabel: string;
    intervalLabel: string;
    halfLifeLabel: string;
    konALabel: string;
    koffALabel: string;
    adaLabel: string;
    mutationLabel: string;
    bypassLabel: string;
    bypassHint: string;
    clearanceLabel: string;
    recommendationTitle: string;
    applyPrefix: string;
    resistanceSuffix: string;
    unitIndex: string;
    unitFraction: string;
    unitDays: string;
  };
  kineticsChart: {
    title: string;
    subtitle: string;
    layers: {
      ci95: string;
      effectiveSignal: string;
      neutralization: string;
      antagonistPk: string;
    };
    hud: {
      dayPrefix: string;
      signalEff: string;
      neutral: string;
      probeActive: string;
      cycleEnd: string;
    };
    escapeThreshold: string;
    legend: {
      occupancyPrefix: string;
      signalBypass: string;
      neutralPrefix: string;
      concPrefix: string;
      ci95Band: string;
    };
    subTitle: string;
    subSubtitle: string;
    cytEndLabel: string;
    adaIndexLabel: string;
    subLegendCytPrefix: string;
    subLegendAda: string;
  };
  sensitivity: {
    title: string;
    subtitle: string;
    modeDoseVsCyt: string;
    modeKdVsAda: string;
    pResistanceLabel: string;
    troughOccLabel: string;
    applyScenario: string;
    scaleLabel: string;
    currentPointLabel: string;
    xLabelDose: string;
    yLabelCyt: string;
    xLabelKd: string;
    yLabelAda: string;
    unitTimes: string;
    unitIndex: string;
  };
  cohort: {
    radarTitle: string;
    radarSubtitle: string;
    radarLegendPatient: string;
    radarLegendOptimal: string;
    histTitlePrefix: string;
    histTitleSuffix: string;
    histSubtitlePrefix: string;
    histMeanLabel: string;
    histXAxis: string;
    ci95Label: string;
    primaryShareLabel: string;
    secondaryShareLabel: string;
    attrTitle: string;
    attrSubtitle: string;
    colFactor: string;
    colPatientVal: string;
    colImpact: string;
    colInterpretation: string;
    ptsUnit: string;
    compTitle: string;
    switchBtn: string;
    colScenario: string;
    colRegimen: string;
    colTrough: string;
    colOcc: string;
    colResistance: string;
    currentScenario: string;
    optimizedScenario: string;
    radarAxes: Record<string, string>;
    attributions: Record<
      string,
      { label: string; detail: string; valueSuffix?: string }
    >;
  };
  calibration: {
    title: string;
    sourcePrefix: string;
    autoCalibrate: string;
    calibratedDone: string;
    modeStudy: string;
    modeLive: string;
    loadIntoSim: string;
    loadIntoSimTitle: string;
    r2Label: string;
    rmseLabel: string;
    mapeLabel: string;
    predVsObsLabel: string;
    obsShort: string;
    vpcTitle: string;
    vpcSubtitle: string;
    obsPrefix: string;
    predPrefix: string;
    yAxisLabel: string;
    legendPred: string;
    legendVpc: string;
    legendObs: string;
    wresTitle: string;
    wresSubtitle: string;
    visitsTitle: string;
    activeParamsPrefix: string;
    colVisit: string;
    colObsSd: string;
    colPredOde: string;
    weekPrefix: string;
    troughWord: string;
    benchmarks: Record<string, { title: string; cohortDescription: string }>;
  };
  equations: {
    title: string;
    subtitle: string;
    sec1Title: string;
    sec2Title: string;
    mutNote: string;
    tableTitle: string;
    colParam: string;
    colSymbol: string;
    colValue: string;
    colUnit: string;
    rows: {
      kdC: string;
      kdA: string;
      kdAEff: string;
      mw: string;
      occ: string;
      adaPeak: string;
    };
    unitAu: string;
  };
  recommendation: {
    adequate: (dose: number, intervalStr: string) => string;
    switchNeeded: (bestRes: number) => string;
    adjust: (dose: number, intervalStr: string, absDelta: number) => string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    meta: {
      pageTitle: 'TwinKinétique — Cytokine Binding Kinetics & Therapeutic Resistance',
      footerLeft: 'TwinKinétique · Mechanistic QSP Modeling for Digital Twin Health Platform',
      footerRight: 'Research & clinical decision-support prototype · 28-day integration horizon (672 h)',
      exportFilenameSuffix: 'report',
    },
    nav: {
      kinetics: 'PK/PD Simulator',
      calibration: 'Clinical Calibration',
      sensitivity: '2D Landscape',
      cohort: 'Virtual Cohort',
      equations: 'Equations',
      exportReport: 'Export Report',
      ariaLabel: 'Platform views',
    },
    mobileNav: {
      kinetics: 'PK/PD Simulator',
      calibration: 'Calibration',
      sensitivity: '2D Landscape',
      cohort: 'Cohort',
      equations: 'Equations',
    },
    ribbon: {
      axisLabel: 'Therapeutic Axis',
      mechNeutralizer: 'Soluble ligand neutralization',
      mechReceptor: 'Competitive receptor blockade',
      statusPrefix: 'Twin Status',
      optimizeBtn: 'Optimize regimen',
      resetBtn: 'Reset',
      resetTitle: 'Reset parameters to preset baseline',
      dayShort: 'd',
      hourShort: 'h',
      riskLabels: {
        low: 'Probable Response',
        moderate: 'Moderate Risk',
        high: 'High Resistance',
      },
    },
    presets: {
      tnf_adalimumab: {
        label: 'TNF-α / Adalimumab',
        indication: 'Rheumatoid arthritis',
        clinicalContext: 'Active rheumatoid arthritis · Anti-TNFα biologic therapy',
        description:
          'Soluble and transmembrane TNF-α neutralization by human IgG1 monoclonal antibody. Sensitive to anti-drug antibody (ADA) emergence.',
      },
      il6_tocilizumab: {
        label: 'IL-6 / Tocilizumab',
        indication: 'Refractory RA / CRS',
        clinicalContext: 'Severe inflammatory syndrome / Refractory RA · Anti-IL-6Rα',
        description:
          'Direct competitive blockade of membrane and soluble IL-6Rα preventing gp130 dimerization and JAK/STAT3 signaling.',
      },
      il1b_anakinra: {
        label: 'IL-1β / Anakinra',
        indication: 'Recurrent pericarditis',
        clinicalContext: 'Autoinflammatory disease / Pericarditis · IL-1R1 antagonist',
        description:
          'Short-acting recombinant IL-1R1 antagonist with rapid renal clearance requiring sustained daily exposure.',
      },
      il17a_secukinumab: {
        label: 'IL-17A / Secukinumab',
        indication: 'Axial spondyloarthritis',
        clinicalContext: 'Axial spondyloarthritis · IL-17A neutralization',
        description:
          'Selective sequestration of IL-17A homodimer. Escape risk driven by compensatory IL-17F and IL-23 redundancy.',
      },
      il23_risankizumab: {
        label: 'IL-23 (p19) / Risankizumab',
        indication: "Crohn's disease",
        clinicalContext: "Moderate-to-severe Crohn's disease · High-affinity anti-p19",
        description:
          'High-affinity inhibition of the IL-23 p19 subunit blocking pathogenic Th17 differentiation across extended dosing intervals.',
      },
    },
    kpi: {
      ariaLabel: 'Key kinetic indicators',
      resistanceTitle: 'Resistance probability',
      primaryShort: '1st',
      secondaryShort: '2nd',
      occupancyTitle: 'Cytokine occupancy θCR (trough)',
      peakLabel: 'Peak',
      targetLt: 'Target < 20.0 %',
      affinityTitle: 'Affinity ratio (Kd C / Kd A eff)',
      troughTitle: 'Trough antagonist (C trough)',
      thresholdGe: 'Target ≥',
      exposureCovered: 'Exposure covered',
      underExposed: 'Under-exposed',
    },
    sidebar: {
      ariaLabel: 'Kinetic and patient parameters',
      group1Prefix: '01. Cytokine Kinetics',
      group2Prefix: '02. Antagonist',
      group3: '03. Escape & Patient Twin',
      clickToEdit: 'Click to enter an exact value',
      c0Label: 'Baseline concentration [C]₀',
      konCLabel: 'Association kon,C',
      koffCLabel: 'Dissociation koff,C',
      densityPrefix: 'Density',
      feedbackLabel: 'Autocrine feedback',
      feedbackHint: 'NF-κB / STAT amplification',
      mechanismLabel: 'Inhibition mechanism',
      mechNeutralizerShort: 'Neutralization',
      mechReceptorShort: 'R Blockade',
      doseLabel: 'Administered dose',
      intervalLabel: 'Dosing interval',
      halfLifeLabel: 'PK half-life (t₁/₂)',
      konALabel: 'Association kon,A',
      koffALabel: 'Dissociation koff,A',
      adaLabel: 'ADA propensity (immunogenicity)',
      mutationLabel: 'Affinity penalty (Kd variant)',
      bypassLabel: 'Pathway redundancy / Bypass',
      bypassHint: 'e.g., IL-17F / IL-6 switch',
      clearanceLabel: 'Inflammatory clearance (TMDD)',
      recommendationTitle: 'Twin Recommendation',
      applyPrefix: 'Apply',
      resistanceSuffix: 'resistance',
      unitIndex: 'idx',
      unitFraction: 'frac',
      unitDays: 'd',
    },
    kineticsChart: {
      title: 'Receptor occupancy kinetics & antagonist exposure (0–28 d)',
      subtitle: 'Coupled ODE solution',
      layers: {
        ci95: '95% Cohort CI',
        effectiveSignal: 'Bypass Signal',
        neutralization: 'Neutralization',
        antagonistPk: 'Antagonist PK (nM)',
      },
      hud: {
        dayPrefix: 'D',
        signalEff: 'Eff. signal',
        neutral: 'Neutral.',
        probeActive: 'Probe active',
        cycleEnd: 'Cycle end (D28)',
      },
      escapeThreshold: 'Critical escape threshold (20% θCR)',
      legend: {
        occupancyPrefix: 'Occupancy θCR (%)',
        signalBypass: 'Effective inflammatory signal (+ bypass)',
        neutralPrefix: 'Neutralization / Blockade (%)',
        concPrefix: 'Free concentration (nM)',
        ci95Band: '95% Cohort CI envelope',
      },
      subTitle: 'Free cytokine dynamics & anti-drug antibody (ADA) emergence',
      subSubtitle: 'Captures autocrine rebound and immunogenicity-driven clearance acceleration',
      cytEndLabel: 'free',
      adaIndexLabel: 'ADA index',
      subLegendCytPrefix: 'Free concentration (pM)',
      subLegendAda: 'Emerging ADA titer (a.u., right axis)',
    },
    sensitivity: {
      title: '2D Sensitivity Landscape: Therapeutic Resistance Probability',
      subtitle:
        'Multiparametric matrix solved on coupled ODEs (D28) · Click any cell to project scenario into the twin',
      modeDoseVsCyt: 'Dose × Load [C]₀',
      modeKdVsAda: 'Kd Affinity × ADA',
      pResistanceLabel: 'P(Resistance)',
      troughOccLabel: 'Trough θCR',
      applyScenario: 'Apply scenario',
      scaleLabel: 'P(Resistance) scale:',
      currentPointLabel: 'Current Digital Twin operating point',
      xLabelDose: 'Unit administered dose',
      yLabelCyt: 'Baseline cytokine concentration [C]₀',
      xLabelKd: 'Affinity loss factor (Kd eff / Kd)',
      yLabelAda: 'Immunogenicity risk (ADA)',
      unitTimes: '×',
      unitIndex: 'index',
    },
    cohort: {
      radarTitle: 'Digital Twin Vulnerability Profile',
      radarSubtitle:
        'Normalized risk load (0–100) across 6 biophysical resistance axes vs optimal response zone',
      radarLegendPatient: 'Current virtual patient',
      radarLegendOptimal: 'Durable response target',
      histTitlePrefix: 'Stochastic Cohort Distribution (N =',
      histTitleSuffix: 'twins)',
      histSubtitlePrefix: 'Log-normal inter-individual variability (PK, receptor density, ADA) · Mean',
      histMeanLabel: 'Mean',
      histXAxis: 'Predicted resistance probability bin (%)',
      ci95Label: '95% Cohort CI',
      primaryShareLabel: 'Primary Share',
      secondaryShareLabel: 'Secondary Share',
      attrTitle: 'Mechanistic Attribution of Therapeutic Escape Drivers',
      attrSubtitle:
        'Marginal contribution estimated via counterfactual simulation on the active digital twin',
      colFactor: 'Biophysical driver',
      colPatientVal: 'Patient value',
      colImpact: 'Δ P(Resistance)',
      colInterpretation: 'Mechanistic interpretation',
      ptsUnit: 'pts',
      compTitle: 'Comparison: Current Regimen vs Optimized Regimen',
      switchBtn: 'Switch to optimized regimen',
      colScenario: 'Scenario',
      colRegimen: 'Regimen',
      colTrough: 'C trough (nM)',
      colOcc: 'Trough θCR (%)',
      colResistance: 'P(Resistance)',
      currentScenario: 'Current regimen',
      optimizedScenario: 'Twin-optimized regimen',
      radarAxes: {
        'Charge Cytokinique': 'Cytokine Load',
        'Déficit Affinité': 'Affinity Deficit',
        'Immunogénicité ADA': 'ADA Immunogenicity',
        'Clairance PK': 'PK Clearance',
        'Bypass Tissulaire': 'Tissue Bypass',
        'Densité Récepteurs': 'Receptor Density',
      },
      attributions: {
        ada: {
          label: 'Anti-drug antibodies (ADA)',
          detail: 'Accelerates serum clearance and depletes trough concentration.',
        },
        bypass: {
          label: 'Cytokine redundancy / Bypass',
          detail: 'Pro-inflammatory signaling sustained via parallel cytokine axes.',
        },
        cytokine_load: {
          label: 'Cytokine load & feedback',
          detail: 'High competitive pressure saturating antagonist in target tissue.',
        },
        mutation: {
          label: 'Affinity loss / Kd variant',
          detail: 'Steric alteration or binding-site mutation increasing koff.',
        },
        clearance: {
          label: 'Inflammatory clearance (TMDD)',
          detail: 'Elevated tissue consumption of antagonist at inflammatory sites.',
        },
        dose_headroom: {
          label: 'Dose escalation headroom (2×)',
          detail: 'Expected resistance risk reduction when doubling unit dose.',
        },
      },
    },
    calibration: {
      title: 'Empirical validation against published clinical dataset',
      sourcePrefix: 'Source:',
      autoCalibrate: 'Auto-calibrate (Least squares)',
      calibratedDone: 'Calibrated parameters applied',
      modeStudy: 'Study-calibrated model',
      modeLive: 'Test current Twin',
      loadIntoSim: 'Load into simulator',
      loadIntoSimTitle: 'Load calibrated parameters into the simulator sidebar',
      r2Label: 'Goodness-of-fit R²',
      rmseLabel: 'Root mean sq. error (RMSE)',
      mapeLabel: 'Mean abs. % error (MAPE)',
      predVsObsLabel: 'Predicted vs study resistance',
      obsShort: 'obs.',
      vpcTitle: 'Visual Predictive Check (VPC) — 24-week trough concentrations (168 d)',
      vpcSubtitle:
        'Deterministic ODE trajectory + 5th–95th percentile VPC band vs published clinical means (± 1 SD)',
      obsPrefix: 'Obs:',
      predPrefix: 'Pred:',
      yAxisLabel: 'Serum concentration',
      legendPred: 'Predicted ODE trajectory',
      legendVpc: 'VPC envelope (5th–95th percentile)',
      legendObs: 'Published clinical observations (± 1 SD)',
      wresTitle: 'Standardized residuals (WRES) over follow-up',
      wresSubtitle: 'Standard pharmacometric acceptability band between −2 SD and +2 SD',
      visitsTitle: 'Clinical visits detail: Observed vs Predicted',
      activeParamsPrefix: 'Active parameters:',
      colVisit: 'Visit',
      colObsSd: 'Observed (± SD)',
      colPredOde: 'ODE Pred.',
      weekPrefix: 'W',
      troughWord: 'trough',
      benchmarks: {
        bartelds_ada_neg: {
          title: 'Adalimumab 40 mg SC / 14 d — ADA− Cohort (Responders)',
          cohortDescription:
            'Active rheumatoid arthritis (n = 196 patients without anti-adalimumab antibodies), longitudinal trough concentration follow-up over 24 weeks.',
        },
        bartelds_ada_pos: {
          title: 'Adalimumab 40 mg SC / 14 d — ADA+ Cohort (Escape)',
          cohortDescription:
            'Active rheumatoid arthritis (n = 76 patients developing anti-adalimumab antibodies), loss of serum exposure and secondary resistance between W8 and W24.',
        },
        gibiansky_toci_q2w: {
          title: 'Tocilizumab 162 mg SC / 7 d — SUMMACTA Trial (TMDD Model)',
          cohortDescription:
            'Active rheumatoid arthritis under weekly subcutaneous anti-IL-6Rα (162 mg qw), serum accumulation and TMDD saturation over 24 weeks.',
        },
      },
    },
    equations: {
      title: 'Mathematical formulation of the PK/PD Digital Twin',
      subtitle:
        'Coupled ordinary differential equations (ODEs) solved via positive exponential integrator over 672 hours',
      sec1Title: '01. Competitive binding kinetics',
      sec2Title: '02. Inflammatory loop, ADA & effective signal',
      mutNote: '(Kd variant penalty)',
      tableTitle: 'Calibrated biophysical constants',
      colParam: 'Parameter',
      colSymbol: 'Symbol',
      colValue: 'Value',
      colUnit: 'Unit',
      rows: {
        kdC: 'Cytokine dissociation constant',
        kdA: 'Antagonist dissociation constant (native)',
        kdAEff: 'Patient effective affinity (with variant)',
        mw: 'Antagonist molecular weight',
        occ: 'Cytokine occupancy (trough / peak)',
        adaPeak: 'Emerging ADA peak at D28',
      },
      unitAu: 'a.u.',
    },
    recommendation: {
      adequate: (dose, intervalStr) =>
        `Current regimen (${dose} mg / ${intervalStr}) maintains adequate cytokine suppression without escalation.`,
      switchNeeded: (bestRes) =>
        `Persistent intrinsic resistance (${bestRes.toFixed(1)}%) despite dose optimization: switching to an alternative cytokine axis or targeted combination therapy is recommended.`,
      adjust: (dose, intervalStr, absDelta) =>
        `Adjusting regimen to ${dose} mg every ${intervalStr} reduces resistance probability by ${absDelta.toFixed(1)} percentage points.`,
    },
  },
  fr: {
    meta: {
      pageTitle: 'TwinKinétique — Cinétique Cytokinique & Résistance Thérapeutique',
      footerLeft: 'TwinKinétique · Modélisation mécaniste QSP pour plateforme Digital Twin Health',
      footerRight: 'Usage recherche & aide à la décision clinique · Horizon d’intégration 28 jours (672 h)',
      exportFilenameSuffix: 'rapport',
    },
    nav: {
      kinetics: 'Simulateur PK/PD',
      calibration: 'Calibration Clinique',
      sensitivity: 'Paysage 2D',
      cohort: 'Cohorte Virtuelle',
      equations: 'Équations',
      exportReport: 'Exporter rapport',
      ariaLabel: 'Vues de la plateforme',
    },
    mobileNav: {
      kinetics: 'Simulateur PK/PD',
      calibration: 'Calibration',
      sensitivity: 'Paysage 2D',
      cohort: 'Cohorte',
      equations: 'Équations',
    },
    ribbon: {
      axisLabel: 'Axe thérapeutique',
      mechNeutralizer: 'Neutralisation ligand soluble',
      mechReceptor: 'Blocage compétitif réceptoriel',
      statusPrefix: 'Statut Jumeau',
      optimizeBtn: 'Optimiser posologie',
      resetBtn: 'Réinitialiser',
      resetTitle: 'Réinitialiser les paramètres du profil',
      dayShort: 'j',
      hourShort: 'h',
      riskLabels: {
        low: 'Réponse Probable',
        moderate: 'Risque Modéré',
        high: 'Résistance Élevée',
      },
    },
    presets: {
      tnf_adalimumab: {
        label: 'TNF-α / Adalimumab',
        indication: 'Polyarthrite rhumatoïde',
        clinicalContext: 'Polyarthrite rhumatoïde active · Biothérapie anti-TNFα',
        description:
          'Neutralisation du TNF-α soluble et transmembranaire par anticorps monoclonal humain IgG1. Sensible à l’émergence d’anticorps anti-médicament (ADA).',
      },
      il6_tocilizumab: {
        label: 'IL-6 / Tocilizumab',
        indication: 'PR réfractaire / SRC',
        clinicalContext: 'Syndrome inflammatoire sévère / PR réfractaire · Anti-IL-6Rα',
        description:
          'Blocage compétitif direct des récepteurs IL-6Rα membranaires et solubles empêchant la dimérisation gp130 et l’activation JAK/STAT3.',
      },
      il1b_anakinra: {
        label: 'IL-1β / Anakinra',
        indication: 'Péricardite récurrente',
        clinicalContext: 'Maladie auto-inflammatoire / Péricardite · Antagoniste IL-1R1',
        description:
          'Antagoniste recombinant court du récepteur IL-1R1 à clairance rénale rapide nécessitant une exposition quotidienne soutenue.',
      },
      il17a_secukinumab: {
        label: 'IL-17A / Sécukinumab',
        indication: 'Spondyloarthrite axiale',
        clinicalContext: 'Spondyloarthrite axiale · Neutralisation IL-17A',
        description:
          'Séquestration sélective de l’homodimère IL-17A. Risque d’échappement par redondance compensatoire IL-17F et IL-23.',
      },
      il23_risankizumab: {
        label: 'IL-23 (p19) / Risankizumab',
        indication: 'Maladie de Crohn',
        clinicalContext: 'Maladie de Crohn modérée à sévère · Anti-p19 haute affinité',
        description:
          'Inhibition ultra-affine de la sous-unité p19 d’IL-23 bloquant la différenciation Th17 pathogène sur un cycle posologique espacé.',
      },
    },
    kpi: {
      ariaLabel: 'Indicateurs cinétiques clés',
      resistanceTitle: 'Probabilité de résistance',
      primaryShort: '1ʳᵉ',
      secondaryShort: '2ⁿᵈ',
      occupancyTitle: 'Occupation cytokine θCR (vallée)',
      peakLabel: 'Pic',
      targetLt: 'Cible < 20.0 %',
      affinityTitle: 'Ratio d’affinité (Kd C / Kd A eff)',
      troughTitle: 'Antagoniste résiduel (C trough)',
      thresholdGe: 'Seuil ≥',
      exposureCovered: 'Exposition couverte',
      underExposed: 'Sous-exposition',
    },
    sidebar: {
      ariaLabel: 'Paramètres cinétiques et patient',
      group1Prefix: '01. Cinétique Cytokine',
      group2Prefix: '02. Antagoniste',
      group3: '03. Échappement & Jumeau Patient',
      clickToEdit: 'Cliquer pour saisir une valeur exacte',
      c0Label: 'Concentration basale [C]₀',
      konCLabel: 'Association kon,C',
      koffCLabel: 'Dissociation koff,C',
      densityPrefix: 'Densité',
      feedbackLabel: 'Rétroaction autocrine',
      feedbackHint: 'Amplification NF-κB / STAT',
      mechanismLabel: 'Mécanisme d’inhibition',
      mechNeutralizerShort: 'Neutralisation',
      mechReceptorShort: 'Blocage R',
      doseLabel: 'Dose administrée',
      intervalLabel: 'Intervalle posologique',
      halfLifeLabel: 'Demi-vie PK (t₁/₂)',
      konALabel: 'Association kon,A',
      koffALabel: 'Dissociation koff,A',
      adaLabel: 'Propension ADA (immunogénicité)',
      mutationLabel: 'Pénalité d’affinité (variant Kd)',
      bypassLabel: 'Redondance / Voie bypass',
      bypassHint: 'Ex: bascule IL-17F / IL-6',
      clearanceLabel: 'Clairance inflammatoire (TMDD)',
      recommendationTitle: 'Recommandation Jumeau',
      applyPrefix: 'Appliquer',
      resistanceSuffix: 'résistance',
      unitIndex: 'ind.',
      unitFraction: 'frac.',
      unitDays: 'j',
    },
    kineticsChart: {
      title: 'Cinétique d’occupation réceptorielle & exposition antagoniste (0–28 j)',
      subtitle: 'Résolution couplée EDO',
      layers: {
        ci95: 'IC 95 % Cohorte',
        effectiveSignal: 'Signal Bypass',
        neutralization: 'Neutralisation',
        antagonistPk: 'PK Antagoniste (nM)',
      },
      hud: {
        dayPrefix: 'J',
        signalEff: 'Signal eff.',
        neutral: 'Neutral.',
        probeActive: 'Sonde active',
        cycleEnd: 'Fin de cycle (J28)',
      },
      escapeThreshold: 'Seuil critique d’échappement (20 % θCR)',
      legend: {
        occupancyPrefix: 'Occupation θCR (%)',
        signalBypass: 'Signal inflammatoire effectif (+ bypass)',
        neutralPrefix: 'Neutralisation / Blocage (%)',
        concPrefix: 'Concentration libre (nM)',
        ci95Band: 'Enveloppe cohorte IC 95 %',
      },
      subTitle: 'Dynamique de la cytokine libre & émergence d’anticorps anti-médicament (ADA)',
      subSubtitle: 'Capture l’effet rebond autocrine et l’accélération de clairance immunogénique',
      cytEndLabel: 'fin',
      adaIndexLabel: 'Indice ADA',
      subLegendCytPrefix: 'Concentration libre (pM)',
      subLegendAda: 'Titre émergent ADA (u.a., axe droit)',
    },
    sensitivity: {
      title: 'Paysage de sensibilité 2D : Probabilité de résistance thérapeutique',
      subtitle:
        'Matrice multiparamétrique calculée sur le modèle couplé EDO (J28) · Cliquer sur une cellule pour projeter ce point dans le jumeau',
      modeDoseVsCyt: 'Dose × Charge [C]₀',
      modeKdVsAda: 'Affinité Kd × ADA',
      pResistanceLabel: 'P(Résistance)',
      troughOccLabel: 'θCR vallée',
      applyScenario: 'Appliquer ce scénario',
      scaleLabel: 'Échelle P(Résistance) :',
      currentPointLabel: 'Point de fonctionnement actuel du Jumeau Numérique',
      xLabelDose: 'Dose unitaire administrée',
      yLabelCyt: 'Concentration cytokinaire basale [C]₀',
      xLabelKd: 'Facteur de perte d’affinité (Kd eff / Kd)',
      yLabelAda: 'Risque d’immunogénicité (ADA)',
      unitTimes: '×',
      unitIndex: 'indice',
    },
    cohort: {
      radarTitle: 'Profil de vulnérabilité du Jumeau Numérique',
      radarSubtitle:
        'Charge normalisée (0–100) sur les 6 axes biophysiques de résistance vs zone de réponse optimale',
      radarLegendPatient: 'Patient virtuel actuel',
      radarLegendOptimal: 'Seuil cible de réponse durable',
      histTitlePrefix: 'Distribution stochastique de cohorte (N =',
      histTitleSuffix: 'jumeaux)',
      histSubtitlePrefix:
        'Variabilité inter-individuelle log-normale (PK, densité réceptorielle, titre ADA) · Moyenne',
      histMeanLabel: 'Moyenne',
      histXAxis: 'Intervalle de probabilité de résistance prédite (%)',
      ci95Label: 'IC 95 % Cohorte',
      primaryShareLabel: 'Part Primaire',
      secondaryShareLabel: 'Part Secondaire',
      attrTitle: 'Attribution mécaniste des facteurs d’échappement thérapeutique',
      attrSubtitle:
        'Contribution marginale estimée par simulation contrefactuelle sur le jumeau numérique actif',
      colFactor: 'Facteur biophysique',
      colPatientVal: 'Valeur patient',
      colImpact: 'Impact Δ P(Résistance)',
      colInterpretation: 'Interprétation mécaniste',
      ptsUnit: 'pts',
      compTitle: 'Comparaison : Schéma Actuel vs Posologie Optimisée',
      switchBtn: 'Basculer vers le schéma optimisé',
      colScenario: 'Scénario',
      colRegimen: 'Posologie',
      colTrough: 'C trough (nM)',
      colOcc: 'θCR vallée (%)',
      colResistance: 'P(Résistance)',
      currentScenario: 'Schéma actuel',
      optimizedScenario: 'Schéma optimisé Jumeau',
      radarAxes: {
        'Charge Cytokinique': 'Charge Cytokinique',
        'Déficit Affinité': 'Déficit Affinité',
        'Immunogénicité ADA': 'Immunogénicité ADA',
        'Clairance PK': 'Clairance PK',
        'Bypass Tissulaire': 'Bypass Tissulaire',
        'Densité Récepteurs': 'Densité Récepteurs',
      },
      attributions: {
        ada: {
          label: 'Anticorps anti-médicament (ADA)',
          detail: 'Accélère la clairance sérique et réduit la concentration résiduelle.',
        },
        bypass: {
          label: 'Redondance / Bypass cytokinique',
          detail: 'Signalisation pro-inflammatoire maintenue via des axes parallèles.',
        },
        cytokine_load: {
          label: 'Charge cytokinaire & rétroaction',
          detail: 'Pression compétitive élevée saturant l’antagoniste en phase tissulaire.',
        },
        mutation: {
          label: 'Perte d’affinité / Variant Kd',
          detail: 'Altération stérique ou mutation du site de liaison augmentant koff.',
        },
        clearance: {
          label: 'Clairance inflammatoire (TMDD)',
          detail: 'Consommation tissulaire accrue de l’antagoniste en foyer inflammatoire.',
        },
        dose_headroom: {
          label: 'Marge d’escalade posologique (2×)',
          detail: 'Réduction attendue du risque de résistance en doublant la dose unitaire.',
        },
      },
    },
    calibration: {
      title: 'Validation empirique sur jeu de données clinique publié',
      sourcePrefix: 'Source :',
      autoCalibrate: 'Auto-calibrer (Moindres carrés)',
      calibratedDone: 'Paramètres calibrés appliqués',
      modeStudy: 'Modèle calibré étude',
      modeLive: 'Tester Jumeau actuel',
      loadIntoSim: 'Charger dans simulateur',
      loadIntoSimTitle: 'Charger les paramètres calibrés dans la barre latérale du simulateur',
      r2Label: 'Qualité d’ajustement R²',
      rmseLabel: 'Erreur quadratique (RMSE)',
      mapeLabel: 'Erreur relative (MAPE)',
      predVsObsLabel: 'Résistance prédite vs étude',
      obsShort: 'obs.',
      vpcTitle: 'Visual Predictive Check (VPC) — Concentrations résiduelles sur 24 semaines (168 j)',
      vpcSubtitle:
        'Courbe EDO déterministe + intervalle de prédiction 5ᵉ–95ᵉ percentile vs moyennes cliniques publiées (± 1 ET)',
      obsPrefix: 'Obs :',
      predPrefix: 'Prédit :',
      yAxisLabel: 'Concentration sérique',
      legendPred: 'Trajectoire EDO prédite',
      legendVpc: 'Enveloppe VPC (5ᵉ–95ᵉ percentile)',
      legendObs: 'Observations cliniques publiées (± 1 ET)',
      wresTitle: 'Résidus standardisés (WRES) au cours du suivi',
      wresSubtitle: 'Zone d’acceptabilité pharmacométrique standard comprise entre −2 ET et +2 ET',
      visitsTitle: 'Détail des visites cliniques : Observé vs Prédit',
      activeParamsPrefix: 'Paramètres actifs :',
      colVisit: 'Visite',
      colObsSd: 'Observé (± ET)',
      colPredOde: 'Prédit EDO',
      weekPrefix: 'S',
      troughWord: 'vallée',
      benchmarks: {
        bartelds_ada_neg: {
          title: 'Adalimumab 40 mg SC / 14 j — Cohorte ADA− (Répondeurs)',
          cohortDescription:
            'Polyarthrite rhumatoïde active (n = 196 patients sans anticorps anti-adalimumab), suivi longitudinal des concentrations résiduelles sur 24 semaines.',
        },
        bartelds_ada_pos: {
          title: 'Adalimumab 40 mg SC / 14 j — Cohorte ADA+ (Échappement)',
          cohortDescription:
            'Polyarthrite rhumatoïde active (n = 76 patients développant des anticorps anti-adalimumab), perte d’exposition sérique et résistance secondaire entre S8 et S24.',
        },
        gibiansky_toci_q2w: {
          title: 'Tocilizumab 162 mg SC / 7 j — Étude SUMMACTA (Modèle TMDD)',
          cohortDescription:
            'Polyarthrite rhumatoïde active sous anti-IL-6Rα sous-cutané hebdomadaire (162 mg qw), suivi de l’accumulation sérique et saturation TMDD sur 24 semaines.',
        },
      },
    },
    equations: {
      title: 'Formulation mathématique du Jumeau Numérique PK/PD',
      subtitle:
        'Système d’équations différentielles ordinaires (EDO) couplées résolu par intégrateur exponentiel positif sur 672 heures',
      sec1Title: '01. Cinétique de liaison compétitive',
      sec2Title: '02. Boucle inflammatoire, ADA & Signal effectif',
      mutNote: '(pénalité variant Kd)',
      tableTitle: 'Constantes biophysiques calibrées',
      colParam: 'Paramètre',
      colSymbol: 'Symbole',
      colValue: 'Valeur',
      colUnit: 'Unité',
      rows: {
        kdC: 'Constante de dissociation cytokine',
        kdA: 'Constante de dissociation antagoniste (natif)',
        kdAEff: 'Affinité effective patient (variant inclus)',
        mw: 'Masse molaire de l’antagoniste',
        occ: 'Occupation cytokinaire (vallée / pic)',
        adaPeak: 'Pic ADA émergent à J28',
      },
      unitAu: 'u.a.',
    },
    recommendation: {
      adequate: (dose, intervalStr) =>
        `Le schéma actuel (${dose} mg / ${intervalStr}) maintient une suppression cytokinaire adéquate sans escalade nécessaire.`,
      switchNeeded: (bestRes) =>
        `Résistance intrinsèque persistante (${bestRes.toFixed(1)} %) malgré l'optimisation de dose : une bascule vers un autre axe cytokinique ou une bithérapie ciblée est recommandée.`,
      adjust: (dose, intervalStr, absDelta) =>
        `Ajuster la posologie à ${dose} mg toutes les ${intervalStr} réduit la probabilité de résistance de ${absDelta.toFixed(1)} points.`,
    },
  },
};

export function formatInterval(days: number, lang: Language): string {
  if (days === 0.5) return '12 h';
  return `${days} ${lang === 'en' ? 'd' : 'j'}`;
}
