import React from 'react';
import { AlertCircle, Clock, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { RekodKokurikulum } from '../types';

interface NotificationBannerProps {
  records: RekodKokurikulum[];
  onEditRecord: (record: RekodKokurikulum) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  records,
  onEditRecord,
}) => {
  const [dismissed, setDismissed] = React.useState(false);

  // Cari rekod yang belum lengkap atau perlu kemaskini
  const pendingRecords = records.filter(
    (r) => r.status === 'Perlu Kemaskini' || r.status === 'Draf' || r.gambar.length === 0
  );

  if (dismissed || pendingRecords.length === 0) {
    return null;
  }

  const primaryPending = pendingRecords[0];

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 bg-amber-50 p-4 mb-6 rounded-r-xl shadow-xs no-print">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-amber-900">
                Peringatan Automatik Kokurikulum
              </h4>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                {pendingRecords.length} Laporan Perlu Tindakan
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-1">
              Aktiviti <strong className="font-semibold">{primaryPending.tajukAktiviti}</strong> ({primaryPending.namaUnit}) telah selesai tetapi belum lengkap. Sila kemaskini pencapaian dan muat naik gambar aktiviti untuk jana OPR.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEditRecord(primaryPending)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Kemaskini Laporan Sekarang</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              {pendingRecords.length > 1 && (
                <span className="text-xs text-amber-700">
                  +{pendingRecords.length - 1} rekod lain menanti tindakan
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-800 p-1 rounded-md transition-colors"
          title="Tutup peringatan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
