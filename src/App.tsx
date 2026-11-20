import { useEffect, useMemo, useState } from 'react';
import { CalibrationPanel } from './components/CalibrationPanel';
import { CohortAnalysis } from './components/CohortAnalysis';
import { EquationsPanel } from './components/EquationsPanel';
import { KineticsChart } from './components/KineticsChart';
import { KpiStrip } from './components/KpiStrip';
import { ParameterSidebar } from './components/ParameterSidebar';
import { SensitivityHeatmap } from './components/SensitivityHeatmap';
import { TelemetryRibbon } from './components/TelemetryRibbon';
import { TopBar, WorkspaceTab } from './components/TopBar';
import {
  CYTOKINE_PRESETS,
  optimizeRegimen,
  runFullSimulation,
} from './engine/kineticsModel';
import { formatInterval, Language, TRANSLATIONS } from './i18n/translations';
import { KineticParameters } from './types/kinetics';

const LANG_STORAGE_KEY = 'twinkinetique_lang';

function resolveInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const queryLang = new URLSearchParams(window.location.search).get('lang');
  if (queryLang === 'en' || queryLang === 'fr') return queryLang;
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'en' || stored === 'fr') return stored;
  } catch {
    // Ignore storage access errors in restricted iframes
  }
  return 'en';
}

