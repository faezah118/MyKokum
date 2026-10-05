import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  Calendar, 
  Filter, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Shield, 
  Trophy, 
  BookMarked, 
  Printer, 
  ChevronRight, 
  Award, 
  Plus, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { RekodKokurikulum, UnitKokurikulum, KategoriUnit } from '../types';

interface TakwimViewProps {
  records: RekodKokurikulum[];
  units: UnitKokurikulum[];
  onNavigateTambah: (unitId?: string) => void;
  onOpenOPR: (record: RekodKokurikulum) => void;
}

// Struktur Takwim Bulan & Minggu Persekolahan Sesi 2026
interface MingguInfo {
  mingguId: string;
  mingguNo: number;
  bulan: string;
  bulanIndex: number; // 0 to 11
  label: string;
  tarikhRabu: string;
  isCuti?: boolean;
  cutiLabel?: string;
  acaraKhas?: string;
}

const BULAN_LIST = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
];

// Takwim 42 Minggu Persekolahan KPM 2026
const JADUAL_MINGGU_2026: MingguInfo[] = [
  // Januari 2026
  { mingguId: 'M1', mingguNo: 1, bulan: 'Januari', bulanIndex: 0, label: 'M1', tarikhRabu: '7 Jan 2026', acaraKhas: 'Pendaftaran Kokum' },
  { mingguId: 'M2', mingguNo: 2, bulan: 'Januari', bulanIndex: 0, label: 'M2', tarikhRabu: '14 Jan 2026', acaraKhas: 'Mesyuarat Agung Unit' },
  { mingguId: 'M3', mingguNo: 3, bulan: 'Januari', bulanIndex: 0, label: 'M3', tarikhRabu: '21 Jan 2026' },
  { mingguId: 'M4', mingguNo: 4, bulan: 'Januari', bulanIndex: 0, label: 'M4', tarikhRabu: '28 Jan 2026' },

  // Februari 2026
  { mingguId: 'M5', mingguNo: 5, bulan: 'Februari', bulanIndex: 1, label: 'M5', tarikhRabu: '4 Feb 2026' },
  { mingguId: 'M6', mingguNo: 6, bulan: 'Februari', bulanIndex: 1, label: 'M6', tarikhRabu: '11 Feb 2026' },
  { mingguId: 'M7', mingguNo: 7, bulan: 'Februari', bulanIndex: 1, label: 'M7', tarikhRabu: '18 Feb 2026', acaraKhas: 'Merentas Desa SMK Madai' },
  { mingguId: 'M8', mingguNo: 8, bulan: 'Februari', bulanIndex: 1, label: 'M8', tarikhRabu: '25 Feb 2026' },

  // Mac 2026
  { mingguId: 'M9', mingguNo: 9, bulan: 'Mac', bulanIndex: 2, label: 'M9', tarikhRabu: '4 Mac 2026' },
  { mingguId: 'M10', mingguNo: 10, bulan: 'Mac', bulanIndex: 2, label: 'M10', tarikhRabu: '11 Mac 2026' },
  { mingguId: 'M11', mingguNo: 11, bulan: 'Mac', bulanIndex: 2, label: 'M11', tarikhRabu: '18 Mac 2026', isCuti: true, cutiLabel: 'Cuti Penggal 1' },
  { mingguId: 'M12', mingguNo: 12, bulan: 'Mac', bulanIndex: 2, label: 'M12', tarikhRabu: '25 Mac 2026' },

  // April 2026
  { mingguId: 'M13', mingguNo: 13, bulan: 'April', bulanIndex: 3, label: 'M13', tarikhRabu: '1 Apr 2026' },
  { mingguId: 'M14', mingguNo: 14, bulan: 'April', bulanIndex: 3, label: 'M14', tarikhRabu: '8 Apr 2026' },
  { mingguId: 'M15', mingguNo: 15, bulan: 'April', bulanIndex: 3, label: 'M15', tarikhRabu: '15 Apr 2026' },
  { mingguId: 'M16', mingguNo: 16, bulan: 'April', bulanIndex: 3, label: 'M16', tarikhRabu: '22 Apr 2026' },
  { mingguId: 'M17', mingguNo: 17, bulan: 'April', bulanIndex: 3, label: 'M17', tarikhRabu: '29 Apr 2026' },

  // Mei 2026
  { mingguId: 'M18', mingguNo: 18, bulan: 'Mei', bulanIndex: 4, label: 'M18', tarikhRabu: '6 Mei 2026' },
  { mingguId: 'M19', mingguNo: 19, bulan: 'Mei', bulanIndex: 4, label: 'M19', tarikhRabu: '13 Mei 2026' },
  { mingguId: 'M20', mingguNo: 20, bulan: 'Mei', bulanIndex: 4, label: 'M20', tarikhRabu: '20 Mei 2026' },
  { mingguId: 'M21', mingguNo: 21, bulan: 'Mei', bulanIndex: 4, label: 'M21', tarikhRabu: '27 Mei 2026', isCuti: true, cutiLabel: 'Cuti Penggal 1 Akhir' },

  // Jun 2026
  { mingguId: 'M22', mingguNo: 22, bulan: 'Jun', bulanIndex: 5, label: 'M22', tarikhRabu: '3 Jun 2026', isCuti: true, cutiLabel: 'Cuti Penggal' },
  { mingguId: 'M23', mingguNo: 23, bulan: 'Jun', bulanIndex: 5, label: 'M23', tarikhRabu: '10 Jun 2026' },
  { mingguId: 'M24', mingguNo: 24, bulan: 'Jun', bulanIndex: 5, label: 'M24', tarikhRabu: '17 Jun 2026', acaraKhas: 'Kejohanan Sukan Tahunan' },
  { mingguId: 'M25', mingguNo: 25, bulan: 'Jun', bulanIndex: 5, label: 'M25', tarikhRabu: '24 Jun 2026' },

  // Julai 2026
  { mingguId: 'M26', mingguNo: 26, bulan: 'Julai', bulanIndex: 6, label: 'M26', tarikhRabu: '1 Jul 2026' },
  { mingguId: 'M27', mingguNo: 27, bulan: 'Julai', bulanIndex: 6, label: 'M27', tarikhRabu: '8 Jul 2026' },
  { mingguId: 'M28', mingguNo: 28, bulan: 'Julai', bulanIndex: 6, label: 'M28', tarikhRabu: '15 Jul 2026' },
  { mingguId: 'M29', mingguNo: 29, bulan: 'Julai', bulanIndex: 6, label: 'M29', tarikhRabu: '22 Jul 2026' },
  { mingguId: 'M30', mingguNo: 30, bulan: 'Julai', bulanIndex: 6, label: 'M30', tarikhRabu: '29 Jul 2026' },

  // Ogos 2026
  { mingguId: 'M31', mingguNo: 31, bulan: 'Ogos', bulanIndex: 7, label: 'M31', tarikhRabu: '5 Ogo 2026' },
  { mingguId: 'M32', mingguNo: 32, bulan: 'Ogos', bulanIndex: 7, label: 'M32', tarikhRabu: '12 Ogo 2026' },
  { mingguId: 'M33', mingguNo: 33, bulan: 'Ogos', bulanIndex: 7, label: 'M33', tarikhRabu: '19 Ogo 2026', acaraKhas: 'Karnival Bulan Kemerdekaan' },
  { mingguId: 'M34', mingguNo: 34, bulan: 'Ogos', bulanIndex: 7, label: 'M34', tarikhRabu: '26 Ogo 2026' },

  // September 2026
  { mingguId: 'M35', mingguNo: 35, bulan: 'September', bulanIndex: 8, label: 'M35', tarikhRabu: '2 Sep 2026', isCuti: true, cutiLabel: 'Cuti Penggal 2' },
  { mingguId: 'M36', mingguNo: 36, bulan: 'September', bulanIndex: 8, label: 'M36', tarikhRabu: '9 Sep 2026' },
  { mingguId: 'M37', mingguNo: 37, bulan: 'September', bulanIndex: 8, label: 'M37', tarikhRabu: '16 Sep 2026', acaraKhas: 'Hari Malaysia' },
  { mingguId: 'M38', mingguNo: 38, bulan: 'September', bulanIndex: 8, label: 'M38', tarikhRabu: '23 Sep 2026' },
  { mingguId: 'M39', mingguNo: 39, bulan: 'September', bulanIndex: 8, label: 'M39', tarikhRabu: '30 Sep 2026' },

  // Oktober 2026
  { mingguId: 'M40', mingguNo: 40, bulan: 'Oktober', bulanIndex: 9, label: 'M40', tarikhRabu: '7 Okt 2026', acaraKhas: 'Hari Sukan Negara' },
  { mingguId: 'M41', mingguNo: 41, bulan: 'Oktober', bulanIndex: 9, label: 'M41', tarikhRabu: '14 Okt 2026' },
  { mingguId: 'M42', mingguNo: 42, bulan: 'Oktober', bulanIndex: 9, label: 'M42', tarikhRabu: '21 Okt 2026', acaraKhas: 'Perkhemahan Perdana' },
  { mingguId: 'M43', mingguNo: 43, bulan: 'Oktober', bulanIndex: 9, label: 'M43', tarikhRabu: '28 Okt 2026' },

  // November 2026
  { mingguId: 'M44', mingguNo: 44, bulan: 'November', bulanIndex: 10, label: 'M44', tarikhRabu: '4 Nov 2026' },
  { mingguId: 'M45', mingguNo: 45, bulan: 'November', bulanIndex: 10, label: 'M45', tarikhRabu: '11 Nov 2026', acaraKhas: 'Hari Anugerah Kokum' },
  { mingguId: 'M46', mingguNo: 46, bulan: 'November', bulanIndex: 10, label: 'M46', tarikhRabu: '18 Nov 2026' },
  { mingguId: 'M47', mingguNo: 47, bulan: 'November', bulanIndex: 10, label: 'M47', tarikhRabu: '25 Nov 2026' },

  // Disember 2026
  { mingguId: 'M48', mingguNo: 48, bulan: 'Disember', bulanIndex: 11, label: 'M48', tarikhRabu: '2 Dis 2026' },
  { mingguId: 'M49', mingguNo: 49, bulan: 'Disember', bulanIndex: 11, label: 'M49', tarikhRabu: '9 Dis 2026' },
  { mingguId: 'M50', mingguNo: 50, bulan: 'Disember', bulanIndex: 11, label: 'M50', tarikhRabu: '16 Dis 2026', isCuti: true, cutiLabel: 'Cuti Akhir Persekolahan' },
  { mingguId: 'M51', mingguNo: 51, bulan: 'Disember', bulanIndex: 11, label: 'M51', tarikhRabu: '23 Dis 2026', isCuti: true, cutiLabel: 'Cuti Akhir Persekolahan' },
];

