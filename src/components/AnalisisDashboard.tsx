import React, { useState } from 'react';
import { 
  Award, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  BookOpen, 
  ArrowUpRight,
  Shield,
  Trophy,
  BookMarked,
  Filter,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { RekodKokurikulum, UnitKokurikulum, KategoriUnit } from '../types';

interface AnalisisDashboardProps {
  records: RekodKokurikulum[];
  units: UnitKokurikulum[];
  onOpenBukuLaporan: () => void;
  onSelectUnit: (unitId: string) => void;
}

export const AnalisisDashboard: React.FC<AnalisisDashboardProps> = ({
  records,
  units,
  onOpenBukuLaporan,
  onSelectUnit,
}) => {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'SEMUA' | KategoriUnit>('SEMUA');

  // Aggregate Metrics
  const totalActivities = records.length;
  const completedRecords = records.filter((r) => r.status === 'Selesai').length;
  
  // Attendance Calculation
  const totalAttendanceSum = records.reduce((acc, r) => acc + (r.sasaranPenglibatan.peratusKehadiran || 0), 0);
  const averageAttendance = totalActivities > 0 ? Math.round(totalAttendanceSum / totalActivities) : 0;

  // Achievement counts by level
  const peringkatCounts = {
    Sekolah: records.filter((r) => r.peringkat === 'Sekolah').length,
    'Zon / Daerah': records.filter((r) => r.peringkat === 'Zon / Daerah').length,
    Negeri: records.filter((r) => r.peringkat === 'Negeri').length,
    Kebangsaan: records.filter((r) => r.peringkat === 'Kebangsaan').length,
    Antarabangsa: records.filter((r) => r.peringkat === 'Antarabangsa').length,
  };

  const totalAchievements = records.filter(
    (r) => r.peringkat !== 'Sekolah' || r.jenisRekod === 'Pertandingan & Kejohanan' || r.jenisRekod === 'Pencapaian Khas'
  ).length;

  // Units meeting progress analysis
  const unitStats = units.map((u) => {
    const uRecords = records.filter((r) => r.unitId === u.id);
    const completedMeetings = uRecords.filter((r) => r.jenisRekod === 'Perjumpaan Mingguan').length;
    const progressPercent = Math.min(100, Math.round((completedMeetings / u.sasaranPerjumpaan) * 100));
    return {
      unit: u,
      recordsCount: uRecords.length,
      completedMeetings,
      progressPercent,
      isLagging: completedMeetings < 4, // Amaran jika kurang dari 4 perjumpaan setakat ini
    };
  });

  const laggingUnits = unitStats.filter((us) => us.isLagging);

  // Grouped by Category
  const uniformStats = unitStats.filter((us) => us.unit.kategori === 'Unit Beruniform');
  const sukanStats = unitStats.filter((us) => us.unit.kategori === 'Sukan & Permainan');
  const kelabStats = unitStats.filter((us) => us.unit.kategori === 'Kelab & Persatuan');

  const categoriesConfig: {
    kategori: KategoriUnit;
    title: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    stats: typeof unitStats;
  }[] = [
    {
      kategori: 'Unit Beruniform',
      title: 'Unit Beruniform',
      icon: Shield,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      stats: uniformStats,
    },
    {
      kategori: 'Sukan & Permainan',
      title: 'Sukan & Permainan',
      icon: Trophy,
      color: 'rose',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-700',
      stats: sukanStats,
    },
    {
      kategori: 'Kelab & Persatuan',
      title: 'Kelab & Persatuan',
      icon: BookMarked,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      stats: kelabStats,
    },
  ];

  // Filtered categories to render
  const categoriesToDisplay = selectedCategoryTab === 'SEMUA'
    ? categoriesConfig
    : categoriesConfig.filter((c) => c.kategori === selectedCategoryTab);

  // High achievements summary from records
  const recentAchievements = records
    .filter((r) => r.peringkat !== 'Sekolah' && r.pencapaian && r.pencapaian.trim() !== '')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* 1. HERO HEADER PAPAN PEMUKA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Papan Pemuka Setiausaha Kokurikulum
              </span>
              <span className="text-xs text-slate-400">Tahun 2026</span>
            </div>
            <h2 className="text-2xl font-bold mt-1.5 tracking-tight">
              Analisis Data Terpusat Kokurikulum 2026
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Pemantauan holistik pelaksanaan aktiviti perjumpaan mingguan, penglibatan murid, dan pencapaian kejohanan bagi memenuhi KPI Kokurikulum SMK Madai.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenBukuLaporan}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <BookOpen className="w-4 h-4" />
            <span>Buku Laporan Tahunan</span>
          </button>
        </div>
      </div>

      {/* 2. 4 KAD KPI UTAMA (DIKEKALKAN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Aktiviti Dilaksana */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Aktiviti Dilaksana</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalActivities}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {completedRecords} Disahkan
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Daripada {units.length} unit kokurikulum berdaftar
          </p>
        </div>

        {/* KPI 2: Purata Kehadiran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Purata Kehadiran</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{averageAttendance}%</span>
            <span className="text-xs text-emerald-600 font-semibold">Sasaran KPM &gt;85%</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Berdasarkan rekod kehadiran perjumpaan mingguan
          </p>
        </div>

        {/* KPI 3: Pencapaian Kejohanan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Pencapaian Kejohanan</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalAchievements}</span>
            <span className="text-xs text-amber-600 font-semibold">Pingat & Anugerah</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Peringkat Daerah, Negeri, Kebangsaan & Antarabangsa
          </p>
        </div>

        {/* KPI 4: Status Perjumpaan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Status 12 Perjumpaan</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {units.length - laggingUnits.length} / {units.length}
            </span>
            <span className="text-xs text-indigo-600 font-semibold">Mengikut Jadual</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {laggingUnits.length > 0 ? `${laggingUnits.length} unit memerlukan bimbingan` : 'Semua unit aktif'}
          </p>
        </div>
      </div>

      {/* 3. STATUS KEMAJUAN PERJUMPAAN MINGGUAN (DILETAKKAN DI ATAS & DIPISAHKAN MENGIKUT KATEGORI) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-5 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                Keutamaan Pemantauan SU
              </span>
              <span className="text-xs text-slate-400">Sasaran KPM: 12 Perjumpaan</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Status Kemajuan Perjumpaan Mingguan Unit Kokurikulum 2026
            </h3>
            <p className="text-xs text-slate-500">
              Dipisahkan mengikut 3 kategori kokurikulum: Unit Beruniform, Sukan & Permainan, dan Kelab & Persatuan.
            </p>
          </div>

          {/* Tab Pemilihan Kategori */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('SEMUA')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                selectedCategoryTab === 'SEMUA'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({units.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('Unit Beruniform')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedCategoryTab === 'Unit Beruniform'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Unit Beruniform ({uniformStats.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('Sukan & Permainan')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedCategoryTab === 'Sukan & Permainan'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Sukan & Permainan ({sukanStats.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('Kelab & Persatuan')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedCategoryTab === 'Kelab & Persatuan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Kelab & Persatuan ({kelabStats.length})</span>
            </button>
          </div>
        </div>

        {/* Paparan Kategori Unit (Dipisahkan secara berstruktur) */}
        <div className="space-y-6">
          {categoriesToDisplay.map((cat) => {
            const CatIcon = cat.icon;
            const catLaggingCount = cat.stats.filter((s) => s.isLagging).length;
            const catTotalMeetings = cat.stats.reduce((acc, s) => acc + s.completedMeetings, 0);
            const catAveragePercent = cat.stats.length > 0 
              ? Math.round(cat.stats.reduce((acc, s) => acc + s.progressPercent, 0) / cat.stats.length)
              : 0;

            return (
              <div 
                key={cat.kategori} 
                className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50"
              >
                {/* Header Kategori */}
                <div className={`p-4 ${cat.bgColor} border-b ${cat.borderColor} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl bg-white ${cat.textColor} shadow-xs border ${cat.borderColor}`}>
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{cat.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/80 font-bold border border-slate-200 text-slate-700">
                          {cat.stats.length} Unit
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {catTotalMeetings} jumlah perjumpaan direkodkan • Purata Kemajuan: {catAveragePercent}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-white font-semibold text-slate-700 border border-slate-200">
                      Purata: <strong className="text-slate-900">{catAveragePercent}%</strong>
                    </span>
                    {catLaggingCount > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-semibold border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{catLaggingCount} Perlu Perhatian</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Semua Aktif</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Jadual Unit Kategori */}
                <div className="overflow-x-auto bg-white">
                  <table className="w-full text-xs text-left text-slate-700">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Nama Unit</th>
                        <th className="p-3">Guru Penyelaras</th>
                        <th className="p-3 text-center">Ahli</th>
                        <th className="p-3 text-center">Perjumpaan Selesai</th>
                        <th className="p-3">Kemajuan Sasaran 12 Kali</th>
                        <th className="p-3 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cat.stats.map(({ unit, completedMeetings, progressPercent, isLagging }) => (
                        <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold text-slate-900">
                            {unit.nama}
                          </td>
                          <td className="p-3 text-slate-600 font-medium">
                            {unit.guruPenyelaras}
                          </td>
                          <td className="p-3 text-center font-semibold text-slate-700">
                            {unit.bilanganAhli}
                          </td>
                          <td className="p-3 text-center font-bold text-blue-700">
                            {completedMeetings} / {unit.sasaranPerjumpaan}
                          </td>
                          <td className="p-3 w-48">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-bold text-slate-800">{progressPercent}%</span>
                                {isLagging ? (
                                  <span className="text-amber-600 font-bold flex items-center gap-0.5 text-[10px]">
                                    <AlertTriangle className="w-3 h-3" />
                                    Perlu Tambah
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 font-bold text-[10px]">Baik</span>
                                )}
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    progressPercent >= 100
                                      ? 'bg-emerald-500'
                                      : progressPercent >= 50
                                      ? 'bg-blue-600'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => onSelectUnit(unit.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <span>Profil</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PECAHAN AKTIVITI MENGIKUT PERINGKAT (DIPAPAR SELEPAS STATUS KEMAJUAN PERJUMPAAN & DIKEKALKAN) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">
                Pecahan Aktiviti Mengikut Peringkat
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Taburan penganjuran dan penyertaan pertandingan mengikut hierarki peringkat Kokurikulum 2026.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            Jumlah: {totalActivities} Aktiviti
          </span>
        </div>

        {/* 5 Kolum Peringkat: Sekolah, Zon / Daerah, Negeri, Kebangsaan, Antarabangsa */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center">
          {/* Peringkat Sekolah */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-2xl font-black text-slate-800">{peringkatCounts['Sekolah']}</span>
            <p className="text-[11px] uppercase font-bold text-slate-500">Sekolah</p>
            <p className="text-[10px] text-slate-400">Aktiviti Dalaman</p>
          </div>

          {/* Peringkat Zon / Daerah */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
            <span className="text-2xl font-black text-blue-700">{peringkatCounts['Zon / Daerah']}</span>
            <p className="text-[11px] uppercase font-bold text-blue-800">Zon / Daerah</p>
            <p className="text-[10px] text-blue-600">PPD / Zon Lahad Datu</p>
          </div>

          {/* Peringkat Negeri */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-2xl font-black text-amber-700">{peringkatCounts['Negeri']}</span>
            <p className="text-[11px] uppercase font-bold text-amber-800">Negeri</p>
            <p className="text-[10px] text-amber-600">JPN Sabah</p>
          </div>

          {/* Peringkat Kebangsaan */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
            <span className="text-2xl font-black text-rose-700">{peringkatCounts['Kebangsaan']}</span>
            <p className="text-[11px] uppercase font-bold text-rose-800">Kebangsaan</p>
            <p className="text-[10px] text-rose-600">KPM Malaysia</p>
          </div>

          {/* Peringkat Antarabangsa */}
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-2xl font-black text-purple-700">{peringkatCounts['Antarabangsa']}</span>
            <p className="text-[11px] uppercase font-bold text-purple-800">Antarabangsa</p>
            <p className="text-[10px] text-purple-600">Global / Serantau</p>
          </div>
        </div>

        {/* Sorotan Ringkasan Pencapaian */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Sorotan Kejayaan Kokurikulum SMK Madai Sesi 2026:</span>
          </div>
          {recentAchievements.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 list-disc text-slate-700">
              {recentAchievements.map((rec) => (
                <li key={rec.id} className="text-[11px]">
                  <strong className="text-slate-900">{rec.namaUnit} ({rec.peringkat}):</strong> {rec.pencapaian}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-amber-800 pl-6">
              Pencapaian peringkat Daerah, Negeri dan Kebangsaan direkodkan secara langsung daripada pengesahan aktiviti guru penasihat dan dikemukakan dalam Buku Laporan Tahunan.
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
