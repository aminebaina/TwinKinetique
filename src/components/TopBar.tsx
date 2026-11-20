import React from 'react';
import { Download } from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

export type WorkspaceTab =
  | 'kinetics'
  | 'calibration'
  | 'sensitivity'
  | 'cohort'
  | 'equations';

interface TopBarProps {
  activeTab: WorkspaceTab;
  lang: Language;
  onSelectTab: (tab: WorkspaceTab) => void;
  onExportReport: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  lang,
  onSelectTab,
  onExportReport,
}) => {
  const t = TRANSLATIONS[lang].nav;
  const navItems: { id: WorkspaceTab; label: string }[] = [
    { id: 'kinetics', label: t.kinetics },
    { id: 'calibration', label: t.calibration },
    { id: 'sensitivity', label: t.sensitivity },
    { id: 'cohort', label: t.cohort },
    { id: 'equations', label: t.equations },
  ];

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 shrink-0">
      {/* Zone 1: Single-line Brand Wordmark */}
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('kinetics');
        }}
        className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
      >
        TwinKinétique
      </a>

      {/* Zone 2: Concise single-line navigation links */}
      <nav aria-label={t.ariaLabel} className="hidden md:flex items-center gap-6">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative py-4 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Single Primary Action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onExportReport}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-blue-700 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.exportReport}</span>
        </button>
      </div>
    </header>
  );
};
