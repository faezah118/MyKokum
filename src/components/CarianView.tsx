import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Printer, 
  Edit3, 
  Trash2,
  X 
} from 'lucide-react';
import { RekodKokurikulum, UnitKokurikulum } from '../types';
import { formatTarikhMY } from '../utils/storage';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface CarianViewProps {
  records: RekodKokurikulum[];
  units: UnitKokurikulum[];
  onOpenOPR: (record: RekodKokurikulum) => void;
  onEditRecord: (record: RekodKokurikulum) => void;
  onDeleteRecord?: (id: string) => void;
}

export const CarianView: React.FC<CarianViewProps> = ({
  records,
  units,
  onOpenOPR,
  onEditRecord,
  onDeleteRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPeringkat, setFilterPeringkat] = useState<string>('SEMUA');
  const [filterKategori, setFilterKategori] = useState<string>('SEMUA');
  const [recordToDelete, setRecordToDelete] = useState<RekodKokurikulum | null>(null);

  const cleanTerm = searchTerm.toLowerCase().trim();

  const searchResults = records.filter((r) => {
    // Peringkat filter
    if (filterPeringkat !== 'SEMUA' && r.peringkat !== filterPeringkat) return false;
    // Kategori filter
    if (filterKategori !== 'SEMUA' && r.kategoriUnit !== filterKategori) return false;

    if (!cleanTerm) return true;

    // Search across all text fields
    const matchesTajuk = r.tajukAktiviti.toLowerCase().includes(cleanTerm);
    const matchesUnit = r.namaUnit.toLowerCase().includes(cleanTerm);
    const matchesTempat = r.tempat.toLowerCase().includes(cleanTerm);
    const matchesPencapaian = r.pencapaian.toLowerCase().includes(cleanTerm);
    const matchesRingkasan = r.ringkasanAktiviti.toLowerCase().includes(cleanTerm);
    const matchesPelapor = r.namaPelapor.toLowerCase().includes(cleanTerm);
    const matchesObjektif = r.objektif.some((obj) => obj.toLowerCase().includes(cleanTerm));
    const matchesTarikh = r.tarikh.includes(cleanTerm);

    return (
      matchesTajuk ||
      matchesUnit ||
      matchesTempat ||
      matchesPencapaian ||
      matchesRingkasan ||
      matchesPelapor ||
      matchesObjektif ||
      matchesTarikh
    );
  });

  const highlightText = (text: string, highlight: string) => {
    if (!highlight || !text) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const handleDeleteConfirm = () => {
    if (recordToDelete && onDeleteRecord) {
      onDeleteRecord(recordToDelete.id);
      setRecordToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Search Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Carian Pantas Rekod Kokurikulum
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cari aktiviti mengikut tajuk, nama unit, guru penyelaras, lokasi, atau pencapaian kejohanan.
          </p>
        </div>

        {/* Input Bar Utama */}
        <div className="relative">
          <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Taip carian anda di sini... (cth: bola jaring, MSSD, robotik, pengakap, dewan)"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-600 mr-1 text-[11px]">Peringkat:</span>
            {['SEMUA', 'Sekolah', 'Zon / Daerah', 'Negeri', 'Kebangsaan'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFilterPeringkat(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterPeringkat === p
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 text-[11px]">Kategori:</span>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
            >
              <option value="SEMUA">Semua Kategori</option>
              <option value="Sukan & Permainan">Sukan & Permainan</option>
              <option value="Kelab & Persatuan">Kelab & Persatuan</option>
              <option value="Unit Beruniform">Unit Beruniform</option>
            </select>
          </div>
        </div>

        {/* Quick Search Tag Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-1">
          <span>Cadangan kata kunci:</span>
          {['Bola Jaring', 'Robotik', 'Pengakap', 'Johan', 'MSSD', 'Perkhemahan'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchTerm(tag)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Result Stats Banner */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <span>
          Menunjukkan <strong>{searchResults.length}</strong> daripada <strong>{records.length}</strong> rekod aktiviti
        </span>
        {searchTerm && (
          <span>
            Padanan untuk: <strong className="text-blue-700 font-semibold">"{searchTerm}"</strong>
          </span>
        )}
      </div>

      {/* Search Results List */}
      {searchResults.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tiada Rekod Sepadan</h3>
          <p className="text-xs text-slate-500">
            Cuba gunakan perkataan yang lebih ringkas atau semak ejaan tajuk aktiviti.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setFilterPeringkat('SEMUA');
              setFilterKategori('SEMUA');
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
          >
            Kosongkan Carian
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {searchResults.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-blue-700">
                    {highlightText(r.namaUnit, cleanTerm)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">
                    {formatTarikhMY(r.tarikh)} ({r.masaMula} - {r.masaTamat})
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {r.peringkat}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {highlightText(r.tajukAktiviti, cleanTerm)}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-1">
                  {highlightText(r.ringkasanAktiviti, cleanTerm)}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{highlightText(r.tempat, cleanTerm)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kehadiran: {r.sasaranPenglibatan.bilanganMuridHadir}/{r.sasaranPenglibatan.jumlahAhli} ({r.sasaranPenglibatan.peratusKehadiran}%)</span>
                  </span>
                  {r.pencapaian && (
                    <span className="flex items-center gap-1 font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      <span>{highlightText(r.pencapaian, cleanTerm)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Jana OPR, Kemaskini, Padam */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenOPR(r)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                  title="Jana One Page Report sedia cetak"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Jana OPR</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditRecord(r)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors"
                  title="Kemaskini rekod"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kemaskini</span>
                </button>
                {onDeleteRecord && (
                  <button
                    type="button"
                    onClick={() => setRecordToDelete(r)}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors"
                    title="Padam rekod"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Padam</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Padam Rekod */}
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
