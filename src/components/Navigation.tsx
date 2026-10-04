import React from 'react';
import { PlusCircle, FileText, List, Search, BarChart3 } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  recordCount: number;
  unitCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  recordCount,
  unitCount,
}) => {
  const navItems = [
    {
      id: 'tambah' as ActiveTab,
      label: 'Tambah Rekod',
      sublabel: 'Aktiviti / Pencapaian',
      icon: PlusCircle,
      badge: null,
      highlight: true,
    },
    {
      id: 'laporan' as ActiveTab,
      label: 'Laporan',
      sublabel: 'Paparan & OPR Automatik',
      icon: FileText,
      badge: recordCount,
    },
    {
      id: 'senarai' as ActiveTab,
      label: 'Senarai Unit',
      sublabel: 'Unit Kokurikulum',
      icon: List,
      badge: unitCount,
    },
    {
      id: 'analisis' as ActiveTab,
      label: 'Analisis SU Kokum',
      sublabel: 'Papan Pemuka Data',
      icon: BarChart3,
      badge: '2026',
    },
    {
      id: 'carian' as ActiveTab,
      label: 'Carian',
      sublabel: 'Carian Pantas Rekod',
      icon: Search,
      badge: null,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 no-print sticky top-[57px] z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="font-semibold">{item.label}</span>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-800/80 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