// Acara Khas Sekolah Utama
const ACARA_UTAMA_SEKOLAH = [
  { nama: 'Pendaftaran Kokurikulum & Rumah Sukan', tarikh: '7 Jan 2026', mingguId: 'M1', kategori: 'Semua Unit' },
  { nama: 'Mesyuarat Agung Kokurikulum Sesi 2026', tarikh: '14 Jan 2026', mingguId: 'M2', kategori: 'Semua Unit' },
  { nama: 'Kejohanan Merentas Desa SMK Madai', tarikh: '18 Feb 2026', mingguId: 'M7', kategori: 'Sukan & Permainan' },
  { nama: 'Kejohanan Balapan & Padang Tahunan', tarikh: '17 Jun 2026', mingguId: 'M24', kategori: 'Sukan & Permainan' },
  { nama: 'Karnival Bulan Kemerdekaan & STEM', tarikh: '19 Ogo 2026', mingguId: 'M33', kategori: 'Kelab & Persatuan' },
  { nama: 'Sambutan Hari Sukan Negara Peringkat Sekolah', tarikh: '7 Okt 2026', mingguId: 'M40', kategori: 'Sukan & Permainan' },
  { nama: 'Perkhemahan Perdana Badan Beruniform', tarikh: '21 Okt 2026', mingguId: 'M42', kategori: 'Unit Beruniform' },
  { nama: 'Hari Anugerah Kecemerlangan Kokum 2026', tarikh: '11 Nov 2026', mingguId: 'M45', kategori: 'Semua Unit' },
];

