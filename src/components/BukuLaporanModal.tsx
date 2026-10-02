import React from 'react';
import { X, Printer, BookOpen, Award, CheckCircle, FileText, Download } from 'lucide-react';
import { RekodKokurikulum, UnitKokurikulum } from '../types';
import { formatTarikhMY } from '../utils/storage';

interface BukuLaporanModalProps {
  records: RekodKokurikulum[];
  units: UnitKokurikulum[];
  onClose: () => void;
}

export const BukuLaporanModal: React.FC<BukuLaporanModalProps> = ({
  records,
  units,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const sukanRecords = records.filter((r) => r.kategoriUnit === 'Sukan & Permainan');
  const kelabRecords = records.filter((r) => r.kategoriUnit === 'Kelab & Persatuan');
  const uniformRecords = records.filter((r) => r.kategoriUnit === 'Unit Beruniform');

  const pencapaianRecords = records.filter(
    (r) => r.peringkat !== 'Sekolah' || r.jenisRekod === 'Pertandingan & Kejohanan' || r.jenisRekod === 'Pencapaian Khas'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Toolbar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Buku Laporan Tahunan Kokurikulum Sesi 2026
              </h3>
              <p className="text-[11px] text-slate-400">
                Eksport Kolektif Aktiviti & Pencapaian Lengkap Seluruh Sekolah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              title="Cetak Buku Laporan Tahunan Lengkap atau Simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Eksport PDF Buku Laporan</span>
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

        {/* Scrollable Document Content */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-[210mm] p-8 sm:p-12 shadow-md border border-slate-300 print:border-none print:shadow-none print:p-2 text-slate-900 space-y-12">
            
            {/* 1. MUKA HADAPAN (COVER PAGE) */}
            <div className="min-h-[250mm] flex flex-col justify-between items-center text-center border-4 border-double border-slate-800 p-8 rounded-xs page-break">
              <div>
                <div className="w-20 h-20 mx-auto rounded-xl bg-blue-900 text-white flex items-center justify-center text-2xl font-black border-2 border-amber-400 shadow-md">
                  KPM
                </div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600 mt-4">
                  KEMENTERIAN PENDIDIKAN MALAYSIA
                </h4>
                <h3 className="text-sm font-black uppercase text-slate-800 mt-1">
                  SEKOLAH MENENGAH KEBANGSAAN MADAI (SMK MADAI)
                </h3>
              </div>

              <div className="space-y-4 my-12">
                <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                  DOKUMEN RASMI KOKURIKULUM SEKOLAH
                </div>
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                  BUKU LAPORAN TAHUNAN KOKURIKULUM
                </h1>
                <h2 className="text-xl sm:text-2xl font-bold text-blue-900">
                  SESI PERSEKOLAHAN 2026
                </h2>
                <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
                <p className="text-base font-semibold text-slate-700">
                  SEKOLAH MENENGAH KEBANGSAAN MADAI
                </p>
              </div>

              <div className="border-t border-slate-300 pt-6 w-full text-xs text-slate-600 space-y-1">
                <p><strong>Disediakan Oleh:</strong> Setiausaha Kokurikulum & Guru-guru Penyelaras Unit SMK Madai</p>
                <p><strong>Disahkan Oleh:</strong> Pengetua & Penolong Kanan Kokurikulum SMK Madai</p>
                <p><strong>Platform Penjanaan:</strong> MyKokum+ (Sistem Berpusat Kokurikulum 2026)</p>
                <p className="text-[10px] text-slate-400">Dicetak pada: 2026-09-21</p>
              </div>
            </div>

            {/* 2. RINGKASAN EKSEKUTIF KOKURIKULUM 2026 */}
            <div className="page-break space-y-6 pt-4">
              <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                <h3 className="text-lg font-black uppercase text-slate-900">
                  1. RINGKASAN EKSEKUTIF KOKURIKULUM 2026
                </h3>
                <span className="text-xs font-bold text-blue-900">SMK Madai</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 border border-slate-300 bg-slate-50 rounded">
                  <span className="text-xl font-black text-blue-700">{units.length}</span>
                  <p className="text-[10px] uppercase font-bold text-slate-600">Jumlah Unit</p>
                </div>
                <div className="p-3 border border-slate-300 bg-slate-50 rounded">
                  <span className="text-xl font-black text-slate-900">{records.length}</span>
                  <p className="text-[10px] uppercase font-bold text-slate-600">Aktiviti Dilaksana</p>
                </div>
                <div className="p-3 border border-slate-300 bg-slate-50 rounded">
                  <span className="text-xl font-black text-emerald-700">
                    {Math.round(records.reduce((acc, r) => acc + r.sasaranPenglibatan.peratusKehadiran, 0) / (records.length || 1))}%
                  </span>
                  <p className="text-[10px] uppercase font-bold text-slate-600">Purata Kehadiran</p>
                </div>
                <div className="p-3 border border-slate-300 bg-slate-50 rounded">
                  <span className="text-xl font-black text-amber-600">{pencapaianRecords.length}</span>
                  <p className="text-[10px] uppercase font-bold text-slate-600">Kejayaan & Anugerah</p>
                </div>
              </div>

              <div className="text-xs leading-relaxed space-y-3 text-slate-800">
                <p>
                  Sepanjang sesi persekolahan 2026, pelaksanaan aktiviti kokurikulum di <strong>SMK Madai</strong> telah berjalan dengan lancar mengikut jadual yang ditetapkan oleh Unit Kokurikulum. Sebanyak <strong>{units.length} unit</strong> di bawah tiga komponen utama—Sukan & Permainan, Kelab & Persatuan, serta Pasukan Badan Beruniform—telah aktif menjalankan perjumpaan mingguan, kursus kepimpinan, dan menyertai pelbagai kejohanan luar.
                </p>
                <p>
                  Penggunaan platform digital <strong>MyKokum+</strong> telah membolehkan data perjumpaan direkodkan secara langsung sejurus aktiviti tamat. Ini memudahkan pemantauan kehadiran murid, penjanaan One Page Report (OPR) standard, dan pengesahan pencapaian oleh pihak pentadbir.
                </p>
              </div>

              {/* DIREKTORI UNIT */}
              <div className="space-y-3 pt-4">
                <h4 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-200 pb-1">
                  Direktori Unit Kokurikulum & Guru Penyelaras 2026
                </h4>
                <table className="w-full text-[11px] border-collapse border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800">
                    <tr>
                      <th className="border border-slate-300 p-1.5 text-left">Kod</th>
                      <th className="border border-slate-300 p-1.5 text-left">Nama Unit</th>
                      <th className="border border-slate-300 p-1.5 text-left">Kategori</th>
                      <th className="border border-slate-300 p-1.5 text-left">Guru Penyelaras</th>
                      <th className="border border-slate-300 p-1.5 text-center">Bil. Ahli</th>
                      <th className="border border-slate-300 p-1.5 text-center">Rekod</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((u) => {
                      const recCount = records.filter((r) => r.unitId === u.id).length;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-1.5 font-mono text-[10px]">{u.kodUnit}</td>
                          <td className="border border-slate-300 p-1.5 font-bold text-slate-900">{u.nama}</td>
                          <td className="border border-slate-300 p-1.5">{u.kategori}</td>
                          <td className="border border-slate-300 p-1.5">{u.guruPenyelaras}</td>
                          <td className="border border-slate-300 p-1.5 text-center font-semibold">{u.bilanganAhli}</td>
                          <td className="border border-slate-300 p-1.5 text-center font-bold text-blue-700">{recCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. SENARAI PENCAPAIAN CEMERLANG 2026 */}
            <div className="page-break space-y-4 pt-4">
              <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                <h3 className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>2. REKOD PENCAPAIAN & KEJAYAAN KOKURIKULUM 2026</span>
                </h3>
                <span className="text-xs text-slate-500">Peringkat Daerah / Negeri / Kebangsaan</span>
              </div>

              <div className="space-y-3">
                {pencapaianRecords.map((p, idx) => (
                  <div key={p.id} className="p-3 border border-slate-300 rounded bg-slate-50 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 text-xs">{idx + 1}. {p.tajukAktiviti}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                        {p.peringkat}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Unit: <strong>{p.namaUnit}</strong> | Tarikh: {formatTarikhMY(p.tarikh)} | Tempat: {p.tempat}
                    </p>
                    <p className="font-semibold text-slate-900 bg-white p-2 rounded border border-slate-200">
                      {p.pencapaian}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. LOG LENGKAP SEMUA PERJUMPAAN & AKTIVITI */}
            <div className="space-y-4 pt-4">
              <div className="border-b-2 border-slate-900 pb-2">
                <h3 className="text-lg font-black uppercase text-slate-900">
                  3. LOG PENUH PERJUMPAAN & AKTIVITI UNIT KOKURIKULUM 2026
                </h3>
              </div>

              <table className="w-full text-[10px] border-collapse border border-slate-300">
                <thead className="bg-slate-100 text-slate-800">
                  <tr>
                    <th className="border border-slate-300 p-1 text-center w-8">Bil</th>
                    <th className="border border-slate-300 p-1 text-left">Tarikh</th>
                    <th className="border border-slate-300 p-1 text-left">Unit</th>
                    <th className="border border-slate-300 p-1 text-left">Tajuk Aktiviti</th>
                    <th className="border border-slate-300 p-1 text-center">Kehadiran</th>
                    <th className="border border-slate-300 p-1 text-left">Hasil / Pencapaian</th>
                    <th className="border border-slate-300 p-1 text-center">Pelapor</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-1 text-center font-mono">{i + 1}</td>
                      <td className="border border-slate-300 p-1 whitespace-nowrap">{r.tarikh}</td>
                      <td className="border border-slate-300 p-1 font-semibold text-blue-900">{r.namaUnit}</td>
                      <td className="border border-slate-300 p-1">{r.tajukAktiviti}</td>
                      <td className="border border-slate-300 p-1 text-center font-bold">
                        {r.sasaranPenglibatan.peratusKehadiran}%
                      </td>
                      <td className="border border-slate-300 p-1 text-slate-700 line-clamp-1">{r.pencapaian}</td>
                      <td className="border border-slate-300 p-1 text-[9px]">{r.namaPelapor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-8 border-t-2 border-slate-800 text-center text-xs text-slate-500">
                <p className="font-semibold text-slate-700">
                  BUKU LAPORAN TAHUNAN KOKURIKULUM 2026 - SMK MADAI
                </p>
                <p className="text-[10px] mt-0.5">
                  Dijana secara automatik melalui sistem MyKokum+ | Hak Cipta Terpelihara Kementerian Pendidikan Malaysia
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
