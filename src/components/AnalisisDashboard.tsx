import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  Calendar, 
  Printer, 
  BookOpen, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { RekodKokurikulum, UnitKokurikulum } from '../types';

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

  // Category breakdown
  const sukanCount = records.filter((r) => r.kategoriUnit === 'Sukan & Permainan').length;
  const kelabCount = records.filter((r) => r.kategoriUnit === 'Kelab & Persatuan').length;
  const uniformCount = records.filter((r) => r.kategoriUnit === 'Unit Beruniform').length;

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

  return (
    <div className="space-y-6">
      
      {/* Hero Header Papan Pemuka */}
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
              Pemantauan holistik pelaksanaan aktiviti perjumpaan mingguan, penglibatan murid, dan pencapaian kejohanan bagi memenuhi KPI Kokurikulum Kementerian Pendidikan Malaysia.
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

      {/* 4 KPI Cards Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Jumlah Aktiviti */}
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

        {/* KPI 3: Kejayaan & Pencapaian */}
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
            Peringkat Daerah, Negeri dan Kebangsaan
          </p>
        </div>

        {/* KPI 4: Unit Capai Sasaran */}
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

      {/* 2 Kolum Carta / Visualisasi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visualisasi 1: Taburan Aktiviti Mengikut Kategori Unit */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Taburan Aktiviti Mengikut Komponen</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">{totalActivities} Rekod</span>
          </div>

          <div className="space-y-3 pt-2">
            {/* Sukan & Permainan */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span>Sukan & Permainan</span>
                <span>{sukanCount} Aktiviti ({totalActivities > 0 ? Math.round((sukanCount / totalActivities) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalActivities > 0 ? (sukanCount / totalActivities) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Kelab & Persatuan */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span>Kelab & Persatuan</span>
                <span>{kelabCount} Aktiviti ({totalActivities > 0 ? Math.round((kelabCount / totalActivities) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${totalActivities > 0 ? (kelabCount / totalActivities) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Unit Beruniform */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span>Unit Beruniform</span>
                <span>{uniformCount} Aktiviti ({totalActivities > 0 ? Math.round((uniformCount / totalActivities) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalActivities > 0 ? (uniformCount / totalActivities) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Imbangan pelaksanaan aktiviti antara sukan, kelab akademik, dan badan beruniform memastikan perkembangan murid seimbang.
          </p>
        </div>

        {/* Visualisasi 2: Pencapaian Mengikut Peringkat */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Pecahan Aktiviti Mengikut Peringkat</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">Tahun 2026</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xl font-bold text-slate-800">{peringkatCounts['Sekolah']}</span>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Sekolah</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-xl font-bold text-blue-700">{peringkatCounts['Zon / Daerah']}</span>
              <p className="text-[10px] uppercase font-bold text-blue-800 mt-1">Zon / Daerah</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xl font-bold text-amber-700">{peringkatCounts['Negeri']}</span>
              <p className="text-[10px] uppercase font-bold text-amber-800 mt-1">Negeri</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <span className="text-xl font-bold text-red-700">{peringkatCounts['Kebangsaan']}</span>
              <p className="text-[10px] uppercase font-bold text-red-800 mt-1">Kebangsaan</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Pencapaian Tertinggi Sesi 2026:</strong> Anugerah Emas (Tempat Ketiga Keseluruhan) Pertandingan Inovasi STEM Negeri Selangor & Naib Johan Bola Jaring Bawah 15 MSSD.
            </div>
          </div>
        </div>

      </div>

      {/* Jadual Pemantauan Kemajuan 12 Perjumpaan Setiap Unit */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Status Kemajuan Perjumpaan Mingguan Unit Kokurikulum 2026
            </h3>
            <p className="text-xs text-slate-500">
              Sasaran rasmi: Sekurang-kurangnya 12 kali perjumpaan setahun bagi melayakkan markah PAJSK murid.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Unit Kokurikulum</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Guru Penyelaras</th>
                <th className="p-3.5 text-center">Ahli</th>
                <th className="p-3.5 text-center">Perjumpaan Direkod</th>
                <th className="p-3.5">Kemajuan Sasaran 12 Kali</th>
                <th className="p-3.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unitStats.map(({ unit, recordsCount, completedMeetings, progressPercent, isLagging }) => (
                <tr key={unit.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">{unit.nama}</td>
                  <td className="p-3.5 text-slate-600">{unit.kategori}</td>
                  <td className="p-3.5 text-slate-700 font-medium">{unit.guruPenyelaras}</td>
                  <td className="p-3.5 text-center font-semibold">{unit.bilanganAhli}</td>
                  <td className="p-3.5 text-center font-bold text-blue-700">
                    {completedMeetings} / {unit.sasaranPerjumpaan}
                  </td>
                  <td className="p-3.5 w-48">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold">{progressPercent}%</span>
                        {isLagging ? (
                          <span className="text-amber-600 font-bold flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            Kurang Aktif
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold">Baik</span>
                        )}
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
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
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectUnit(unit.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Buka Profil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
