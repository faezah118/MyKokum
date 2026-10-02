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
  UserCheck, 
  Layers,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { UnitKokurikulum, MuridUnit } from '../types';

interface ImportMuridModalProps {
  units: UnitKokurikulum[];
  selectedUnitId?: string;
  onClose: () => void;
  onImportComplete: (unitId: string, count: number) => void;
  onImportStudents: (
    unitId: string, 
    students: Omit<MuridUnit, 'id' | 'unitId'>[], 
    mode: 'append' | 'replace'
  ) => void;
}

interface ParsedRow {
  namaMurid: string;
  noKp: string;
  tingkatanKelas: string;
  jantina: 'Lelaki' | 'Perempuan';
  jawatan: string;
  unitDetected?: string;
}

export const ImportMuridModal: React.FC<ImportMuridModalProps> = ({
  units,
  selectedUnitId: initialUnitId,
  onClose,
  onImportComplete,
  onImportStudents,
}) => {
  const [targetUnitId, setTargetUnitId] = useState<string>(initialUnitId || units[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'sample'>('paste');
  const [pasteContent, setPasteContent] = useState<string>('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUnit = units.find((u) => u.id === targetUnitId) || units[0];

  // Helper untuk membersihkan dan memproses baris teks (TSV dari Excel atau CSV)
  const parseRawTextToRows = (raw: string): ParsedRow[] => {
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return [];

    const results: ParsedRow[] = [];

    // Semak jika baris pertama ialah tajuk lajur (header)
    const firstLine = lines[0].toLowerCase();
    const hasHeader = 
      firstLine.includes('nama') || 
      firstLine.includes('kp') || 
      firstLine.includes('kelas') || 
      firstLine.includes('tingkatan') || 
      firstLine.includes('ic');

    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Pisahkan mengikut Tab (jika paste dari Excel) atau Koma (jika CSV)
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

      // Abaikan jika hanya nombor urutan (cth: "1", "2")
      if (tokens.length === 1 && !isNaN(Number(tokens[0]))) {
        continue;
      }

      // Jika ada lajur pertama nombor giliran (cth: 1, 2, 3), kita anjak
      let colOffset = 0;
      if (tokens.length > 1 && !isNaN(Number(tokens[0])) && tokens[0].length <= 3) {
        colOffset = 1;
      }

      const nama = tokens[colOffset] || '';
      if (!nama || nama.length < 2) continue;

      const noKp = tokens[colOffset + 1] || '';
      const kelas = tokens[colOffset + 2] || (currentUnit?.nama.includes('PPKI') ? 'PPKI Al-Farabi' : currentUnit?.nama.includes('T6') ? '6 Atas' : '4 Cemerlang');
      
      let jantina: 'Lelaki' | 'Perempuan' = 'Lelaki';
      const rawJantina = (tokens[colOffset + 3] || '').toUpperCase();
      if (rawJantina.startsWith('P') || rawJantina.includes('FEMALE') || rawJantina.includes('PEREMPUAN') || nama.toLowerCase().includes('binti') || nama.toLowerCase().includes('bt')) {
        jantina = 'Perempuan';
      }

      const jawatan = tokens[colOffset + 4] || 'Ahli Aktif';

      results.push({
        namaMurid: nama,
        noKp,
        tingkatanKelas: kelas,
        jantina,
        jawatan,
      });
    }

    return results;
  };

  // Handler apabila teks ditampal atau diproses
  const handleParsePaste = () => {
    setParseError(null);
    if (!pasteContent.trim()) {
      setParseError('Sila tampal teks atau senarai nama murid terlebih dahulu.');
      return;
    }

    const rows = parseRawTextToRows(pasteContent);
    if (rows.length === 0) {
      setParseError('Tidak dapat mengenal pasti data murid. Pastikan setiap baris mengandungi sekurang-kurangnya nama murid.');
      return;
    }

    setParsedRows(rows);
  };

  // Handler fail CSV / TXT
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setParseError('Fail yang dimuat naik kosong.');
        return;
      }
      setPasteContent(content);
      const rows = parseRawTextToRows(content);
      if (rows.length === 0) {
        setParseError('Format fail tidak sah atau tiada data nama murid dikesan.');
      } else {
        setParsedRows(rows);
      }
    };
    reader.onerror = () => {
      setParseError('Ralat membaca fail.');
    };
    reader.readAsText(file);
  };

  // Contoh Pantas Murid SMK Madai
  const handleLoadSampleData = () => {
    setParseError(null);
    let sampleData: ParsedRow[] = [];

    if (currentUnit?.nama.includes('PPKI')) {
      sampleData = [
        { namaMurid: 'Mohd Amirul Hafiz (PPKI)', noKp: '090101-12-1111', tingkatanKelas: 'PPKI Al-Farabi', jantina: 'Lelaki', jawatan: 'Ketua Unit' },
        { namaMurid: 'Siti Sarah binti Karim (PPKI)', noKp: '100202-12-2222', tingkatanKelas: 'PPKI Al-Biruni', jantina: 'Perempuan', jawatan: 'Penolong Ketua' },
        { namaMurid: 'Bryan Lee (PPKI)', noKp: '110303-12-3333', tingkatanKelas: 'PPKI Al-Razi', jantina: 'Lelaki', jawatan: 'Setiausaha' },
        { namaMurid: 'Nur Aisyah Humaira (PPKI)', noKp: '090404-12-4444', tingkatanKelas: 'PPKI Al-Farabi', jantina: 'Perempuan', jawatan: 'Ahli Aktif' },
        { namaMurid: 'Muhammad Danish Rayyan (PPKI)', noKp: '100505-12-5555', tingkatanKelas: 'PPKI Al-Khawarizmi', jantina: 'Lelaki', jawatan: 'Ahli Aktif' },
      ];
    } else if (currentUnit?.nama.includes('T6') || currentUnit?.nama.includes('Tingkatan 6')) {
      sampleData = [
        { namaMurid: 'Mohamad Aidil bin Kamaruddin', noKp: '070315-12-8891', tingkatanKelas: '6 Atas Sains', jantina: 'Lelaki', jawatan: 'Pengerusi' },
        { namaMurid: 'Nor Farah Hanim binti Dahlan', noKp: '070908-12-6612', tingkatanKelas: '6 Atas Sastera 1', jantina: 'Perempuan', jawatan: 'Naib Pengerusi' },
        { namaMurid: 'Wan Amirul Hakim bin Wan Ramli', noKp: '070119-12-2345', tingkatanKelas: '6 Atas Sastera 2', jantina: 'Lelaki', jawatan: 'Setiausaha' },
        { namaMurid: 'Clara Evelyn Wong', noKp: '071120-12-9908', tingkatanKelas: '6 Rendah Sains', jantina: 'Perempuan', jawatan: 'Bendahari' },
        { namaMurid: 'Muhammad Haziq bin Faizal', noKp: '070425-12-7711', tingkatanKelas: '6 Rendah Sastera', jantina: 'Lelaki', jawatan: 'AJK Disiplin' },
      ];
    } else {
      sampleData = [
        { namaMurid: 'Muhammad Adam bin Hairul', noKp: '090312-12-5511', tingkatanKelas: '4 Cemerlang', jantina: 'Lelaki', jawatan: 'Pengerusi' },
        { namaMurid: 'Nur Damia Insyirah binti Zamri', noKp: '090715-12-8822', tingkatanKelas: '4 Cemerlang', jantina: 'Perempuan', jawatan: 'Naib Pengerusi' },
        { namaMurid: 'Aiman Farhan bin Sukor', noKp: '100220-12-1133', tingkatanKelas: '3 Arif', jantina: 'Lelaki', jawatan: 'Setiausaha' },
        { namaMurid: 'Nurul Huda binti Bahrin', noKp: '100808-12-4400', tingkatanKelas: '3 Bestari', jantina: 'Perempuan', jawatan: 'Bendahari' },
        { namaMurid: 'Calvin Lee Wei Shen', noKp: '110505-12-3344', tingkatanKelas: '2 Amanah', jantina: 'Lelaki', jawatan: 'AJK Peralatan' },
        { namaMurid: 'Dayang Siti Aminah binti Kassim', noKp: '110912-12-7755', tingkatanKelas: '2 Dedikasi', jantina: 'Perempuan', jawatan: 'Ahli Aktif' },
        { namaMurid: 'Muhammad Aliff Haikal bin Shahril', noKp: '120101-12-9911', tingkatanKelas: '1 Cekal', jantina: 'Lelaki', jawatan: 'Ahli Aktif' },
        { namaMurid: 'Puteri Nur Balqis binti Mazlan', noKp: '120414-12-6633', tingkatanKelas: '1 Bestari', jantina: 'Perempuan', jawatan: 'Ahli Aktif' },
      ];
    }

    setParsedRows(sampleData);
    setPasteContent(
      sampleData.map((s, idx) => `${idx + 1}\t${s.namaMurid}\t${s.noKp}\t${s.tingkatanKelas}\t${s.jantina}\t${s.jawatan}`).join('\n')
    );
  };

  // Muat turun fail templat CSV
  const handleDownloadTemplate = () => {
    const csvContent = 
      "Bil,Nama Murid,No KP,Tingkatan/Kelas,Jantina,Jawatan\n" +
      "1,Muhammad Adam bin Hairul,090312-12-5511,4 Cemerlang,Lelaki,Pengerusi\n" +
      "2,Nur Damia Insyirah binti Zamri,090715-12-8822,4 Cemerlang,Perempuan,Naib Pengerusi\n" +
      "3,Aiman Farhan bin Sukor,100220-12-1133,3 Arif,Lelaki,Setiausaha\n" +
      "4,Nurul Huda binti Bahrin,100808-12-4400,3 Bestari,Perempuan,Bendahari\n" +
      "5,Calvin Lee Wei Shen,110505-12-3344,2 Amanah,Lelaki,Ahli Aktif\n";

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Templat_Senarai_Murid_SMK_Madai.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Padam baris dari pratonton
  const handleRemoveRow = (index: number) => {
    setParsedRows(parsedRows.filter((_, i) => i !== index));
  };

  // Simpan data ke dalam sistem
  const handleSaveImport = () => {
    if (parsedRows.length === 0) {
      setParseError('Tiada senarai murid yang sah untuk diimport.');
      return;
    }

    const studentsToSave = parsedRows.map((r) => ({
      namaMurid: r.namaMurid,
      noKp: r.noKp,
      tingkatanKelas: r.tingkatanKelas,
      jantina: r.jantina,
      jawatan: r.jawatan,
    }));

    onImportStudents(targetUnitId, studentsToSave, importMode);
    onImportComplete(targetUnitId, studentsToSave.length);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Import Senarai Murid SMK Madai
              </h3>
              <p className="text-xs text-slate-400">
                Simpan data rekod murid mengikut unit kokurikulum secara berpusat (APDM / Excel)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          
          {/* 1. Pilih Unit Sasaran & Mod Import */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="md:col-span-2 space-y-1">
              <label className="block font-bold text-slate-800 text-xs">
                Pilih Unit Kokurikulum Sasaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetUnitId}
                onChange={(e) => setTargetUnitId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white font-semibold text-xs focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="Unit Beruniform (11 Unit)">
                  {units.filter((u) => u.kategori === 'Unit Beruniform').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} ({u.kodUnit}) — Penyelaras: {u.guruPenyelaras}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Kelab & Persatuan (18 Unit)">
                  {units.filter((u) => u.kategori === 'Kelab & Persatuan').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} ({u.kodUnit}) — Penyelaras: {u.guruPenyelaras}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Sukan & Permainan (12 Unit)">
                  {units.filter((u) => u.kategori === 'Sukan & Permainan').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} ({u.kodUnit}) — Penyelaras: {u.guruPenyelaras}
                    </option>
                  ))}
                </optgroup>
              </select>
              <p className="text-[11px] text-slate-500">
                Semua murid yang diimport akan didaftarkan di bawah unit <strong>{currentUnit?.nama}</strong>.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-800 text-xs">
                Kaedah Kemasukan
              </label>
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">Tambah ke senarai sedia ada</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">Gantikan senarai unit ini</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Kaedah Import Tabs */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'paste'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ClipboardCopy className="w-3.5 h-3.5" />
                  <span>Salin & Tampal (Excel / APDM)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'upload'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Muat Naik Fail (.CSV / .TXT)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('sample');
                    handleLoadSampleData();
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'sample'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Contoh Pantas SMK Madai</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold hover:underline"
                title="Muat turun templat CSV standard untuk diisi dalam Microsoft Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Templat CSV</span>
              </button>
            </div>

            {/* TAB A: Salin & Tampal */}
            {activeTab === 'paste' && (
              <div className="mt-3 space-y-2">
                <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 text-blue-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Cara Pantas:</strong> Buka fail Excel / APDM / PAJSK anda, pilih lajur (Nama, No KP, Kelas, Jantina, Jawatan), tekan <code>Ctrl+C</code> untuk salin, dan tampal (<code>Ctrl+V</code>) di ruang bawah. Sistem akan memisahkan maklumat secara automatik.
                  </p>
                </div>

                <textarea
                  rows={5}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={`Contoh baris Excel / APDM yang boleh ditampal:\n1\tMuhammad Adam bin Hairul\t090312-12-5511\t4 Cemerlang\tLelaki\tPengerusi\n2\tNur Damia Insyirah binti Zamri\t090715-12-8822\t4 Cemerlang\tPerempuan\tNaib Pengerusi\n3\tAiman Farhan bin Sukor\t100220-12-1133\t3 Arif\tLelaki\tSetiausaha`}
                  className="w-full p-3 font-mono text-[11px] rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleParsePaste}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Imbas & Pratonton Data</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB B: Upload CSV */}
            {activeTab === 'upload' && (
              <div className="mt-3 space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 p-8 rounded-2xl text-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <UploadCloud className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 text-sm">
                    {fileName ? fileName : 'Klik di sini untuk memilih fail .CSV atau .TXT'}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Sesuai untuk fail eksport APDM, PAJSK, atau Microsoft Excel
                  </p>
                </div>
              </div>
            )}

            {/* TAB C: Sample Data Alert */}
            {activeTab === 'sample' && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>
                    Contoh senarai murid rasmi SMK Madai telah dimuatkan mengikut profil unit <strong>{currentUnit?.nama}</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px]"
                >
                  Jana Semula Contoh
                </button>
              </div>
            )}
          </div>

          {/* Ralat Pemprosesan */}
          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* 3. Jadual Pratonton Murid (Preview Table) */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Pratonton Rekod Murid Dikesan:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[11px]">
                    {parsedRows.length} Orang Murid
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setParsedRows([])}
                  className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Pratonton</span>
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-2 w-10 text-center">Bil</th>
                      <th className="p-2">Nama Murid</th>
                      <th className="p-2">No. Kad Pengenalan</th>
                      <th className="p-2">Tingkatan / Kelas</th>
                      <th className="p-2">Jantina</th>
                      <th className="p-2">Jawatan</th>
                      <th className="p-2 w-10 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-900">{row.namaMurid}</td>
                        <td className="p-2 text-slate-600 font-mono">{row.noKp || '-'}</td>
                        <td className="p-2 text-slate-700 font-medium">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {row.tingkatanKelas}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded font-semibold ${
                            row.jantina === 'Perempuan' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {row.jantina}
                          </span>
                        </td>
                        <td className="p-2 text-slate-700 font-medium">{row.jawatan}</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Buang baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-slate-500 text-xs">
            Unit Sasaran: <strong className="text-slate-900">{currentUnit?.nama}</strong> | Jumlah murid bakal disimpan: <strong className="text-blue-700">{parsedRows.length}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveImport}
              disabled={parsedRows.length === 0}
              className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 ${
                parsedRows.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 cursor-pointer'
                  : 'bg-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Simpan Senarai Murid ({parsedRows.length})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
