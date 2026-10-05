import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  ClipboardCopy, 
  Sparkles, 
  Download, 
  Check, 
  AlertCircle, 
  Trash2, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle,
  Users
} from 'lucide-react';
import { UnitKokurikulum } from '../types';

export interface ParsedGuruRow {
  namaGuru: string;
  unitDetected: string;
  unitIdMatched: string;
  peranan: 'Ketua Penyelaras / Penasihat' | 'Guru Penasihat';
  noTelefon?: string;
  emel?: string;
}

interface ImportGuruModalProps {
  units: UnitKokurikulum[];
  onClose: () => void;
  onImportGuru: (
    assignments: ParsedGuruRow[],
    mode: 'replace' | 'append'
  ) => void;
}

export const ImportGuruModal: React.FC<ImportGuruModalProps> = ({
  units,
  onClose,
  onImportGuru,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'sample'>('paste');
  const [pasteContent, setPasteContent] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [parsedRows, setParsedRows] = useState<ParsedGuruRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper pemadanan nama unit
  const findMatchingUnitId = (rawUnitText: string): string => {
    if (!rawUnitText) return units[0]?.id || '';
    const clean = rawUnitText.toLowerCase().trim();
    
    // Cari padanan tepat atau sebahagian
    const found = units.find((u) => {
      const uName = u.nama.toLowerCase();
      return uName === clean || uName.includes(clean) || clean.includes(uName);
    });

    return found ? found.id : (units[0]?.id || '');
  };

  // Helper parse raw text (TSV dari Excel atau CSV)
  const parseRawTextToRows = (raw: string): ParsedGuruRow[] => {
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return [];

    const results: ParsedGuruRow[] = [];
    const firstLine = lines[0].toLowerCase();
    const hasHeader = 
      firstLine.includes('nama') || 
      firstLine.includes('unit') || 
      firstLine.includes('peranan') || 
      firstLine.includes('jawatan') ||
      firstLine.includes('guru');

    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      let tokens: string[] = [];
      if (line.includes('\t')) {
        tokens = line.split('\t').map((t) => t.trim());
      } else if (line.includes(',')) {
        tokens = line.split(',').map((t) => t.trim().replace(/^"|"$/g, ''));
      } else if (line.includes(';')) {
        tokens = line.split(';').map((t) => t.trim());
      } else {
        tokens = [line];
      }

      if (tokens.length === 1 && !isNaN(Number(tokens[0]))) {
        continue;
      }

      let colOffset = 0;
      if (tokens.length > 1 && !isNaN(Number(tokens[0])) && tokens[0].length <= 3) {
        colOffset = 1;
      }

      const namaGuru = tokens[colOffset] || '';
      const unitText = tokens[colOffset + 1] || '';
      const roleText = (tokens[colOffset + 2] || '').toLowerCase();
      const noTel = tokens[colOffset + 3] || '';

      if (namaGuru.length < 2) continue;

      const isKetua = roleText.includes('ketua') || roleText.includes('penyelaras') || roleText === 'kp';
      const peranan: 'Ketua Penyelaras / Penasihat' | 'Guru Penasihat' = isKetua 
        ? 'Ketua Penyelaras / Penasihat' 
        : 'Guru Penasihat';

      const matchedId = findMatchingUnitId(unitText);

      results.push({
        namaGuru,
        unitDetected: unitText,
        unitIdMatched: matchedId,
        peranan,
        noTelefon: noTel,
      });
    }

    return results;
  };

  const handleProcessPaste = () => {
    setParseError(null);
    if (!pasteContent.trim()) {
      setParseError('Sila tampal teks atau data terlebih dahulu.');
      return;
    }
    const rows = parseRawTextToRows(pasteContent);
    if (rows.length === 0) {
      setParseError('Format tidak dikenali. Sila pastikan setiap baris mengandungi Nama Guru dan Unit.');
      return;
    }
    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const rows = parseRawTextToRows(content);
        if (rows.length === 0) {
          setParseError('Tiada rekod guru sah ditemui dalam fail yang dimuat naik.');
        } else {
          setParsedRows(rows);
        }
      }
    };
    reader.onerror = () => {
      setParseError('Gagal membaca fail.');
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const sampleGuruData = [
      { nama: 'Cikgu Ahmad Faris bin Zulkifli', unit: 'Kadet Remaja Sekolah', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Ustazah Nurul Hidayah binti Osman', unit: 'Pergerakan Puteri Islam', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Cikgu Mohd Razif bin Hamzah', unit: 'Kadet Polis Diraja Malaysia', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Cikgu Tan Mei Ling', unit: 'Persatuan Bulan Sabit Merah (PBSM)', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Cikgu Haslinda binti Abdul Kadir', unit: 'Pengakap', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Cikgu Siti Norhaliza binti Sidek', unit: 'Pandu Puteri', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Cikgu Kamaruddin bin Hashim', unit: 'Kelab Bola Sepak', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Cikgu Nor Aini binti Ismail', unit: 'Kelab Bola Jaring', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Cikgu Lee Wei Jian', unit: 'Kelab Badminton', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Cikgu Zainal Abidin bin Mansor', unit: 'Kelab Sepak Takraw', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Cikgu Nurul Izzati binti Radzi', unit: 'Kelab STEM & Robotik', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Ustaz Hafizuddin bin Zakaria', unit: 'Persatuan Pendidikan Islam', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Cikgu Grace Anak Johnny', unit: 'Persatuan Bahasa Inggeris', peranan: 'Ketua Penyelaras / Penasihat' },
      { nama: 'Cikgu Rosli bin Daud', unit: 'Kelab Seni Visual & Fotografi', peranan: 'Ketua Penyelaras / Penasihat' },
    ];

    const rows: ParsedGuruRow[] = sampleGuruData.map((s) => ({
      namaGuru: s.nama,
      unitDetected: s.unit,
      unitIdMatched: findMatchingUnitId(s.unit),
      peranan: s.peranan as 'Ketua Penyelaras / Penasihat',
    }));

    setParsedRows(rows);
    setParseError(null);
  };

  const handleDownloadTemplate = () => {
    const csvContent = [
      'Bil,Nama Guru,Unit Kokurikulum,Peranan,No Telefon',
      '1,Cikgu Ahmad Faris bin Zulkifli,Kadet Remaja Sekolah,Ketua Penyelaras / Penasihat,012-3456789',
      '2,Ustazah Nurul Hidayah binti Osman,Pergerakan Puteri Islam,Ketua Penyelaras / Penasihat,013-9876543',
      '3,Cikgu Kamaruddin bin Hashim,Kelab Bola Sepak,Ketua Penyelaras / Penasihat,019-8765432',
      '4,Cikgu Nor Aini binti Ismail,Kelab Bola Jaring,Ketua Penyelaras / Penasihat,011-2345678',
      '5,Cikgu Nurul Izzati binti Radzi,Kelab STEM & Robotik,Ketua Penyelaras / Penasihat,014-5678901',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'templat_guru_kokurikulum_smk_madai.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRowChange = (index: number, field: keyof ParsedGuruRow, val: string) => {
    const updated = [...parsedRows];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setParsedRows(updated);
  };

  const handleRemoveRow = (index: number) => {
    setParsedRows(parsedRows.filter((_, idx) => idx !== index));
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImportGuru(parsedRows, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 rounded-xl border border-teal-400/30 text-teal-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Import Senarai Guru Penasihat Kokurikulum</h3>
              <p className="text-xs text-teal-200/80">
                Tetapkan Guru Penyelaras & Penasihat bagi 41 Unit Kokurikulum SMK Madai Sesi 2026
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          
          {/* Action Tabs & Template Download */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'paste'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <ClipboardCopy className="w-3.5 h-3.5 inline mr-1" />
                Tampal Teks / Excel
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'upload'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5 inline mr-1" />
                Muat Naik CSV
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('sample');
                  handleLoadSample();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'sample'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                Data Contoh SMK Madai
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-2xs self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span>Muat Turun Templat CSV</span>
            </button>
          </div>

          {/* Mode 1: Paste Input */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                  <span>Salin dan tampal senarai guru daripada Excel atau Google Sheets:</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Format: Nama Guru [Tab] Unit Kokurikulum [Tab] Peranan
                </span>
              </div>
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Contoh:&#10;Ahmad Faris bin Zulkifli	Kadet Remaja Sekolah	Ketua Penyelaras&#10;Nurul Hidayah binti Osman	Pergerakan Puteri Islam	Ketua Penyelaras&#10;Kamaruddin bin Hashim	Kelab Bola Sepak	Guru Penasihat"
                rows={5}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleProcessPaste}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Proses & Pratonton Data
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: File Upload */}
          {activeTab === 'upload' && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 p-8 rounded-2xl text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-teal-700 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">
                {fileName ? `Fail Dipilih: ${fileName}` : 'Klik untuk Pilih Fail CSV atau Teks'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Menyokong fail .csv dengan pemisah koma atau tab
              </p>
            </div>
          )}

          {/* Error Notice */}
          {parseError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preview & Unit Matching Section */}
          {parsedRows.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Pratonton & Padanan Unit ({parsedRows.length} Guru Dikesan)
                  </h4>
                </div>

                {/* Import Mode Selection */}
                <div className="flex items-center gap-3 text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-600">Tindakan Pada Unit:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="guruImportMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-teal-700 focus:ring-teal-500"
                    />
                    <span>Kemas Kini Penyelaras Utama</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="guruImportMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-teal-700 focus:ring-teal-500"
                    />
                    <span>Tambah Ke Senarai Guru</span>
                  </label>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase sticky top-0">
                    <tr>
                      <th className="p-2.5">Bil</th>
                      <th className="p-2.5">Nama Guru</th>
                      <th className="p-2.5">Unit Kokurikulum (Padanan)</th>
                      <th className="p-2.5">Peranan</th>
                      <th className="p-2.5 text-center">Padam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => {
                      const matchedUnit = units.find((u) => u.id === row.unitIdMatched);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="p-2.5 font-semibold text-slate-900">
                            <input
                              type="text"
                              value={row.namaGuru}
                              onChange={(e) => handleRowChange(idx, 'namaGuru', e.target.value)}
                              className="w-full px-2 py-1 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-teal-500"
                            />
                          </td>
                          <td className="p-2.5">
                            <select
                              value={row.unitIdMatched}
                              onChange={(e) => handleRowChange(idx, 'unitIdMatched', e.target.value)}
                              className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-teal-500 font-medium"
                            >
                              {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.nama} ({u.kategori})
                                </option>
                              ))}
                            </select>
                            {row.unitDetected && row.unitDetected !== matchedUnit?.nama && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Asal: &quot;{row.unitDetected}&quot;
                              </span>
                            )}
                          </td>
                          <td className="p-2.5">
                            <select
                              value={row.peranan}
                              onChange={(e) => handleRowChange(idx, 'peranan', e.target.value)}
                              className="px-2 py-1 rounded border border-slate-300 text-xs bg-white font-medium"
                            >
                              <option value="Ketua Penyelaras / Penasihat">Ketua Penyelaras</option>
                              <option value="Guru Penasihat">Guru Penasihat</option>
                            </select>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {parsedRows.length > 0
              ? `${parsedRows.length} orang guru bersedia untuk disahkan`
              : 'Pilih atau tampal data guru untuk memulakan import'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={parsedRows.length === 0}
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Sahkan & Simpan Guru</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
