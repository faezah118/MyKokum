import React, { useState } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  X, 
  Save, 
  UploadCloud, 
  Key, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { 
  FirebaseConfig, 
  getStoredFirebaseConfig, 
  saveStoredFirebaseConfig, 
  isFirebaseConfigured,
  batchUploadLocalToFirestore 
} from '../services/firebase';
import { RekodKokurikulum, MuridUnit, UnitKokurikulum } from '../types';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: RekodKokurikulum[];
  students: MuridUnit[];
  units: UnitKokurikulum[];
  onSyncComplete?: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  onClose,
  records,
  students,
  units,
  onSyncComplete,
}) => {
  const [config, setConfig] = useState<FirebaseConfig>(() => {
    const existing = getStoredFirebaseConfig();
    return existing || {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    };
  });

  const [rawJsonInput, setRawJsonInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const isConnected = isFirebaseConfigured();

  const handlePasteConfig = (text: string) => {
    setRawJsonInput(text);
    try {
      // Cuba ekstrak JSON atau objek JS
      let cleaned = text.trim();
      if (cleaned.includes('const firebaseConfig =')) {
        cleaned = cleaned.replace(/const\s+firebaseConfig\s*=\s*/, '');
        cleaned = cleaned.replace(/;$/, '');
      }
      // Tukar objek JS tanpa petikan ke format JSON
      cleaned = cleaned
        .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
        .replace(/'/g, '"');

      const parsed = JSON.parse(cleaned);
      if (parsed.apiKey && parsed.projectId) {
        setConfig({
          apiKey: parsed.apiKey || '',
          authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
          projectId: parsed.projectId || '',
          storageBucket: parsed.storageBucket || '',
          messagingSenderId: parsed.messagingSenderId || '',
          appId: parsed.appId || '',
        });
        setStatusMessage({ type: 'success', text: 'Konfigurasi Firebase berjaya dikesan!' });
      }
    } catch {
      // Teruskan jika input separa
    }
  };

  const handleSave = () => {
    if (!config.apiKey.trim() || !config.projectId.trim()) {
      setStatusMessage({ type: 'error', text: 'Sila masukkan sekurang-kurangnya API Key dan Project ID.' });
      return;
    }

    saveStoredFirebaseConfig({
      ...config,
      authDomain: config.authDomain.trim() || `${config.projectId.trim()}.firebaseapp.com`,
    });

    setStatusMessage({ type: 'success', text: 'Konfigurasi Firebase disimpan. Menyegarkan sambungan...' });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleDisconnect = () => {
    saveStoredFirebaseConfig(null);
    setStatusMessage({ type: 'success', text: 'Firebase diputuskan sambungan. Sistem kembali ke Mod Tempatan (LocalStorage).' });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleBatchSync = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const res = await batchUploadLocalToFirestore(records, students, units);
      if (res.success) {
        setStatusMessage({ 
          type: 'success', 
          text: `Berjaya memuat naik ${res.count} data rekod, murid, dan unit ke Cloud Firestore!` 
        });
        if (onSyncComplete) onSyncComplete();
      } else {
        setStatusMessage({ 
          type: 'error', 
          text: res.error || 'Gagal memuat naik ke Cloud Firestore. Semak konfigurasi anda.' 
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage({ type: 'error', text: `Ralat segerak: ${msg}` });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Tetapan Firebase Cloud Firestore</h2>
              <p className="text-xs text-amber-100">Penyegerakan Data Awan & Sandaran Berpusat SMK Madai</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Status Badge */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isConnected 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CloudCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <CloudOff className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {isConnected ? 'Firebase Firestore Aktif & Disambungkan' : 'Mod Tempatan (Local Storage)'}
                </p>
                <p className="text-xs text-slate-600">
                  {isConnected 
                    ? `Data bersambung ke projek: ${config.projectId || 'Terkonfigurasi'}` 
                    : 'Aplikasi kini berfungsi dengan simpanan luar talian selamat.'}
                </p>
              </div>
            </div>
            {isConnected && (
              <button
                onClick={handleDisconnect}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
              >
                Putuskan
              </button>
            )}
          </div>

          {/* Status Notification */}
          {statusMessage && (
            <div className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-100/70 border border-emerald-300 text-emerald-800' 
                : 'bg-rose-100/70 border border-rose-300 text-rose-800'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Sync Button if Connected */}
          {isConnected && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Muat Naik Data Tempatan ke Cloud</h3>
                  <p className="text-xs text-slate-500">
                    {records.length} rekod perjumpaan, {students.length} murid berdaftar, dan {units.length} unit.
                  </p>
                </div>
                <button
                  onClick={handleBatchSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  {isSyncing ? 'Sedang Memuat Naik...' : 'Segerak ke Cloud Sekarang'}
                </button>
              </div>
            </div>
          )}

          {/* Manual Config Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                Maklumat Kredensial Firebase
              </h3>
              <a 
                href="https://console.firebase.google.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium"
              >
                Buka Firebase Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Quick Paste Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tampal Kod Konfigurasi Firebase (Pilihan Pantas):
              </label>
              <textarea
                rows={2}
                value={rawJsonInput}
                onChange={(e) => handlePasteConfig(e.target.value)}
                placeholder='Tampal objek firebaseConfig di sini (cth: const firebaseConfig = { apiKey: "...", projectId: "..." })'
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Project ID *</label>
                <input
                  type="text"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  placeholder="cth: mykokum-smk-madai"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">API Key *</label>
                <input
                  type="text"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="cth: AIzaSy..."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Auth Domain</label>
                <input
                  type="text"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  placeholder="cth: mykokum.firebaseapp.com"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">App ID</label>
                <input
                  type="text"
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  placeholder="cth: 1:123456789:web:abcdef"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-slate-700 space-y-2">
            <p className="font-bold text-amber-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              Langkah Menghubungkan Firebase (Percuma):
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
              <li>Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-700 font-medium underline">Firebase Console</a> dan klik <strong>Create a project</strong>.</li>
              <li>Pilih menu <strong>Build → Firestore Database</strong> dan klik <strong>Create database</strong> (Pilih lokasi cth: <em>asia-southeast1</em>).</li>
              <li>Di bahagian <strong>Project Overview (ikon Gear ⚙️) → Project settings</strong>, tambah aplikasi Web (ikon <code>&lt;/&gt;</code>) dan salin nilai <code>firebaseConfig</code> ke ruangan di atas.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            Data disandarkan secara automatik dalam kedua-dua mod.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              Simpan & Aktifkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
