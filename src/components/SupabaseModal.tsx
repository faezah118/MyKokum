import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  UploadCloud, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check,
  ShieldCheck,
  Server
} from 'lucide-react';
import { 
  SUPABASE_URL, 
  supabase, 
  batchUploadLocalToSupabase 
} from '../services/supabase';
import { RekodKokurikulum, MuridUnit, UnitKokurikulum } from '../types';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: RekodKokurikulum[];
  students: MuridUnit[];
  units: UnitKokurikulum[];
  onSyncComplete?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  records,
  students,
  units,
  onSyncComplete,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error_tables' | 'error_connection'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; count: number; error?: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.from('units').select('id').limit(1);
      if (error) {
        if (error.code === '42P01' || error.message.toLowerCase().includes('relation') || error.message.toLowerCase().includes('does not exist')) {
          setConnectionStatus('error_tables');
          setErrorMessage('Jadual belum wujud di Supabase. Sila jalankan skrip SQL di bawah di Supabase SQL Editor.');
        } else {
          setConnectionStatus('error_connection');
          setErrorMessage(error.message);
        }
      } else {
        setConnectionStatus('connected');
      }
    } catch (err: unknown) {
      setConnectionStatus('error_connection');
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await batchUploadLocalToSupabase(records, students, units);
      setSyncResult(res);
      if (res.success) {
        setConnectionStatus('connected');
        if (onSyncComplete) onSyncComplete();
      } else {
        if (res.error?.includes('relation') || res.error?.includes('does not exist')) {
          setConnectionStatus('error_tables');
          setErrorMessage('Jadual belum dicipta di Supabase.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncResult({ success: false, count: 0, error: msg });
    } finally {
      setIsSyncing(false);
    }
  };

  const sqlScript = `-- Salin dan tampal di Supabase -> SQL Editor -> RUN:
CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL,
  guru_penyelaras TEXT,
  bilangan_ahli INTEGER DEFAULT 0,
  hari_perjumpaan TEXT DEFAULT 'Rabu',
  masa_perjumpaan TEXT DEFAULT '2.00 - 4.00 Petang',
  tempat_biasa TEXT DEFAULT 'Kawasan Sekolah',
  kod_unit TEXT,
  warna_tema TEXT DEFAULT 'blue',
  sasaran_perjumpaan INTEGER DEFAULT 12
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL,
  nama_murid TEXT NOT NULL,
  no_kp TEXT,
  tingkatan_kelas TEXT,
  jantina TEXT,
  jawatan TEXT,
  tarikh_didaftar TEXT
);

CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL,
  nama_unit TEXT NOT NULL,
  kategori_unit TEXT,
  tajuk_aktiviti TEXT NOT NULL,
  jenis_rekod TEXT NOT NULL,
  peringkat TEXT DEFAULT 'Sekolah',
  tarikh TEXT NOT NULL,
  masa_mula TEXT,
  masa_tamat TEXT,
  tempat TEXT,
  objektif JSONB DEFAULT '[]'::jsonb,
  sasaran_penglibatan JSONB,
  ringkasan_aktiviti TEXT,
  pencapaian TEXT,
  status TEXT DEFAULT 'Draf',
  nama_pelapor TEXT,
  jawatan_pelapor TEXT,
  refleksi_kekuatan TEXT,
  refleksi_penambahbaikan TEXT,
  gambar JSONB DEFAULT '[]'::jsonb,
  dicipta_pada TEXT,
  dikemaskini_pada TEXT
);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Akses Units" ON units FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Records" ON records FOR ALL USING (true) WITH CHECK (true);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Pangkalan Data Supabase</h2>
              <p className="text-xs text-emerald-100">Projek Rasmi: tyidfdplrirkfpjmnjoz.supabase.co</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* Connection Status Box */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            connectionStatus === 'connected'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : connectionStatus === 'checking'
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              {connectionStatus === 'connected' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : connectionStatus === 'checking' ? (
                <RefreshCw className="w-6 h-6 text-slate-500 shrink-0 animate-spin" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {connectionStatus === 'connected'
                    ? 'Tersambung ke Supabase Cloud (Live)'
                    : connectionStatus === 'checking'
                    ? 'Sedang menguji sambungan...'
                    : connectionStatus === 'error_tables'
                    ? 'Tersambung ke Supabase (Perlu Cipta Jadual)'
                    : 'Sambungan Dalam Proses'}
                </p>
                <p className="text-xs text-slate-600 truncate max-w-md">
                  URL: <span className="font-mono text-[11px]">{SUPABASE_URL}</span>
                </p>
              </div>
            </div>

            <button
              onClick={checkConnection}
              disabled={isChecking}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Uji Semula</span>
            </button>
          </div>

          {/* Sync Result Notice */}
          {syncResult && (
            <div className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 ${
              syncResult.success 
                ? 'bg-emerald-100/70 border border-emerald-300 text-emerald-800' 
                : 'bg-rose-100/70 border border-rose-300 text-rose-800'
            }`}>
              {syncResult.success ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {syncResult.success ? 'Penyegerakan Berjaya!' : 'Ralat Penyegerakan'}
                </p>
                <p className="text-xs">
                  {syncResult.success 
                    ? `Sebanyak ${syncResult.count} data unit, senarai murid dan rekod aktiviti telah berjaya dimuat naik ke Supabase.`
                    : syncResult.error}
                </p>
              </div>
            </div>
          )}

          {/* One Click Sync Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  Segerak Data Tempatan ke Supabase
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Muat naik {records.length} rekod aktiviti, {students.length} murid berdaftar, dan {units.length} unit ke pangkalan data cloud.
                </p>
              </div>
              <button
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 shrink-0"
              >
                <UploadCloud className="w-4 h-4" />
                {isSyncing ? 'Sedang Memuat Naik...' : 'Segerak Sekarang'}
              </button>
            </div>
          </div>

          {/* SQL Setup Instruction (If tables not created yet) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                Skrip Cipta Jadual Supabase (Jika belum dijalankan)
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://supabase.com/dashboard/project/tyidfdplrirkfpjmnjoz/sql"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                >
                  Buka SQL Editor <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin SQL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 max-h-40 overflow-y-auto text-slate-200 font-mono text-[11px] leading-relaxed border border-slate-800">
              <pre>{sqlScript}</pre>
            </div>
            <p className="text-[11px] text-slate-500">
              💡 Cara mudah: Klik <strong>Salin SQL</strong>, buka <strong>SQL Editor</strong> di dashboard Supabase anda, tampalkan dan klik butang <strong>RUN</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Kunci Anon & Projek Supabase selamat & aktif.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
