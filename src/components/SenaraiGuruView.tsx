import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Plus, 
  UploadCloud, 
  Printer, 
  Download, 
  Shield, 
  Trophy, 
  BookMarked, 
  UserCheck, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  CheckCircle2, 
  Users, 
  Phone,
  Mail,
  X,
  Check,
  RefreshCw,
  Database,
  CloudCheck
} from 'lucide-react';
import { UnitKokurikulum, RekodKokurikulum, KategoriUnit, GuruKokurikulumItem } from '../types';

interface SenaraiGuruViewProps {
  units: UnitKokurikulum[];
  records: RekodKokurikulum[];
  teachers: GuruKokurikulumItem[];
  isLoading?: boolean;
  onOpenImportGuru: () => void;
  onSelectUnit: (unitId: string) => void;
  onUpdateUnit: (updatedUnit: UnitKokurikulum) => void;
  onSaveGuru: (guru: GuruKokurikulumItem) => Promise<void>;
  onDeleteGuru: (guru: GuruKokurikulumItem) => Promise<void>;
  onRefreshFromSupabase?: () => Promise<void>;
}

export const SenaraiGuruView: React.FC<SenaraiGuruViewProps> = ({
  units,
  records,
  teachers,
  isLoading = false,
  onOpenImportGuru,
  onSelectUnit,
  onUpdateUnit,
  onSaveGuru,
  onDeleteGuru,
  onRefreshFromSupabase,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedKategori, setSelectedKategori] = useState<'SEMUA' | KategoriUnit>('SEMUA');
  const [selectedPeranan, setSelectedPeranan] = useState<'SEMUA' | 'Ketua' | 'Penasihat'>('SEMUA');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // State Modal Tambah / Kemaskini Guru
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingGuru, setEditingGuru] = useState<GuruKokurikulumItem | null>(null);
  const [inputNama, setInputNama] = useState<string>('');
  const [inputUnitId, setInputUnitId] = useState<string>(units[0]?.id || '');
  const [inputPeranan, setInputPeranan] = useState<'Ketua Penyelaras / Penasihat' | 'Guru Penasihat'>('Ketua Penyelaras / Penasihat');
  const [inputPhone, setInputPhone] = useState<string>('');
  const [inputEmel, setInputEmel] = useState<string>('');

  // Senarai guru dimuatkan daripada Supabase sahaja
  const allGuruList: GuruKokurikulumItem[] = useMemo(() => {
    return teachers.map((g) => {
      // Kira bilangan rekod aktiviti terkini daripada rekod Supabase
      const count = records.filter(
        (r) => r.unitId === g.unitId && (r.namaPelapor === g.nama || r.namaPelapor.toLowerCase().includes(g.nama.toLowerCase()))
      ).length;

      return {
        ...g,
        rekodDirekodCount: Math.max(g.rekodDirekodCount || 0, count),
      };
    });
  }, [teachers, records]);

  // Penapisan & Carian
  const filteredGuruList = useMemo(() => {
    return allGuruList.filter((g) => {
      // Tapis Kategori
      if (selectedKategori !== 'SEMUA' && g.kategoriUnit !== selectedKategori) {
        return false;
      }
      // Tapis Peranan
      if (selectedPeranan === 'Ketua' && !g.isKetua) {
        return false;
      }
      if (selectedPeranan === 'Penasihat' && g.isKetua) {
        return false;
      }
      // Carian Teks
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        return (
          g.nama.toLowerCase().includes(q) ||
          g.namaUnit.toLowerCase().includes(q) ||
          g.kategoriUnit.toLowerCase().includes(q) ||
          (g.jawatan && g.jawatan.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allGuruList, selectedKategori, selectedPeranan, searchTerm]);

  // Statistik Kategori
  const uniformCount = allGuruList.filter((g) => g.kategoriUnit === 'Unit Beruniform').length;
  const sukanCount = allGuruList.filter((g) => g.kategoriUnit === 'Sukan & Permainan').length;
  const kelabCount = allGuruList.filter((g) => g.kategoriUnit === 'Kelab & Persatuan').length;
  const ketuaCount = allGuruList.filter((g) => g.isKetua).length;

  // Handler Segar Semula Supabase
  const handleRefresh = async () => {
    if (!onRefreshFromSupabase) return;
    setIsRefreshing(true);
    try {
      await onRefreshFromSupabase();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Buka Modal Tambah Guru
  const handleOpenAddModal = (unitIdPreselect?: string) => {
    setEditingGuru(null);
    setInputNama('');
    setInputUnitId(unitIdPreselect || units[0]?.id || '');
    setInputPeranan('Guru Penasihat');
    setInputPhone('');
    setInputEmel('');
    setShowAddModal(true);
  };

  // Buka Modal Edit Guru
  const handleOpenEditModal = (guru: GuruKokurikulumItem) => {
    setEditingGuru(guru);
    setInputNama(guru.nama);
    setInputUnitId(guru.unitId);
    setInputPeranan(guru.peranan);
    setInputPhone(guru.noTelefon || '');
    setInputEmel(guru.emel || '');
    setShowAddModal(true);
  };

  // Simpan / Kemas Kini Guru ke Supabase
  const handleSaveGuruSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNama.trim() || !inputUnitId) return;

    const targetUnit = units.find((u) => u.id === inputUnitId);
    if (!targetUnit) return;

    const newGuruName = inputNama.trim();
    const isKetuaRole = inputPeranan === 'Ketua Penyelaras / Penasihat';

    const guruItemToSave: GuruKokurikulumItem = {
      id: editingGuru ? editingGuru.id : `guru_${targetUnit.id}_${newGuruName.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_')}_${Date.now()}`,
      nama: newGuruName,
      unitId: targetUnit.id,
      namaUnit: targetUnit.nama,
      kategoriUnit: targetUnit.kategori,
      peranan: inputPeranan,
      isKetua: isKetuaRole,
      rekodDirekodCount: editingGuru?.rekodDirekodCount || 0,
      jawatan: isKetuaRole ? `Guru Penyelaras ${targetUnit.nama}` : 'Guru Penasihat',
      noTelefon: inputPhone.trim() || undefined,
      emel: inputEmel.trim() || undefined,
      sumber: 'supabase',
    };

    await onSaveGuru(guruItemToSave);

    // Kemaskini unit secara selari jika Ketua
    if (isKetuaRole) {
      onUpdateUnit({
        ...targetUnit,
        guruPenyelaras: newGuruName,
      });
    }

    setShowAddModal(false);
  };

  // Padam Guru dari Supabase
  const handleDeleteGuruClick = async (guru: GuruKokurikulumItem) => {
    if (!window.confirm(`Adakah anda pasti mahu memadam rekod "${guru.nama}" (${guru.namaUnit}) dari pangkalan data Supabase?`)) {
      return;
    }
    await onDeleteGuru(guru);
  };

  // Muat Turun Senarai Guru (CSV)
  const handleExportCSV = () => {
    const headers = ['Bil', 'Nama Guru', 'Unit Kokurikulum', 'Kategori', 'Peranan', 'Bil Aktiviti Direkodkan', 'Sumber Pangkalan Data'];
    const rows = filteredGuruList.map((g, idx) => [
      idx + 1,
      `"${g.nama}"`,
      `"${g.namaUnit}"`,
      `"${g.kategoriUnit}"`,
      `"${g.peranan}"`,
      g.rekodDirekodCount,
      '"Supabase Database"',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `senarai_guru_supabase_smk_madai_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HERO HEADER SENARAI GURU */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Pengurusan Tenaga Pengajar Kokurikulum</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Pangkalan Data Supabase: {allGuruList.length} Guru Sahih</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold mt-2 tracking-tight">
              Direktori & Senarai Guru Kokurikulum 2026
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Memaparkan rekod senarai guru yang disahkan daripada pangkalan data Supabase sahaja. Tiada sebarang data tiruan dimuatkan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {onRefreshFromSupabase && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors disabled:opacity-50"
                title="Segar semula senarai guru dari pangkalan data Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Menyegerak...' : 'Segar Semula Supabase'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
              title="Eksport data senarai guru ke fail CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Muat Turun CSV</span>
            </button>
            <button
              type="button"
              onClick={onOpenImportGuru}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Import pukal senarai guru dan segerakkan ke Supabase"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Import Pukal</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Guru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Jumlah Guru di Supabase
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{allGuruList.length} Orang</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">100% Sumber Supabase Sahih</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Unit Beruniform
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{uniformCount} Guru</span>
            </div>
            <span className="text-[10px] text-slate-400">Badan Beruniform</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Sukan & Permainan
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{sukanCount} Guru</span>
            </div>
            <span className="text-[10px] text-slate-400">Sukan & Permainan</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Kelab & Persatuan
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{kelabCount} Guru</span>
            </div>
            <span className="text-[10px] text-slate-400">Kelab & Persatuan</span>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama guru, unit kokurikulum, atau peranan..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category & Role Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Kategori Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['SEMUA', 'Unit Beruniform', 'Sukan & Permainan', 'Kelab & Persatuan'] as const).map((kat) => (
              <button
                key={kat}
                type="button"
                onClick={() => setSelectedKategori(kat)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedKategori === kat
                    ? 'bg-white text-teal-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {kat === 'SEMUA' ? 'Semua Kategori' : kat}
              </button>
            ))}
          </div>

          {/* Peranan Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['SEMUA', 'Ketua', 'Penasihat'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPeranan(p)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedPeranan === p
                    ? 'bg-white text-teal-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p === 'SEMUA' ? 'Semua Peranan' : p === 'Ketua' ? 'Ketua Penyelaras' : 'Guru Penasihat'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. MAIN TEACHER DIRECTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Senarai Guru Sahih ({filteredGuruList.length} Rekod daripada Supabase)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Database className="w-3 h-3" />
              <span>Hanya Rekod Supabase Dimuatkan</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Bil</th>
                <th className="p-3.5">Nama Guru</th>
                <th className="p-3.5">Unit Kokurikulum</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Peranan</th>
                <th className="p-3.5 text-center">Aktiviti Direkod</th>
                <th className="p-3.5 text-center">Status Pangkalan Data</th>
                <th className="p-3.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuruList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {allGuruList.length === 0 
                          ? 'Pangkalan Data Belum Mempunyai Rekod Guru'
                          : 'Tiada Rekod Memenuhi Kriteria Carian'}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {allGuruList.length === 0 
                          ? 'Hanya rekod senarai guru yang disahkan daripada pangkalan data Supabase sahaja akan dipaparkan di sini (tiada data tiruan). Sila klik butang di bawah untuk mendaftar guru baharu atau import fail senarai guru ke pangkalan data Supabase.'
                          : 'Tiada guru yang sepadan dengan tapisan semasa. Cuba ubah atau kosongkan kata kunci carian.'}
                      </p>
                      {allGuruList.length === 0 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => handleOpenAddModal()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-500"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Guru Pertama</span>
                          </button>
                          <button
                            type="button"
                            onClick={onOpenImportGuru}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-xs hover:bg-teal-500"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Import Pukal Guru</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGuruList.map((guru, index) => {
                  return (
                    <tr key={guru.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                        {index + 1}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{guru.nama}</span>
                          {guru.isKetua && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Ketua
                            </span>
                          )}
                        </div>
                        {guru.jawatan && guru.jawatan !== guru.peranan && (
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {guru.jawatan}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => onSelectUnit(guru.unitId)}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          <span>{guru.namaUnit}</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </button>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          guru.kategoriUnit === 'Unit Beruniform'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : guru.kategoriUnit === 'Sukan & Permainan'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {guru.kategoriUnit}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`font-semibold ${
                          guru.isKetua ? 'text-teal-800 font-bold' : 'text-slate-600'
                        }`}>
                          {guru.peranan}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-800 text-[11px]">
                          {guru.rekodDirekodCount} Rekod
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Disahkan Supabase</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(guru)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                            title="Kemas kini peranan atau unit guru"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGuruClick(guru)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Padam guru dari pangkalan data Supabase"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL TAMBAH / EDIT GURU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-300" />
                <h4 className="text-sm font-bold">
                  {editingGuru ? 'Kemaskini Guru di Supabase' : 'Tambah Guru ke Supabase Cloud'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveGuruSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Penuh Guru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={inputNama}
                  onChange={(e) => setInputNama(e.target.value)}
                  placeholder="Contoh: Cikgu Ahmad Faris bin Zulkifli"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Unit Kokurikulum <span className="text-red-500">*</span>
                </label>
                <select
                  value={inputUnitId}
                  onChange={(e) => setInputUnitId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} ({u.kategori})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peranan Dalam Unit <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="modalPeranan"
                      checked={inputPeranan === 'Ketua Penyelaras / Penasihat'}
                      onChange={() => setInputPeranan('Ketua Penyelaras / Penasihat')}
                      className="text-teal-700 focus:ring-teal-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Ketua Guru Penyelaras / Penasihat</span>
                      <span className="text-[10px] text-slate-500">Guru utama yang memimpin unit kokurikulum ini</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="modalPeranan"
                      checked={inputPeranan === 'Guru Penasihat'}
                      onChange={() => setInputPeranan('Guru Penasihat')}
                      className="text-teal-700 focus:ring-teal-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Guru Penasihat</span>
                      <span className="text-[10px] text-slate-500">Guru penasihat yang bersama-sama mengendalikan perjumpaan</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    No. Telefon (Pilihan)
                  </label>
                  <input
                    type="text"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="012-3456789"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Emel Rasmi / Delima (Pilihan)
                  </label>
                  <input
                    type="email"
                    value={inputEmel}
                    onChange={(e) => setInputEmel(e.target.value)}
                    placeholder="guru@moe-dl.edu.my"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan ke Supabase</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
