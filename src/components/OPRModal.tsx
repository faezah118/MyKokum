import React from 'react';
import { Printer, X, Download, FileText, CheckCircle, Calendar, MapPin, Users, Award } from 'lucide-react';
import { RekodKokurikulum } from '../types';
import { formatTarikhMY } from '../utils/storage';

interface OPRModalProps {
  record: RekodKokurikulum | null;
  onClose: () => void;
}

export const OPRModal: React.FC<OPRModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Container Dialog */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Modal Toolbar (Disembunyikan ketika cetak) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Penjana OPR Automatik (One Page Report)
              </h3>
              <p className="text-[11px] text-slate-400">
                Format Rasmi Kokurikulum 2026 sedia cetak / muat turun PDF (Menggantikan Canva)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              title="Cetak atau Simpan sebagai PDF melalui dialog pelayar"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Tutup Pratonton"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paparan Dokumen A4 OPR */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div 
            id="opr-print-area"
            className="bg-white w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-8 rounded-lg shadow-md border border-slate-300 print:border-none print:shadow-none print:p-2 text-slate-900 flex flex-col justify-between"
            style={{ boxSizing: 'border-box' }}
          >
            {/* 1. KEPALA SURAT (HEADER KPM / SEKOLAH) */}
            <div>
              <div className="border-b-2 border-slate-900 pb-3 text-center relative">
                <div className="flex items-center justify-center gap-3">
                  {/* Jata Malaysia / Logo Mock */}
                  <div className="w-12 h-12 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-xl border border-amber-400 shrink-0">
                    KPM
                  </div>
                  <div>
                    <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-700">
                      KEMENTERIAN PENDIDIKAN MALAYSIA
                    </h4>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                      SEKOLAH MENENGAH KEBANGSAAN MADAI (SMK MADAI)
                    </h2>
                    <p className="text-[10px] font-semibold text-blue-800 tracking-wider uppercase">
                      UNIT KOKURIKULUM SESI PERSEKOLAHAN 2026
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 inline-block bg-slate-900 text-white px-4 py-1 rounded text-xs font-black uppercase tracking-wider">
                  LAPORAN SATU MUKA SURAT / ONE PAGE REPORT (OPR)
                </div>
              </div>

              {/* 2. MAKLUMAT UTAMA AKTIVITI (JADUAL KEMAS) */}
              <div className="mt-4 border border-slate-800 text-[11px] leading-snug">
                <div className="grid grid-cols-12 border-b border-slate-800 bg-slate-100 font-bold">
                  <div className="col-span-3 p-1.5 border-r border-slate-800 uppercase text-slate-700">UNIT KOKURIKULUM</div>
                  <div className="col-span-5 p-1.5 border-r border-slate-800 text-blue-900 uppercase">{record.namaUnit}</div>
                  <div className="col-span-2 p-1.5 border-r border-slate-800 uppercase text-slate-700">KATEGORI</div>
                  <div className="col-span-2 p-1.5 text-slate-900 uppercase">{record.kategoriUnit}</div>
                </div>

                <div className="grid grid-cols-12 border-b border-slate-800">
                  <div className="col-span-3 p-1.5 border-r border-slate-800 font-bold uppercase text-slate-700 bg-slate-50">TAJUK AKTIVITI</div>
                  <div className="col-span-9 p-1.5 font-bold text-slate-900">{record.tajukAktiviti}</div>
                </div>

                <div className="grid grid-cols-12 border-b border-slate-800">
                  <div className="col-span-3 p-1.5 border-r border-slate-800 font-bold uppercase text-slate-700 bg-slate-50">TARIKH & MASA</div>
                  <div className="col-span-5 p-1.5 border-r border-slate-800">
                    {formatTarikhMY(record.tarikh)} ({record.masaMula} - {record.masaTamat})
                  </div>
                  <div className="col-span-2 p-1.5 border-r border-slate-800 font-bold uppercase text-slate-700 bg-slate-50">PERINGKAT</div>
                  <div className="col-span-2 p-1.5 font-semibold text-indigo-900">{record.peringkat}</div>
                </div>

                <div className="grid grid-cols-12 border-b border-slate-800">
                  <div className="col-span-3 p-1.5 border-r border-slate-800 font-bold uppercase text-slate-700 bg-slate-50">TEMPAT</div>
                  <div className="col-span-5 p-1.5 border-r border-slate-800">{record.tempat}</div>
                  <div className="col-span-2 p-1.5 border-r border-slate-800 font-bold uppercase text-slate-700 bg-slate-50">JENIS REKOD</div>
                  <div className="col-span-2 p-1.5">{record.jenisRekod}</div>
                </div>

                <div className="grid grid-cols-12">
                  <div className="col-span-3 p-1.5 border-r border-slate-800 font-bold uppercase text-slate-700 bg-slate-50">PENGLIBATAN</div>
                  <div className="col-span-9 p-1.5">
                    <strong>{record.sasaranPenglibatan.bilanganMuridHadir}</strong> daripada <strong>{record.sasaranPenglibatan.jumlahAhli}</strong> Murid ({record.sasaranPenglibatan.peratusKehadiran}% Kehadiran) | Guru Pembimbing: {record.sasaranPenglibatan.bilanganGuruHadir} Orang | Sasaran: {record.sasaranPenglibatan.kumpulanSasaran}
                  </div>
                </div>
              </div>

              {/* 3. OBJEKTIF & RINGKASAN AKTIVITI */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                {/* Objektif */}
                <div className="border border-slate-800 p-2.5 rounded-xs">
                  <h5 className="font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-700" />
                    <span>Objektif Aktiviti</span>
                  </h5>
                  <ul className="space-y-1 list-disc list-inside text-slate-800">
                    {record.objektif.map((obj, i) => (
                      <li key={i} className="leading-snug">{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* Pencapaian / Hasil */}
                <div className="border border-slate-800 p-2.5 rounded-xs bg-amber-50/40">
                  <h5 className="font-bold uppercase text-amber-950 border-b border-amber-300 pb-1 mb-1.5 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pencapaian / Hasil Impak</span>
                  </h5>
                  <p className="leading-snug text-slate-900 font-medium">
                    {record.pencapaian || 'Aktiviti berjaya mencapai matlamat perjumpaan dengan penglibatan aktif semua ahli.'}
                  </p>
                </div>
              </div>

              {/* 4. RINGKASAN AKTIVITI & REFLEKSI */}
              <div className="mt-3 border border-slate-800 p-2.5 text-[11px]">
                <h5 className="font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                  Ringkasan Pelaksanaan Aktiviti
                </h5>
                <p className="leading-relaxed text-slate-800 text-justify">
                  {record.ringkasanAktiviti}
                </p>

                {(record.refleksiKekuatan || record.refleksiPenambahbaikan) && (
                  <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <strong className="text-emerald-800">Kekuatan:</strong> {record.refleksiKekuatan || '-'}
                    </div>
                    <div>
                      <strong className="text-amber-800">Penambahbaikan:</strong> {record.refleksiPenambahbaikan || '-'}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. KOLAJ FOTO AKTIVITI (Sedia Cetak Pengganti Canva) */}
              <div className="mt-3 border border-slate-800 p-2 text-[11px]">
                <h5 className="font-bold uppercase text-slate-900 mb-1.5 text-center bg-slate-100 py-0.5 border border-slate-300">
                  DOKUMENTASI BERGAMBAR AKTIVITI
                </h5>

                {record.gambar && record.gambar.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                    {record.gambar.slice(0, 4).map((g, idx) => (
                      <div key={g.id || idx} className="border border-slate-400 p-1 bg-white text-center flex flex-col">
                        <div className="aspect-[16/10] bg-slate-100 overflow-hidden rounded-xs flex items-center justify-center">
                          <img
                            src={g.url}
                            alt={g.kapsyen}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <p className="text-[10px] font-medium text-slate-700 mt-1 line-clamp-1 italic">
                          {g.kapsyen || `Foto ${idx + 1} Aktiviti`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 italic text-xs border border-dashed border-slate-300 rounded">
                    Tiada foto dimuat naik untuk aktiviti ini. (Sila kemaskini untuk paparan foto OPR)
                  </div>
                )}
              </div>
            </div>

            {/* 6. RUANGAN TANDATANGAN & PENGESAHAN RASMI */}
            <div className="mt-4 pt-4 border-t-2 border-slate-800 text-[11px]">
              <div className="grid grid-cols-2 gap-8">
                {/* Disediakan Oleh */}
                <div>
                  <p className="text-slate-600 uppercase font-semibold text-[10px]">Disediakan oleh:</p>
                  <div className="h-10"></div>
                  <p className="font-bold uppercase text-slate-900 border-b border-slate-400 pb-0.5 inline-block min-w-[180px]">
                    ({record.namaPelapor || 'Puan Noraini binti Yusof'})
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {record.jawatanPelapor || `Guru Penyelaras ${record.namaUnit}`}
                  </p>
                  <p className="text-[9px] text-slate-500">Tarikh: {formatTarikhMY(record.tarikh)}</p>
                </div>

                {/* Disahkan Oleh */}
                <div>
                  <p className="text-slate-600 uppercase font-semibold text-[10px]">Disemak / Disahkan oleh:</p>
                  <div className="h-10"></div>
                  <p className="font-bold uppercase text-slate-900 border-b border-slate-400 pb-0.5 inline-block min-w-[180px]">
                    (HJ. RAZALI BIN MAHMUD)
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Penolong Kanan Kokurikulum, SMK Madai
                  </p>
                  <p className="text-[9px] text-slate-500">Tarikh Pengesahan: 2026-09-21</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
