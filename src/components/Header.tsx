import React, { useState } from 'react';
import { Award, BookOpen, Layers, ShieldCheck, RefreshCw, FileText, UserPlus, School, Database } from 'lucide-react';
import { RekodKokurikulum, UnitKokurikulum } from '../types';
import { ConfirmActionModal } from './ConfirmActionModal';

interface HeaderProps {
  records: RekodKokurikulum[];
  units: UnitKokurikulum[];
  onOpenBukuLaporan: () => void;
  onResetData: () => void;
  onOpenImportMurid?: () => void;
  onOpenSupabaseModal?: () => void;
  userRole: 'penyelaras' | 'setiausaha';
  setUserRole: (role: 'penyelaras' | 'setiausaha') => void;
}

export const Header: React.FC<HeaderProps> = ({
  records,
  units,
  onOpenBukuLaporan,
  onResetData,
  onOpenImportMurid,
  onOpenSupabaseModal,
  userRole,
  setUserRole,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const completedCount = records.filter((r) => r.status === 'Selesai').length;
  const needUpdateCount = records.filter((r) => r.status === 'Perlu Kemaskini').length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Logo & Tajuk Aplikasi */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  MyKokum<span className="text-blue-600 font-extrabold">+</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                  <School className="w-3 h-3 text-blue-700" />
                  <span>SMK Madai</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Sesi 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                Sistem Berpusat Kokurikulum SMK Madai • Rekod Aktiviti, OPR & Senarai Murid
              </p>
            </div>
          </div>

          {/* Quick Metrics & Role Switcher */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Quick Status Pill */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>{units.length} Unit</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">
                <strong className="text-slate-900">{records.length}</strong> Rekod
              </span>
              {needUpdateCount > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    {needUpdateCount} Perlu Tindakan
                  </span>
                </>
              )}
            </div>

            {/* Switch Peranan Pengguna */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setUserRole('penyelaras')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  userRole === 'penyelaras'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mod Guru Penyelaras: Fokus pada masukan dan kemaskini aktiviti unit"
              >
                Guru Penyelaras
              </button>
              <button
                type="button"
                onClick={() => setUserRole('setiausaha')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  userRole === 'setiausaha'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mod Setiausaha: Akses analisis makro dan buku laporan tahunan sekolah"
              >
                SU Kokurikulum
              </button>
            </div>

            {/* Import Murid Button */}
            {onOpenImportMurid && (
              <button
                type="button"
                onClick={onOpenImportMurid}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
                title="Import Senarai Murid SMK Madai mengikut unit"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Import Murid</span>
                <span className="sm:hidden">Murid</span>
              </button>
            )}

            {/* Buku Laporan Tahunan Button */}
            <button
              type="button"
              onClick={onOpenBukuLaporan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
              title="Buka Buku Laporan Tahunan Kokurikulum 2026"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buku Laporan 2026</span>
              <span className="sm:hidden">Buku 2026</span>
            </button>

            {/* Supabase Cloud Database Button */}
            {onOpenSupabaseModal && (
              <button
                type="button"
                onClick={onOpenSupabaseModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300 ring-1 ring-emerald-200 transition-colors"
                title="Pangkalan Data Supabase Cloud SMK Madai"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase</span>
              </button>
            )}

            {/* Demo Reset Button */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors text-xs font-medium border border-slate-200"
              title="Muat semula data demo 2026"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>

        </div>
      </div>

      <ConfirmActionModal
        isOpen={showResetConfirm}
        title="Muat Semula Data Contoh SMK Madai 2026?"
        message="Tindakan ini akan mengembalikan seluruh 41 unit kokurikulum, senarai pelajar, dan rekod aktiviti SMK Madai kepada tetapan asal sesi persekolahan 2026."
        confirmLabel="Ya, Muat Semula Data"
        confirmVariant="primary"
        onConfirm={() => {
          setShowResetConfirm(false);
          onResetData();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </header>
  );
};
