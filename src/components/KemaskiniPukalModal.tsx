import React, { useState } from 'react';
import { CheckSquare, Square, Check, X, Layers, AlertCircle } from 'lucide-react';
import { RekodKokurikulum, StatusLaporan } from '../types';

interface KemaskiniPukalModalProps {
  records: RekodKokurikulum[];
  onBulkUpdate: (recordIds: string[], status: StatusLaporan) => void;
  onClose: () => void;
}

export const KemaskiniPukalModal: React.FC<KemaskiniPukalModalProps> = ({
  records,
  onBulkUpdate,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetStatus, setTargetStatus] = useState<StatusLaporan>('Selesai');
  const [filterUnit, setFilterUnit] = useState<string>('SEMUA');

  const filteredRecords = filterUnit === 'SEMUA'
    ? records
    : records.filter((r) => r.namaUnit === filterUnit);

  const uniqueUnits = Array.from(new Set(records.map((r) => r.namaUnit)));

  const handleToggleRecord = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  const handleApply = () => {
    if (selectedIds.length === 0) return;
    onBulkUpdate(selectedIds, targetStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Kemaskini Pukal Rekod Kokurikulum</h3>
              <p className="text-xs text-slate-400">
                Pilih berbilang laporan aktiviti dan kemaskini status pengesahan dalam satu klik
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              {selectedIds.length === filteredRecords.length && filteredRecords.length > 0 ? (
                <>
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>Nyahpilih Semua</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-slate-400" />
                  <span>Pilih Semua ({filteredRecords.length})</span>
                </>
              )}
            </button>

            <span className="text-slate-600">
              <strong className="text-slate-900">{selectedIds.length}</strong> rekod dipilih
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Tapis Unit:</label>
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
            >
              <option value="SEMUA">Semua Unit</option>
              {uniqueUnits.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Record Checklist */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Tiada rekod dijumpai untuk kriteria ini.
            </div>
          ) : (
            filteredRecords.map((r) => {
              const isSelected = selectedIds.includes(r.id);
              return (
                <div
                  key={r.id}
                  onClick={() => handleToggleRecord(r.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600 shrink-0">
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{r.tajukAktiviti}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-blue-800">{r.namaUnit}</span>
                        <span>•</span>
                        <span>{r.tarikh}</span>
                        <span>•</span>
                        <span>Kehadiran: {r.sasaranPenglibatan.peratusKehadiran}%</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'Perlu Kemaskini'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <span className="font-bold text-slate-700">Tukar Status Kepada:</span>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as StatusLaporan)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs text-slate-800"
            >
              <option value="Selesai">Selesai (Disahkan)</option>
              <option value="Perlu Kemaskini">Perlu Kemaskini</option>
              <option value="Draf">Draf</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleApply}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all ${
                selectedIds.length === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Kemaskini {selectedIds.length} Rekod Sekarang</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
