import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Filter,
  CheckCircle,
  Award,
  Layers
} from 'lucide-react';
import { UnitKokurikulum, MuridUnit } from '../types';

interface SenaraiMuridUnitModalProps {
  unit: UnitKokurikulum;
  students: MuridUnit[];
  onClose: () => void;
  onAddStudent: (student: MuridUnit) => void;
  onDeleteStudent: (studentId: string) => void;
  onOpenImportForUnit: (unitId: string) => void;
}

export const SenaraiMuridUnitModal: React.FC<SenaraiMuridUnitModalProps> = ({
  unit,
  students,
  onClose,
  onAddStudent,
  onDeleteStudent,
  onOpenImportForUnit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('SEMUA');
  const [showAddForm, setShowAddForm] = useState(false);

  // Manual Add Form State
  const [namaMurid, setNamaMurid] = useState('');
  const [noKp, setNoKp] = useState('');
  const [tingkatanKelas, setTingkatanKelas] = useState(
    unit.nama.includes('PPKI') ? 'PPKI Al-Farabi' : unit.nama.includes('T6') ? '6 Atas' : '4 Cemerlang'
  );
  const [jantina, setJantina] = useState<'Lelaki' | 'Perempuan'>('Lelaki');
  const [jawatan, setJawatan] = useState('Ahli Aktif');

  // Unique Classes for Filter
  const availableClasses = Array.from(new Set(students.map((s) => s.tingkatanKelas))).filter(Boolean);

  const filteredStudents = students.filter((s) => {
    if (filterKelas !== 'SEMUA' && s.tingkatanKelas !== filterKelas) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.namaMurid.toLowerCase().includes(q) ||
        (s.noKp && s.noKp.toLowerCase().includes(q)) ||
        s.tingkatanKelas.toLowerCase().includes(q) ||
        (s.jawatan && s.jawatan.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMurid.trim()) return;

    const newStudent: MuridUnit = {
      id: `m_${unit.id}_${Date.now()}`,
      unitId: unit.id,
      namaMurid: namaMurid.trim(),
      noKp: noKp.trim(),
      tingkatanKelas: tingkatanKelas.trim(),
      jantina,
      jawatan: jawatan.trim() || 'Ahli Aktif',
      tarikhDidaftar: new Date().toISOString(),
    };

    onAddStudent(newStudent);
    // Reset Form
    setNamaMurid('');
    setNoKp('');
    setShowAddForm(false);
  };

  // Export Senarai Murid ke CSV
  const handleExportCSV = () => {
    const headers = ['Bil', 'Nama Murid', 'No KP', 'Tingkatan/Kelas', 'Jantina', 'Jawatan', 'Unit Kokurikulum'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.namaMurid}"`,
      `"${s.noKp || ''}"`,
      `"${s.tingkatanKelas}"`,
      s.jantina || '-',
      `"${s.jawatan || 'Ahli Aktif'}"`,
      `"${unit.nama}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Senarai_Murid_${unit.nama.replace(/\s+/g, '_')}_SMK_Madai.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print attendance sheet
  const handlePrintAttendanceSheet = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  Senarai Murid Berdaftar — {unit.nama}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-900 text-blue-200 border border-blue-700">
                  {unit.kodUnit}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                SMK Madai • Penyelaras: {unit.guruPenyelaras} • {students.length} orang ahli berdaftar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenImportForUnit(unit.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
              title="Import senarai murid dari fail atau Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Murid</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet View for Printing */}
        <div className="hidden print:block p-8 text-slate-900">
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <h2 className="text-lg font-black uppercase">SMK MADAI, SABAH</h2>
            <h3 className="text-sm font-bold uppercase">SENARAI AHLI & BORANG KEHADIRAN KOKURIKULUM 2026</h3>
            <p className="text-xs font-semibold text-slate-700">
              UNIT: {unit.nama.toUpperCase()} ({unit.kategori.toUpperCase()}) | GURU PENYELARAS: {unit.guruPenyelaras.toUpperCase()}
            </p>
          </div>
          <table className="w-full text-left text-xs border border-slate-900 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900">
                <th className="p-2 border-r border-slate-900 text-center w-10">Bil</th>
                <th className="p-2 border-r border-slate-900">Nama Murid</th>
                <th className="p-2 border-r border-slate-900 w-32">No. KP</th>
                <th className="p-2 border-r border-slate-900 w-24">Kelas</th>
                <th className="p-2 border-r border-slate-900 w-28">Jawatan</th>
                <th className="p-2 border-r border-slate-900 w-16 text-center">T/Tangan</th>
                <th className="p-2 w-20 text-center">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, idx) => (
                <tr key={idx} className="border-b border-slate-400">
                  <td className="p-2 border-r border-slate-900 text-center">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-900 font-bold">{s.namaMurid}</td>
                  <td className="p-2 border-r border-slate-900 font-mono">{s.noKp || '-'}</td>
                  <td className="p-2 border-r border-slate-900">{s.tingkatanKelas}</td>
                  <td className="p-2 border-r border-slate-900">{s.jawatan || 'Ahli'}</td>
                  <td className="p-2 border-r border-slate-900"></td>
                  <td className="p-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Body (Interactive Screen View) */}
        <div className="no-print overflow-y-auto p-6 space-y-4 flex-1 text-xs">
          
          {/* Action Bar & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama murid, No. KP, atau jawatan..."
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {availableClasses.length > 0 && (
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  <option value="SEMUA">Semua Kelas</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Murid</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={filteredStudents.length === 0}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Eksport data senarai murid unit ke fail CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eksport CSV</span>
              </button>

              <button
                type="button"
                onClick={handlePrintAttendanceSheet}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                title="Cetak Senarai Kehadiran Unit Sedia Tandatangan"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cetak Borang</span>
              </button>
            </div>
          </div>

          {/* Manual Add Inline Form */}
          {showAddForm && (
            <form onSubmit={handleManualAdd} className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <h4 className="font-bold text-blue-900 text-xs">
                  Daftar Murid Baharu — {unit.nama}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Nama Penuh Murid *</label>
                  <input
                    type="text"
                    required
                    value={namaMurid}
                    onChange={(e) => setNamaMurid(e.target.value)}
                    placeholder="Contoh: Muhammad Danish bin Syazwan"
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">No. Kad Pengenalan</label>
                  <input
                    type="text"
                    value={noKp}
                    onChange={(e) => setNoKp(e.target.value)}
                    placeholder="090412-12-XXXX"
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tingkatan / Kelas *</label>
                  <input
                    type="text"
                    required
                    value={tingkatanKelas}
                    onChange={(e) => setTingkatanKelas(e.target.value)}
                    placeholder="Contoh: 4 Cemerlang"
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jawatan</label>
                  <input
                    type="text"
                    value={jawatan}
                    onChange={(e) => setJawatan(e.target.value)}
                    placeholder="Pengerusi / Ahli"
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Simpan Murid
                </button>
              </div>
            </form>
          )}

          {/* Students Table */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Tiada Rekod Murid Ditemui</h4>
                <p className="text-slate-500 text-xs mt-1">
                  Belum ada murid didaftarkan untuk unit <strong>{unit.nama}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenImportForUnit(unit.id);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import Senarai Murid Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-10 text-center">Bil</th>
                    <th className="p-2.5">Nama Penuh Murid</th>
                    <th className="p-2.5">No. Kad Pengenalan</th>
                    <th className="p-2.5">Tingkatan / Kelas</th>
                    <th className="p-2.5">Jantina</th>
                    <th className="p-2.5">Jawatan</th>
                    <th className="p-2.5 w-16 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">{s.namaMurid}</div>
                      </td>
                      <td className="p-2.5 text-slate-600 font-mono">{s.noKp || '-'}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 border border-slate-200">
                          {s.tingkatanKelas}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          s.jantina === 'Perempuan' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {s.jantina || 'Lelaki'}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className="font-semibold text-slate-800">
                          {s.jawatan || 'Ahli Aktif'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteStudent(s.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Padam rekod murid ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="no-print bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-slate-500 text-xs">
            Menunjukkan <strong className="text-slate-900">{filteredStudents.length}</strong> daripada <strong className="text-slate-900">{students.length}</strong> murid berdaftar
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