export const TakwimView: React.FC<TakwimViewProps> = ({
  records,
  units,
  onNavigateTambah,
  onOpenOPR,
}) => {
  const [filterCategory, setFilterCategory] = useState<'SEMUA' | KategoriUnit>('SEMUA');
  const [selectedBulanIndex, setSelectedBulanIndex] = useState<number | 'SEMUA'>('SEMUA');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<{
    unit: UnitKokurikulum;
    minggu: MingguInfo;
    record?: RekodKokurikulum;
    meetingNumber: number;
    isScheduled: boolean;
  } | null>(null);

  // Penapisan Minggu mengikut Bulan
  const filteredWeeks = useMemo(() => {
    if (selectedBulanIndex === 'SEMUA') {
      return JADUAL_MINGGU_2026;
    }
    return JADUAL_MINGGU_2026.filter((w) => w.bulanIndex === selectedBulanIndex);
  }, [selectedBulanIndex]);

  // Penapisan Unit mengikut Kategori & Carian
  const filteredUnits = useMemo(() => {
    let result = units;
    if (filterCategory !== 'SEMUA') {
      result = result.filter((u) => u.kategori === filterCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((u) => 
        u.nama.toLowerCase().includes(q) || 
        u.guruPenyelaras.toLowerCase().includes(q)
      );
    }
    return result;
  }, [units, filterCategory, searchTerm]);

  // Pengiraan metrik pelaksanaan takwim
  const totalPerjumpaanTarget = units.length * 12;
  const completedPerjumpaanRecords = records.filter((r) => r.jenisRekod === 'Perjumpaan Mingguan');
  const totalPerjumpaanDilaksana = completedPerjumpaanRecords.length;
  const overallProgressPercent = totalPerjumpaanTarget > 0 
    ? Math.min(100, Math.round((totalPerjumpaanDilaksana / totalPerjumpaanTarget) * 100))
    : 0;

  // Semak perjumpaan unit pada minggu tertentu
  // Jadual giliran piawai: 
  // - Unit Beruniform: Minggu 1 & 3 perjumpaan aktif
  // - Kelab & Persatuan: Minggu 2 & 4 perjumpaan aktif
  // - Sukan & Permainan: Bergilir setiap minggu atau dwimingguan
  const getSlotStatus = (unit: UnitKokurikulum, minggu: MingguInfo) => {
    // 1. Semak rekod fizikal yang wujud
    const unitRecords = records.filter((r) => r.unitId === unit.id);
    
    // Semak sama ada ada rekod pada minggu ini (berdasarkan padanan tarikh atau urutan)
    const matchingRecord = unitRecords.find((r) => {
      // Padanan tarikh bulan
      const recordDate = new Date(r.tarikh);
      const isSameMonth = recordDate.getMonth() === minggu.bulanIndex;
      return isSameMonth && r.status === 'Selesai';
    });

    // Semak giliran penjadualan takwim mengikut kategori
    let isScheduledCategoryWeek = false;
    const weekInMonth = ((minggu.mingguNo - 1) % 4) + 1; // 1, 2, 3, 4

    if (unit.kategori === 'Unit Beruniform') {
      isScheduledCategoryWeek = weekInMonth === 1 || weekInMonth === 3;
    } else if (unit.kategori === 'Kelab & Persatuan') {
      isScheduledCategoryWeek = weekInMonth === 2 || weekInMonth === 4;
    } else {
      // Sukan & Permainan: aktif setiap minggu bergilir
      isScheduledCategoryWeek = true;
    }

    // Hitung anggaran nombor perjumpaan (1 hingga 12)
    const meetingNum = Math.min(12, Math.max(1, Math.ceil(minggu.mingguNo / 3.5)));

    return {
      record: matchingRecord,
      isScheduled: !minggu.isCuti && isScheduledCategoryWeek,
      meetingNumber: meetingNum,
      isCompleted: !!matchingRecord,
    };
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HERO HEADER TAKWIM */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Takwim Kokurikulum Sesi 2026</span>
              </span>
              <span className="text-xs text-slate-400">SMK Madai</span>
            </div>
            <h2 className="text-2xl font-bold mt-1.5 tracking-tight">
              Carta Gantt Perjumpaan & Aktiviti Kokurikulum 2026
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Perancangan dan pemantauan perjumpaan mingguan (sasaran 12 kali) bagi 41 unit kokurikulum mengikut minggu dan bulan persekolahan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Takwim</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTambah()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Rekod Aktiviti</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS & METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Sasaran KPM
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">12 Perjumpaan</span>
            </div>
            <span className="text-[10px] text-slate-400">Syarat minima PAJSK murid</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Perjumpaan Direkod
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{totalPerjumpaanDilaksana}</span>
              <span className="text-xs font-semibold text-emerald-600">Selesai</span>
            </div>
            <span className="text-[10px] text-slate-400">Merentasi semua 41 unit</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Pelaksanaan Takwim
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{overallProgressPercent}%</span>
              <span className="text-xs font-semibold text-indigo-600">Daripada sasaran</span>
            </div>
            <span className="text-[10px] text-slate-400">Kemajuan sepanjang tahun</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Acara Khas Sekolah
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{ACARA_UTAMA_SEKOLAH.length} Acara</span>
            </div>
            <span className="text-[10px] text-slate-400">Merentas desa, sukan & perkhemahan</span>
          </div>
        </div>
      </div>

      {/* 3. CONTROLS, CATEGORY TABS & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setFilterCategory('SEMUA')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                filterCategory === 'SEMUA'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({units.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('Unit Beruniform')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                filterCategory === 'Unit Beruniform'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Unit Beruniform</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('Sukan & Permainan')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                filterCategory === 'Sukan & Permainan'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Sukan & Permainan</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('Kelab & Persatuan')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                filterCategory === 'Kelab & Persatuan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Kelab & Persatuan</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari unit atau penyelaras..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Month Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Pilihan Bulan:
          </span>
          <button
            type="button"
            onClick={() => setSelectedBulanIndex('SEMUA')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedBulanIndex === 'SEMUA'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sepanjang Tahun (Semua)
          </button>
          {BULAN_LIST.map((bulan, idx) => (
            <button
              key={bulan}
              type="button"
              onClick={() => setSelectedBulanIndex(idx)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                selectedBulanIndex === idx
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {bulan}
            </button>
          ))}
        </div>

        {/* Petunjuk Warna (Legend) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-600 border-t border-slate-100">
          <span className="font-bold text-slate-400 uppercase tracking-wider">Petunjuk Gantt:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">✓</span>
            <span>Telah Dilaksana & Direkodkan</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-400 text-blue-800 text-[9px] font-bold flex items-center justify-center">P</span>
            <span>Jadual Perjumpaan KPM</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-400 border border-amber-500"></span>
            <span>Acara Utama Sekolah</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300"></span>
            <span>Cuti Penggal Persekolahan</span>
          </span>
        </div>
      </div>

      {/* 4. CARTA GANTT UTAMA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Acara Khas Sekolah Bar Banner */}
        <div className="p-3 bg-amber-50/70 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold text-amber-900">Takwim Acara Utama Kokurikulum SMK Madai 2026:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto text-[11px]">
            {ACARA_UTAMA_SEKOLAH.slice(0, 3).map((a, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-white border border-amber-200 text-amber-800 font-medium whitespace-nowrap shadow-2xs">
                <strong>{a.mingguId} ({a.tarikh}):</strong> {a.nama}
              </span>
            ))}
          </div>
        </div>

        {/* Scrollable Gantt Table */}
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-xs text-left border-collapse">
            
            {/* Header Gantt: Bulan & Minggu */}
            <thead className="bg-slate-900 text-white sticky top-0 z-20 shadow-xs">
              {/* Row 1: Bulan */}
              <tr>
                <th className="p-3 w-56 min-w-[220px] bg-slate-900 sticky left-0 z-30 font-bold border-r border-slate-800">
                  Unit Kokurikulum
                </th>
                <th className="p-3 w-28 min-w-[110px] bg-slate-900 sticky left-[220px] z-30 font-bold border-r border-slate-800 text-center">
                  Kemajuan
                </th>
                {filteredWeeks.map((m) => (
                  <th
                    key={m.mingguId}
                    className={`p-2 min-w-[54px] text-center font-bold text-[10px] border-r border-slate-800 ${
                      m.isCuti ? 'bg-rose-950/80 text-rose-300' : 'bg-slate-900'
                    }`}
                  >
                    <span className="block font-black">{m.label}</span>
                    <span className="text-[9px] font-normal opacity-70 block truncate max-w-[50px]">
                      {m.tarikhRabu.split(' ')[0]} {m.tarikhRabu.split(' ')[1]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body: Baris Unit Kokurikulum */}
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={filteredWeeks.length + 2} className="p-12 text-center text-slate-500">
                    Tiada unit kokurikulum yang sepadan dengan carian.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit) => {
                  const unitRecords = records.filter((r) => r.unitId === unit.id);
                  const completedMeetings = unitRecords.filter((r) => r.jenisRekod === 'Perjumpaan Mingguan').length;
                  const percent = Math.min(100, Math.round((completedMeetings / unit.sasaranPerjumpaan) * 100));

                  return (
                    <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      {/* Column 1: Unit Info (Sticky Left) */}
                      <td className="p-3 w-56 min-w-[220px] bg-white group-hover:bg-slate-50 sticky left-0 z-10 border-r border-slate-200">
                        <div className="font-bold text-slate-900 truncate" title={unit.nama}>
                          {unit.nama}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded font-semibold text-[9px] ${
                            unit.kategori === 'Unit Beruniform'
                              ? 'bg-emerald-50 text-emerald-700'
                              : unit.kategori === 'Sukan & Permainan'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            {unit.kategori === 'Unit Beruniform' ? 'Uniform' : unit.kategori === 'Sukan & Permainan' ? 'Sukan' : 'Kelab'}
                          </span>
                          <span className="truncate max-w-[120px]">{unit.guruPenyelaras}</span>
                        </div>
                      </td>

                      {/* Column 2: Progress (Sticky Left 2) */}
                      <td className="p-2 w-28 min-w-[110px] bg-white group-hover:bg-slate-50 sticky left-[220px] z-10 border-r border-slate-200 text-center">
                        <div className="text-[11px] font-bold text-slate-800">
                          {completedMeetings} / {unit.sasaranPerjumpaan}
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 border border-slate-200">
                          <div 
                            className={`h-full rounded-full ${
                              percent >= 100 ? 'bg-emerald-500' : percent >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>

                      {/* Columns: Gantt Meeting Slots */}
                      {filteredWeeks.map((minggu) => {
                        const slot = getSlotStatus(unit, minggu);
                        
                        return (
                          <td 
                            key={minggu.mingguId}
                            className={`p-1.5 text-center border-r border-slate-100 relative ${
                              minggu.isCuti ? 'bg-slate-100/70' : ''
                            }`}
                          >
                            {minggu.isCuti ? (
                              <div 
                                className="h-7 rounded flex items-center justify-center text-[9px] font-bold text-slate-400 bg-slate-200/60"
                                title={`Cuti Persekolahan: ${minggu.cutiLabel || ''}`}
                              >
                                Cuti
                              </div>
                            ) : slot.isCompleted ? (
                              /* 1. Telah Dilaksana & Direkod (Hijau) */
                              <button
                                type="button"
                                onClick={() => setSelectedSlot({
                                  unit,
                                  minggu,
                                  record: slot.record,
                                  meetingNumber: slot.meetingNumber,
                                  isScheduled: true,
                                })}
                                className="w-full h-7 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-0.5 shadow-2xs transition-transform hover:scale-105"
                                title={`Perjumpaan ${slot.meetingNumber} Selesai (${slot.record?.tajukAktiviti || ''})`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="text-[10px]">P{slot.meetingNumber}</span>
                              </button>
                            ) : slot.isScheduled ? (
                              /* 2. Dijadualkan Dalam Takwim (Biru Cair) */
                              <button
                                type="button"
                                onClick={() => setSelectedSlot({
                                  unit,
                                  minggu,
                                  meetingNumber: slot.meetingNumber,
                                  isScheduled: true,
                                })}
                                className="w-full h-7 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-bold flex items-center justify-center text-[10px] transition-all hover:border-blue-400"
                                title={`Dijadualkan: Perjumpaan ${slot.meetingNumber} (${minggu.tarikhRabu})`}
                              >
                                P{slot.meetingNumber}
                              </button>
                            ) : minggu.acaraKhas ? (
                              /* 3. Acara Khas Sekolah */
                              <div 
                                className="w-full h-7 rounded-md bg-amber-100 border border-amber-300 text-amber-800 text-[9px] font-bold flex items-center justify-center truncate px-0.5"
                                title={`Acara Khas: ${minggu.acaraKhas}`}
                              >
                                Acara
                              </div>
                            ) : (
                              /* 4. Slot Kosong / Minggu Luar Giliran */
                              <div className="w-full h-7 flex items-center justify-center text-slate-300 text-[10px]">
                                •
                              </div>
                            )}
                          </td>
                        );
                      })}

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL / DRAWER DETAIL SLOT TERPILIH */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            
            {/* Header Drawer */}
            <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-300" />
                <div>
                  <h4 className="text-sm font-bold">{selectedSlot.unit.nama}</h4>
                  <span className="text-xs text-blue-200">
                    {selectedSlot.minggu.label} • {selectedSlot.minggu.tarikhRabu}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Content Drawer */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Status Takwim:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    selectedSlot.record
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedSlot.record ? '✓ Telah Direkodkan & Selesai' : 'Dijadualkan Mengikut Takwim'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Sesi Perjumpaan:</span>
                  <span className="font-bold text-slate-800">Perjumpaan #{selectedSlot.meetingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Guru Penyelaras:</span>
                  <span className="font-semibold text-slate-700">{selectedSlot.unit.guruPenyelaras}</span>
                </div>
              </div>

              {selectedSlot.record ? (
                <div className="space-y-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Laporan Rasmi Aktiviti Ditemui</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{selectedSlot.record.tajukAktiviti}</p>
                    <p className="text-slate-600 text-[11px] line-clamp-2">
                      {selectedSlot.record.ringkasanAktiviti || 'Tiada ringkasan aktiviti'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-emerald-200/60">
                    <span>Kehadiran: <strong>{selectedSlot.record.sasaranPenglibatan.peratusKehadiran}%</strong></span>
                    <span>Pelapor: <strong>{selectedSlot.record.namaPelapor}</strong></span>
                  </div>
                  
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedSlot.record) {
                          onOpenOPR(selectedSlot.record);
                          setSelectedSlot(null);
                        }
                      }}
                      className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-center transition-colors"
                    >
                      Buka OPR Rasmi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-2">
                  <Info className="w-6 h-6 text-blue-600 mx-auto" />
                  <p className="font-bold text-blue-950">Perjumpaan Belum Direkodkan</p>
                  <p className="text-[11px] text-slate-600">
                    Guru penasihat unit ini boleh memasukkan laporan aktiviti dan gambar perjumpaan sekarang.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTambah(selectedSlot.unit.id);
                      setSelectedSlot(null);
                    }}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Catat Laporan Perjumpaan Ini</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
