import React, { useState } from 'react';
import { 
  Plus, 
  Users, 
  Clock, 
  MapPin, 
  Calendar, 
  Trophy, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  X, 
  Save, 
  Search,
  Filter,
  FileSpreadsheet,
  UserPlus,
  BookOpen
} from 'lucide-react';
import { UnitKokurikulum, RekodKokurikulum, KategoriUnit, MuridUnit } from '../types';

interface SenaraiUnitViewProps {
  units: UnitKokurikulum[];
  records: RekodKokurikulum[];
  students: MuridUnit[];
  onAddUnit: (unit: UnitKokurikulum) => void;
  onSelectUnitForRecord: (unitId: string) => void;
  onFilterRecordsByUnit: (unitId: string) => void;
  onOpenImportMurid: (unitId?: string) => void;
  onOpenSenaraiMurid: (unit: UnitKokurikulum) => void;
}

export const SenaraiUnitView: React.FC<SenaraiUnitViewProps> = ({
  units,
  records,
  students,
  onAddUnit,
  onSelectUnitForRecord,
  onFilterRecordsByUnit,
  onOpenImportMurid,
  onOpenSenaraiMurid,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Unit Form State
  const [newNama, setNewNama] = useState('');
  const [newKategori, setNewKategori] = useState<KategoriUnit>('Sukan & Permainan');
  const [newGuru, setNewGuru] = useState('');
  const [newAhli, setNewAhli] = useState<number>(30);
  const [newHari, setNewHari] = useState('Rabu');
  const [newMasa, setNewMasa] = useState('2:00 PTG - 4:00 PTG');
  const [newTempat, setNewTempat] = useState('');
  const [newKod, setNewKod] = useState('');

  // Category Counts
  const countUniform = units.filter((u) => u.kategori === 'Unit Beruniform').length;
  const countKelab = units.filter((u) => u.kategori === 'Kelab & Persatuan').length;
  const countSukan = units.filter((u) => u.kategori === 'Sukan & Permainan').length;

  const filteredUnits = units.filter((u) => {
    if (selectedCategory !== 'SEMUA' && u.kategori !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.nama.toLowerCase().includes(q) ||
        u.guruPenyelaras.toLowerCase().includes(q) ||
        u.kodUnit.toLowerCase().includes(q) ||
        u.kategori.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSaveNewUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newGuru.trim()) return;

    const prefix = newKategori === 'Sukan & Permainan' ? 'SP' : newKategori === 'Kelab & Persatuan' ? 'KP' : 'UB';
    const autoCode = newKod.trim() || `${prefix}-${newNama.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    const created: UnitKokurikulum = {
      id: `unit-${Date.now()}`,
      nama: newNama.trim(),
      kategori: newKategori,
      guruPenyelaras: newGuru.trim(),
      bilanganAhli: Number(newAhli) || 30,
      hariPerjumpaan: newHari,
      masaPerjumpaan: newMasa,
      tempatBiasa: newTempat.trim() || 'Kawasan Sekolah SMK Madai',
      kodUnit: autoCode,
      warnaTema: 'blue',
      sasaranPerjumpaan: 12,
    };

    onAddUnit(created);
    setShowAddModal(false);
    // Reset
    setNewNama('');
    setNewGuru('');
    setNewTempat('');
    setNewKod('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Senarai Unit Kokurikulum SMK Madai 2026
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {units.length} Unit Berdaftar
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {students.length} Murid Berdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengurusan 41 unit kokurikulum SMK Madai merangkumi Unit Beruniform, Kelab & Persatuan, dan Sukan & Permainan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* BUTANG IMPORT SENARAI MURID (CIRI WAJIB) */}
          <button
            type="button"
            onClick={() => onOpenImportMurid()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="Import senarai nama murid dari fail CSV atau Excel APDM mengikut unit"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Senarai Murid</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Unit</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Category Pills with Exact Counts */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setSelectedCategory('SEMUA')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedCategory === 'SEMUA'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({units.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('Unit Beruniform')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedCategory === 'Unit Beruniform'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unit Beruniform ({countUniform})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('Kelab & Persatuan')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedCategory === 'Kelab & Persatuan'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kelab & Persatuan ({countKelab})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('Sukan & Permainan')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedCategory === 'Sukan & Permainan'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sukan & Permainan ({countSukan})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama unit (cth: bomba, tv madai)..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUnits.map((u) => {
          const unitRecords = records.filter((r) => r.unitId === u.id);
          const completedMeetings = unitRecords.filter((r) => r.jenisRekod === 'Perjumpaan Mingguan').length;
          const achievementsCount = unitRecords.filter((r) => r.jenisRekod === 'Pertandingan & Kejohanan' || r.jenisRekod === 'Pencapaian Khas').length;
          const progressPercent = Math.min(100, Math.round((completedMeetings / u.sasaranPerjumpaan) * 100));

          // Kira bilangan murid berdaftar untuk unit ini
          const unitStudents = students.filter((s) => s.unitId === u.id);
          const totalMembers = unitStudents.length > 0 ? unitStudents.length : u.bilanganAhli;

          return (
            <div
              key={u.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header Kad */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {u.kodUnit}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {u.nama}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    u.kategori === 'Sukan & Permainan'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : u.kategori === 'Kelab & Persatuan'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {u.kategori}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Penyelaras:</span>
                    <span className="text-slate-900 font-medium line-clamp-1">{u.guruPenyelaras}</span>
                  </p>
                  
                  {/* Bilangan Murid & Butang Senarai Murid */}
                  <div className="flex items-center justify-between py-0.5">
                    <span className="flex items-center gap-1.5 text-slate-800 font-medium">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span><strong>{totalMembers}</strong> Orang Murid</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => onOpenSenaraiMurid(u)}
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-bold text-[11px] transition-colors"
                      title="Buka senarai nama murid berdaftar unit ini"
                    >
                      Senarai Murid ({unitStudents.length})
                    </button>
                  </div>

                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Setiap {u.hariPerjumpaan} ({u.masaPerjumpaan})</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="line-clamp-1">{u.tempatBiasa}</span>
                  </p>
                </div>

                {/* Progress 12 Perjumpaan */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Sasaran Perjumpaan</span>
                    <span className="font-extrabold text-blue-700">
                      {completedMeetings} / {u.sasaranPerjumpaan} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        progressPercent >= 100
                          ? 'bg-emerald-500'
                          : progressPercent >= 50
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{unitRecords.length} Aktiviti Direkod</span>
                    {achievementsCount > 0 && (
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {achievementsCount} Kejayaan
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onSelectUnitForRecord(u.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Rekod Aktiviti</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenImportMurid(u.id)}
                  className="p-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
                  title="Import senarai murid untuk unit ini"
                >
                  <UserPlus className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onFilterRecordsByUnit(u.id)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                  title="Lihat semua rekod bagi unit ini"
                >
                  <span>Laporan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah Unit Baharu */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 animate-scaleUp text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Tambah Unit Kokurikulum Baharu (SMK Madai)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewUnit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori Unit *
                </label>
                <select
                  value={newKategori}
                  onChange={(e) => setNewKategori(e.target.value as KategoriUnit)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Unit Beruniform">Unit Beruniform</option>
                  <option value="Kelab & Persatuan">Kelab & Persatuan</option>
                  <option value="Sukan & Permainan">Sukan & Permainan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Unit Kokurikulum *
                </label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: Kelab Memanah Tradisional"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Guru Penyelaras *
                </label>
                <input
                  type="text"
                  required
                  value={newGuru}
                  onChange={(e) => setNewGuru(e.target.value)}
                  placeholder="Contoh: Cikgu Ahmad Faiz"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Anggaran Bilangan Ahli
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newAhli}
                    onChange={(e) => setNewAhli(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hari Perjumpaan
                  </label>
                  <input
                    type="text"
                    value={newHari}
                    onChange={(e) => setNewHari(e.target.value)}
                    placeholder="Rabu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tempat Biasa Perjumpaan
                </label>
                <input
                  type="text"
                  value={newTempat}
                  onChange={(e) => setNewTempat(e.target.value)}
                  placeholder="Contoh: Dewan Perdana SMK Madai"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Daftar Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
