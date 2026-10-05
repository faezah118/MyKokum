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
  Check
} from 'lucide-react';
import { UnitKokurikulum, RekodKokurikulum, KategoriUnit } from '../types';

interface SenaraiGuruViewProps {
  units: UnitKokurikulum[];
  records: RekodKokurikulum[];
  onOpenImportGuru: () => void;
  onSelectUnit: (unitId: string) => void;
  onUpdateUnit: (updatedUnit: UnitKokurikulum) => void;
}

export interface GuruKokurikulumItem {
  id: string; // unique ID
  nama: string;
  unitId: string;
  namaUnit: string;
  kategoriUnit: KategoriUnit;
  peranan: 'Ketua Penyelaras / Penasihat' | 'Guru Penasihat';
  isKetua: boolean;
  rekodDirekodCount: number;
}

export const SenaraiGuruView: React.FC<SenaraiGuruViewProps> = ({
  units,
  records,
  onOpenImportGuru,
  onSelectUnit,
  onUpdateUnit,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedKategori, setSelectedKategori] = useState<'SEMUA' | KategoriUnit>('SEMUA');
  const [selectedPeranan, setSelectedPeranan] = useState<'SEMUA' | 'Ketua' | 'Penasihat'>('SEMUA');
  
  // State Modal Tambah / Kemaskini Guru
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingGuru, setEditingGuru] = useState<GuruKokurikulumItem | null>(null);
  const [inputNama, setInputNama] = useState<string>('');
  const [inputUnitId, setInputUnitId] = useState<string>(units[0]?.id || '');
  const [inputPeranan, setInputPeranan] = useState<'Ketua Penyelaras / Penasihat' | 'Guru Penasihat'>('Ketua Penyelaras / Penasihat');

  // Mengumpulkan senarai guru daripada setiap unit
  const allGuruList: GuruKokurikulumItem[] = useMemo(() => {
    const list: GuruKokurikulumItem[] = [];

    units.forEach((unit) => {
      const guruNamesSet = new Set<string>();

      // 1. Tambah Ketua Guru Penyelaras
      if (unit.guruPenyelaras && unit.guruPenyelaras.trim() !== '') {
        const trimmed = unit.guruPenyelaras.trim();
        guruNamesSet.add(trimmed);
        const recordCount = records.filter(
          (r) => r.unitId === unit.id && (r.namaPelapor === trimmed || r.namaPelapor.toLowerCase().includes(trimmed.toLowerCase()))
        ).length;

        list.push({
          id: `${unit.id}_ketua_${trimmed}`,
          nama: trimmed,
          unitId: unit.id,
          namaUnit: unit.nama,
          kategoriUnit: unit.kategori,
          peranan: 'Ketua Penyelaras / Penasihat',
          isKetua: true,
          rekodDirekodCount: recordCount,
        });
      }

      // 2. Tambah Guru Penasihat Tambahan daripada senaraiGuru
      if (unit.senaraiGuru && Array.isArray(unit.senaraiGuru)) {
        unit.senaraiGuru.forEach((gName) => {
          const trimmed = gName.trim();
          if (trimmed && !guruNamesSet.has(trimmed)) {
            guruNamesSet.add(trimmed);
            const recordCount = records.filter(
              (r) => r.unitId === unit.id && (r.namaPelapor === trimmed || r.namaPelapor.toLowerCase().includes(trimmed.toLowerCase()))
            ).length;

            list.push({
              id: `${unit.id}_penasihat_${trimmed}`,
              nama: trimmed,
              unitId: unit.id,
              namaUnit: unit.nama,
              kategoriUnit: unit.kategori,
              peranan: 'Guru Penasihat',
              isKetua: false,
              rekodDirekodCount: recordCount,
            });
          }
        });
      }
    });

    return list;
  }, [units, records]);

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
          g.kategoriUnit.toLowerCase().includes(q)
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

  // Buka Modal Tambah Guru
  const handleOpenAddModal = (unitIdPreselect?: string) => {
    setEditingGuru(null);
    setInputNama('');
    setInputUnitId(unitIdPreselect || units[0]?.id || '');
    setInputPeranan('Guru Penasihat');
    setShowAddModal(true);
  };

  // Buka Modal Edit Guru
  const handleOpenEditModal = (guru: GuruKokurikulumItem) => {
    setEditingGuru(guru);
    setInputNama(guru.nama);
    setInputUnitId(guru.unitId);
    setInputPeranan(guru.peranan);
    setShowAddModal(true);
  };

  // Simpan / Kemas Kini Guru
  const handleSaveGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNama.trim() || !inputUnitId) return;

    const targetUnit = units.find((u) => u.id === inputUnitId);
    if (!targetUnit) return;

    const newGuruName = inputNama.trim();
    let currentSenarai = targetUnit.senaraiGuru || (targetUnit.guruPenyelaras ? [targetUnit.guruPenyelaras] : []);

    let newGuruPenyelaras = targetUnit.guruPenyelaras;

    if (editingGuru) {
      // Jika menukar unit
      if (editingGuru.unitId !== inputUnitId) {
        // Padam dari unit lama
        const oldUnit = units.find((u) => u.id === editingGuru.unitId);
        if (oldUnit) {
          const oldList = (oldUnit.senaraiGuru || []).filter((g) => g !== editingGuru.nama);
          const oldKetua = oldUnit.guruPenyelaras === editingGuru.nama 
            ? (oldList[0] || 'Belum Ditetapkan') 
            : oldUnit.guruPenyelaras;
          onUpdateUnit({
            ...oldUnit,
            guruPenyelaras: oldKetua,
            senaraiGuru: oldList,
          });
        }
      }

      // Kemaskini dalam senarai unit semasa
      currentSenarai = currentSenarai.filter((g) => g !== editingGuru.nama);
    }

    currentSenarai = Array.from(new Set([...currentSenarai, newGuruName]));

    if (inputPeranan === 'Ketua Penyelaras / Penasihat') {
      newGuruPenyelaras = newGuruName;
    } else if (targetUnit.guruPenyelaras === newGuruName && inputPeranan === 'Guru Penasihat') {
      // Jika ditukar dari ketua kepada penasihat
      const alternativeKetua = currentSenarai.find((g) => g !== newGuruName) || newGuruName;
      newGuruPenyelaras = alternativeKetua;
    }

    const updatedUnit: UnitKokurikulum = {
      ...targetUnit,
      guruPenyelaras: newGuruPenyelaras,
      senaraiGuru: currentSenarai,
    };

    onUpdateUnit(updatedUnit);
    setShowAddModal(false);
  };

  // Padam Guru dari Unit
  const handleDeleteGuru = (guru: GuruKokurikulumItem) => {
    if (!window.confirm(`Adakah anda pasti mahu memadam ${guru.nama} daripada ${guru.namaUnit}?`)) {
      return;
    }

    const targetUnit = units.find((u) => u.id === guru.unitId);
    if (!targetUnit) return;

    const newSenarai = (targetUnit.senaraiGuru || []).filter((g) => g !== guru.nama);
    let newKetua = targetUnit.guruPenyelaras;

    if (guru.isKetua) {
      newKetua = newSenarai[0] || 'Belum Ditetapkan';
    }

    onUpdateUnit({
      ...targetUnit,
      guruPenyelaras: newKetua,
      senaraiGuru: newSenarai,
    });
  };

  // Muat Turun Senarai Guru (CSV)
  const handleExportCSV = () => {
    const headers = ['Bil', 'Nama Guru', 'Unit Kokurikulum', 'Kategori', 'Peranan', 'Bil Aktiviti Direkodkan'];
    const rows = filteredGuruList.map((g, idx) => [
      idx + 1,
      `"${g.nama}"`,
      `"${g.namaUnit}"`,
      `"${g.kategoriUnit}"`,
      `"${g.peranan}"`,
      g.rekodDirekodCount,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `senarai_guru_kokurikulum_smk_madai_${new Date().toISOString().split('T')[0]}.csv`);
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
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Pengurusan Tenaga Pengajar Kokurikulum</span>
              </span>
              <span className="text-xs text-slate-400">SMK Madai 2026</span>
            </div>
            <h2 className="text-2xl font-bold mt-1.5 tracking-tight">
              Direktori & Senarai Guru Kokurikulum 2026
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Senarai dan penugasan rasmi Guru Penasihat serta Guru Penyelaras bagi 41 unit kokurikulum SMK Madai mengikut komponen Badan Beruniform, Sukan & Permainan, dan Kelab & Persatuan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
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
              title="Import pukal senarai guru daripada Excel atau fail CSV"
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
              Jumlah Guru Didaftar
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{allGuruList.length} Orang</span>
            </div>
            <span className="text-[10px] text-slate-400">Merentasi {units.length} unit</span>
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
            <span className="text-[10px] text-slate-400">9 Unit Beruniform</span>
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
            <span className="text-[10px] text-slate-400">16 Unit Sukan</span>
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
            <span className="text-[10px] text-slate-400">16 Kelab Akademik</span>
          </div>
        </div>
      </div>

      {/* 3. FILTER, CATEGORY TABS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setSelectedKategori('SEMUA')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                selectedKategori === 'SEMUA'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({allGuruList.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedKategori('Unit Beruniform')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedKategori === 'Unit Beruniform'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Unit Beruniform ({uniformCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedKategori('Sukan & Permainan')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedKategori === 'Sukan & Permainan'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Sukan & Permainan ({sukanCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedKategori('Kelab & Persatuan')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedKategori === 'Kelab & Persatuan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Kelab & Persatuan ({kelabCount})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama guru atau nama unit..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Secondary Filter: Peranan Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Tapis Peranan:
          </span>
          <button
            type="button"
            onClick={() => setSelectedPeranan('SEMUA')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              selectedPeranan === 'SEMUA'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Peranan
          </button>
          <button
            type="button"
            onClick={() => setSelectedPeranan('Ketua')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              selectedPeranan === 'Ketua'
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ketua Guru Penyelaras Sahaja ({ketuaCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedPeranan('Penasihat')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              selectedPeranan === 'Penasihat'
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Guru Penasihat ({allGuruList.length - ketuaCount})
          </button>
        </div>
      </div>

      {/* 4. SENARAI JADUAL GURU KOKURIKULUM */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Senarai Guru Penasihat ({filteredGuruList.length} Rekod)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Sesi Kokurikulum SMK Madai 2026
          </span>
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
                <th className="p-3.5 text-center">Aktiviti Direkodkan</th>
                <th className="p-3.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuruList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    Tiada guru dijumpai mengikut kriteria carian anda.
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
                            onClick={() => handleDeleteGuru(guru)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Padam guru dari unit ini"
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
                  {editingGuru ? 'Kemaskini Maklumat Guru' : 'Tambah Guru ke Unit Kokurikulum'}
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
            <form onSubmit={handleSaveGuru} className="p-5 space-y-4 text-xs">
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
                      <span className="text-[10px] text-slate-500">Guru utama yang bertanggungjawab memimpin unit ini</span>
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
                      <span className="text-[10px] text-slate-500">Guru penasihat bersama yang membantu menguruskan perjumpaan</span>
                    </div>
                  </label>
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
                  <span>Simpan Maklumat Guru</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
