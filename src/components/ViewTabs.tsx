import React from 'react';
import { Table, LayoutGrid, FileText } from 'lucide-react';
import { ViewMode } from '../types/allergy';

interface ViewTabsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({
  viewMode,
  onViewModeChange,
  className = '',
}) => {
  const tabs = [
    {
      id: 'hoja' as ViewMode,
      label: 'Hoja de Cálculo',
      shortLabel: 'Hoja',
      icon: Table,
    },
    {
      id: 'tarjetas' as ViewMode,
      label: 'Línea de Tiempo',
      shortLabel: 'Cronología',
      icon: LayoutGrid,
    },
    {
      id: 'uas7' as ViewMode,
      label: 'Informe UAS7',
      shortLabel: 'Informe',
      icon: FileText,
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      {/* Segmented Tabs Container optimized for Mobile, Tablet and Desktop */}
      <div className="grid grid-cols-3 gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-slate-200/90 rounded-2xl shadow-inner border border-slate-300/70">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = viewMode === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onViewModeChange(tab.id)}
              className={`flex items-center justify-center gap-1.5 sm:gap-2.5 py-2 sm:py-2.5 md:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all select-none min-h-[42px] sm:min-h-[46px] ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Icon
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-colors ${
                  isActive ? 'text-rose-600' : 'text-slate-500'
                }`}
              />
              <span className="truncate">
                {/* On tablets (sm/md) and desktop: show full label */}
                <span className="hidden sm:inline">{tab.label}</span>
                {/* On phones (<640px): show short label */}
                <span className="sm:hidden">{tab.shortLabel}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