export default function App() {
  const [lang, setLang] = useState<Language>(resolveInitialLanguage);
  const [params, setParams] = useState<KineticParameters>(
    () => ({ ...CYTOKINE_PRESETS[0].params })
  );
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('kinetics');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.pageTitle;
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage access errors in restricted iframes
    }
  }, [lang, t.meta.pageTitle]);

  const simulation = useMemo(() => runFullSimulation(params), [params]);

  const optimization = useMemo(
    () => optimizeRegimen(params, simulation.resistanceProbability_pct),
    [params, simulation.resistanceProbability_pct]
  );

  const handleSelectPreset = (presetId: string) => {
    const found = CYTOKINE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setParams({ ...found.params });
    }
  };

  const handleResetPreset = () => {
    const found = CYTOKINE_PRESETS.find((p) => p.id === params.presetId);
    if (found) {
      setParams({ ...found.params });
    }
  };

  const handleChangeParam = <K extends keyof KineticParameters>(
    key: K,
    value: KineticParameters[K]
  ) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyPatch = (patch: Partial<KineticParameters>) => {
    setParams((prev) => ({ ...prev, ...patch }));
  };

  const handleApplyOptimization = () => {
    setParams((prev) => ({
      ...prev,
      dose_mg: optimization.recommendedDose_mg,
      interval_days: optimization.recommendedInterval_days,
    }));
  };

  const handleExportReport = () => {
    const recIntervalStr = formatInterval(optimization.recommendedInterval_days, lang);
    const curIntervalStr = formatInterval(params.interval_days, lang);
    const localizedRecommendation =
      simulation.resistanceProbability_pct < 22
        ? t.recommendation.adequate(params.dose_mg, curIntervalStr)
        : optimization.requiresMechanismSwitch
          ? t.recommendation.switchNeeded(optimization.predictedResistance_pct)
          : t.recommendation.adjust(
              optimization.recommendedDose_mg,
              recIntervalStr,
              Math.abs(optimization.deltaResistance_pct)
            );

    const payload = {
      generatedAt: new Date().toISOString(),
      language: lang,
      platform: 'TwinKinétique — Digital Twin Health Platform',
      axis: `${params.cytokineName} / ${params.antagonistName}`,
      indication: t.presets[params.presetId]?.indication ?? params.indication,
      parameters: params,
      predictions: {
        resistanceProbability_pct: Number(simulation.resistanceProbability_pct.toFixed(2)),
        primaryResistance_pct: Number(simulation.primaryResistance_pct.toFixed(2)),
        secondaryResistance_pct: Number(simulation.secondaryResistance_pct.toFixed(2)),
        cohortCI95_pct: [
          Number(simulation.cohort.ci95Lower_pct.toFixed(2)),
          Number(simulation.cohort.ci95Upper_pct.toFixed(2)),
        ],
        riskLevel: t.ribbon.riskLabels[simulation.riskLevel],
        kdCytokine_pM: Number(simulation.kdC_pM.toFixed(2)),
        kdAntagonistEffective_pM: Number(simulation.kdAEff_pM.toFixed(2)),
        troughOccupancy_pct: Number(simulation.troughOccupancy_pct.toFixed(2)),
        troughAntagonist_nM: Number(simulation.troughAntagonist_nM.toFixed(2)),
      },
      optimization: {
        ...optimization,
        clinicalRecommendation: localizedRecommendation,
      },
      sampledTimeSeries: simulation.timeSeries.filter((_, idx) => idx % 3 === 0),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `twinkinetique_${params.presetId}_${t.meta.exportFilenameSuffix}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Research Use Only Notice */}
      <div
        role="note"
        aria-label="Research Use Only disclaimer"
        className="bg-amber-50/75 border-b border-amber-200 px-6 py-2 text-xs text-slate-700 leading-relaxed"
      >
        <span className="font-semibold text-amber-950">Research Use Only : </span>
        <span>
          Theoretical in silico simulation platform for scientific research and educational purposes only. Model outputs do not constitute medical advice, clinical diagnosis, or treatment recommendations, and are not clinically validated. Always consult a qualified healthcare professional.
        </span>
      </div>

      {/* Strict 3-Zone Top Bar */}
      <TopBar
        activeTab={activeTab}
        lang={lang}
        onSelectTab={setActiveTab}
        onExportReport={handleExportReport}
      />

      {/* Top Calibration & Pathway Ribbon */}
      <TelemetryRibbon
        params={params}
        riskLevel={simulation.riskLevel}
        lang={lang}
        onChangeLanguage={setLang}
        onSelectPreset={handleSelectPreset}
        onResetPreset={handleResetPreset}
        onApplyOptimization={handleApplyOptimization}
      />

      {/* Mobile Tab Switcher (hidden on md+) */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-1 overflow-x-auto">
        {(
          [
            { id: 'kinetics', label: t.mobileNav.kinetics },
            { id: 'calibration', label: t.mobileNav.calibration },
            { id: 'sensitivity', label: t.mobileNav.sensitivity },
            { id: 'cohort', label: t.mobileNav.cohort },
            { id: 'equations', label: t.mobileNav.equations },
          ] as { id: WorkspaceTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Asymmetric Split Console */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* Left Fixed-Width Control Column */}
        <ParameterSidebar
          params={params}
          optimization={optimization}
          currentResistancePct={simulation.resistanceProbability_pct}
          lang={lang}
          onChangeParam={handleChangeParam}
          onApplyOptimized={handleApplyOptimization}
        />

        {/* Right Analytical Viewport Stage */}
        <main className="flex-1 min-w-0 flex flex-col">
          <KpiStrip simulation={simulation} lang={lang} />

          <div className="p-6 flex-1 space-y-6">
            {activeTab === 'kinetics' && (
              <KineticsChart simulation={simulation} lang={lang} />
            )}
            {activeTab === 'calibration' && (
              <CalibrationPanel
                currentParams={params}
                lang={lang}
                onApplyCalibratedParams={(calibrated) => setParams({ ...calibrated })}
              />
            )}
            {activeTab === 'sensitivity' && (
              <SensitivityHeatmap
                params={params}
                lang={lang}
                onApplyCell={handleApplyPatch}
              />
            )}
            {activeTab === 'cohort' && (
              <CohortAnalysis
                simulation={simulation}
                optimization={optimization}
                lang={lang}
                onApplyOptimized={handleApplyOptimization}
              />
            )}
            {activeTab === 'equations' && (
              <EquationsPanel simulation={simulation} lang={lang} />
            )}
          </div>

          <footer className="px-6 py-3.5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <span>{t.meta.footerLeft}</span>
            <span>{t.meta.footerRight}</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
