import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Edit3, 
  Trash2, 
  Search, 
  X, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  LayoutGrid, 
  Table as TableIcon,
  Layers
} from 'lucide-react';
import { RekodKokurikulum, UnitKokurikulum, PeringkatAktiviti, StatusLaporan } from '../types';
import { formatTarikhMY } from '../utils/storage';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface LaporanViewProps {
  records: RekodKokurikulum[];
  units: UnitKokurikulum[];
  onOpenOPR: (record: RekodKokurikulum) => void;
  onEditRecord: (record: RekodKokurikulum) => void;
  onDeleteRecord: (id: string) => void;
  onNavigateTambah: (unitId?: string) => void;
  onOpenBukuLaporan: () => void;
  onOpenKemaskiniPukal: () => void;
  initialFilterUnitId?: string;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  records,
  units,
  onOpenOPR,
  onEditRecord,
  onDeleteRecord,
  onNavigateTambah,
  onOpenBukuLaporan,
  onOpenKemaskiniPukal,
  initialFilterUnitId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('SEMUA');
  const [filterUnitId, setFilterUnitId] = useState<string>(initialFilterUnitId || 'SEMUA');
  const [filterPeringkat, setFilterPeringkat] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  React.useEffect(() => {
    if (initialFilterUnitId) {
      setFilterUnitId(initialFilterUnitId);
    }
  }, [initialFilterUnitId]);

  // Modal padam rekod
  const [recordToDelete, setRecordToDelete] = useState<RekodKokurikulum | null>(null);

  // Filter application
  const cleanSearch = searchTerm.toLowerCase().trim();
  const filteredRecords = records.filter((r) => {
    if (filterKategori !== 'SEMUA' && r.kategoriUnit !== filterKategori) return false;
    if (filterUnitId !== 'SEMUA' && r.unitId !== filterUnitId) return false;
    if (filterPeringkat !== 'SEMUA' && r.peringkat !== filterPeringkat) return false;
    if (filterStatus !== 'SEMUA' && r.status !== filterStatus) return false;

    if (cleanSearch) {
      const matchTajuk = r.tajukAktiviti.toLowerCase().includes(cleanSearch);
      const matchUnit = r.namaUnit.toLowerCase().includes(cleanSearch);
      const matchTempat = r.tempat.toLowerCase().includes(cleanSearch);
      const matchPencapaian = r.pencapaian.toLowerCase().includes(cleanSearch);
      const matchPelapor = r.namaPelapor.toLowerCase().includes(cleanSearch);
      return matchTajuk || matchUnit || matchTempat || matchPencapaian || matchPelapor;
    }
    return true;
  });

  const isFilterActive =
    searchTerm !== '' ||
    filterKategori !== 'SEMUA' ||
    filterUnitId !== 'SEMUA' ||
    filterPeringkat !== 'SEMUA' ||
    filterStatus !== 'SEMUA';

  const resetAllFilters = () => {
    setSearchTerm('');
    setFilterKategori('SEMUA');
    setFilterUnitId('SEMUA');
    setFilterPeringkat('SEMUA');
    setFilterStatus('SEMUA');
  };

  const getPeringkatBadgeColor = (peringkat: PeringkatAktiviti) => {
    switch (peringkat) {
      case 'Antarabangsa':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Kebangsaan':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Negeri':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Zon / Daerah':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: StatusLaporan) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Selesai (OPR)</span>
          </span>
        );
      case 'Perlu Kemaskini':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            <span>Perlu Kemaskini</span>
          </span>
        );
      case 'Draf':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3" />
            <span>Draf</span>
          </span>
        );
    }
  };

  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      onDeleteRecord(recordToDelete.id);
      setRecordToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* 1. TOP HEADER & MAIN ACTION BUTTONS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Laporan Aktiviti Kokurikulum 2026
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Pangkalan Data: {records.length} Rekod</span>
            </span>
            {isFilterActive && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {filteredRecords.length} Ditapis
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Paparan laporan rasmi aktiviti kokurikulum SMK Madai yang tersimpan dalam pangkalan data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTambah()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Rekod Baharu</span>
          </button>

          <button
            type="button"
            onClick={onOpenBukuLaporan}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
            title="Buku Laporan Tahunan Lengkap 2026"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Buku Laporan</span>
          </button>

          <button
            type="button"
            onClick={onOpenKemaskiniPukal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            title="Kemaskini status berbilang rekod serentak"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Kemaskini Pukal</span>
          </button>
        </div>
      </div>

      {/* 2. SIMPLIFIED SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        
        {/* Search Bar + View Toggle */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari tajuk aktiviti, unit, tempat, nama guru pelapor..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kad</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Jadual</span>
            </button>
          </div>
        </div>

        {/* Category Quick Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Kategori:</span>
          {[
            { id: 'SEMUA', label: 'Semua Kategori' },
            { id: 'Sukan & Permainan', label: '⚽ Sukan & Permainan' },
            { id: 'Kelab & Persatuan', label: '📚 Kelab & Persatuan' },
            { id: 'Unit Beruniform', label: '⛺ Unit Beruniform' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterKategori(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterKategori === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Pilih Unit
            </label>
            <select
              value={filterUnitId}
              onChange={(e) => setFilterUnitId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
            >
              <option value="SEMUA">Semua Unit ({units.length})</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama} ({u.kategori})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Peringkat Aktiviti
            </label>
            <select
              value={filterPeringkat}
              onChange={(e) => setFilterPeringkat(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
            >
              <option value="SEMUA">Semua Peringkat</option>
              <option value="Sekolah">Peringkat Sekolah</option>
              <option value="Zon / Daerah">Zon / Daerah</option>
              <option value="Negeri">Negeri</option>
              <option value="Kebangsaan">Kebangsaan</option>
              <option value="Antarabangsa">Antarabangsa</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Status Laporan
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="Selesai">Selesai (Sedia OPR)</option>
                <option value="Perlu Kemaskini">Perlu Kemaskini</option>
                <option value="Draf">Draf</option>
              </select>

              {isFilterActive && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold whitespace-nowrap transition-colors"
                  title="Kosongkan semua penapis"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 3. SENARAI REKOD (GRID ATAU JADUAL) */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {isFilterActive ? 'Tiada Rekod Dijumpai' : 'Pangkalan Data Belum Mempunyai Rekod'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isFilterActive
              ? 'Tiada rekod yang memenuhi kriteria carian atau penapis anda. Cuba ubah atau kosongkan penapis.'
              : 'Pangkalan data anda belum mempunyai sebarang rekod aktiviti kokurikulum. Hanya maklumat yang disimpan dalam pangkalan data akan dipaparkan di sini. Klik butang di bawah untuk menambah rekod baharu.'}
          </p>
          <div className="pt-2 flex justify-center gap-2">
            {isFilterActive ? (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Kosongkan Penapis
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTambah()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs"
              >
                + Tambah Rekod Sekarang
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* PAPARAN KAD (GRID MODE) - USER FRIENDLY & CLEAR BUTTONS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((r) => {
            const hasPhoto = r.gambar && r.gambar.length > 0;
            const coverPhoto = hasPhoto ? r.gambar[0] : null;

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Foto Utama / Placeholder */}
                  <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden border-b border-slate-100">
                    {coverPhoto ? (
                      <img
                        src={coverPhoto.url}
                        alt={coverPhoto.kapsyen || r.tajukAktiviti}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4 text-center">
                        <FileText className="w-8 h-8 mb-1 text-slate-300" />
                        <span className="text-[11px]">Tiada Foto Dimuat Naik</span>
                      </div>
                    )}

                    {/* Status Badge & Bilangan Foto */}
                    <div className="absolute top-2.5 left-2.5">
                      {getStatusBadge(r.status)}
                    </div>
                    {hasPhoto && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                        {r.gambar.length} Foto
                      </span>
                    )}
                  </div>

                  {/* Kandungan Kad */}
                  <div className="p-4 space-y-2.5">
                    {/* Unit & Peringkat */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-blue-700 truncate">
                        {r.namaUnit}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPeringkatBadgeColor(r.peringkat)}`}>
                        {r.peringkat}
                      </span>
                    </div>

                    {/* Tajuk Aktiviti */}
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {r.tajukAktiviti}
                    </h3>

                    {/* Info Ringkas: Tarikh, Masa, Tempat, Kehadiran */}
                    <div className="space-y-1 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatTarikhMY(r.tarikh)} ({r.masaMula} - {r.masaTamat})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{r.tempat}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Kehadiran: <strong>{r.sasaranPenglibatan.bilanganMuridHadir}/{r.sasaranPenglibatan.jumlahAhli}</strong> ({r.sasaranPenglibatan.peratusKehadiran}%)
                        </span>
                      </div>
                    </div>

                    {/* Pencapaian (jika ada) */}
                    {r.pencapaian && (
                      <div className="flex items-start gap-1.5 p-2 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900">
                        <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 font-medium">{r.pencapaian}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3 BUTANG JELAS & BERFUNGSI: JANA OPR, KEMASKINI, PADAM */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Button 1: Jana OPR */}
                  <button
                    type="button"
                    onClick={() => onOpenOPR(r)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                    title="Jana Laporan Satu Muka Surat (OPR)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Jana OPR</span>
                  </button>

                  {/* Button 2: Kemaskini */}
                  <button
                    type="button"
                    onClick={() => onEditRecord(r)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-700 border border-slate-300 text-xs font-semibold transition-colors"
                    title="Kemaskini maklumat aktiviti ini"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Kemaskini</span>
                  </button>

                  {/* Button 3: Padam */}
                  <button
                    type="button"
                    onClick={() => setRecordToDelete(r)}
                    className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                    title="Padam rekod ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Padam</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* PAPARAN JADUAL (TABLE MODE) - DENGAN BUTANG JELAS */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Tarikh</th>
                  <th className="py-3 px-3">Unit Kokurikulum</th>
                  <th className="py-3 px-3">Tajuk Aktiviti</th>
                  <th className="py-3 px-3">Peringkat</th>
                  <th className="py-3 px-3 text-center">Kehadiran</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-900">
                      {formatTarikhMY(r.tarikh)}
                      <span className="block text-[10px] text-slate-400">
                        {r.masaMula} - {r.masaTamat}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-bold text-blue-700 block">{r.namaUnit}</span>
                      <span className="text-[10px] text-slate-500">{r.kategoriUnit}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 max-w-xs">
                      <span className="line-clamp-2">{r.tajukAktiviti}</span>
                      <span className="block text-[10px] text-slate-400 font-normal truncate mt-0.5">
                        {r.tempat}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPeringkatBadgeColor(r.peringkat)}`}>
                        {r.peringkat}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="font-bold text-slate-800">
                        {r.sasaranPenglibatan.peratusKehadiran}%
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {r.sasaranPenglibatan.bilanganMuridHadir}/{r.sasaranPenglibatan.jumlahAhli}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenOPR(r)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-xs"
                          title="Jana OPR"
                        >
                          <Printer className="w-3 h-3" />
                          <span>OPR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditRecord(r)}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1"
                          title="Kemaskini Rekod"
                        >
                          <Edit3 className="w-3 h-3 text-blue-600" />
                          <span>Kemaskini</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecordToDelete(r)}
                          className="px-2 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold inline-flex items-center gap-1"
                          title="Padam Rekod"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Padam</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODAL PENGESAHAN PADAM REKOD (BEBAS MASALAH WINDOW.CONFIRM) */}
      <DeleteConfirmModal
        isOpen={recordToDelete !== null}
        title={recordToDelete?.tajukAktiviti || ''}
        subtitle={`Unit: ${recordToDelete?.namaUnit} • Tarikh: ${recordToDelete ? formatTarikhMY(recordToDelete.tarikh) : ''}`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setRecordToDelete(null)}
      />

    </div>
  );
};
