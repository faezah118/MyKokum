import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Sahkan',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 text-center space-y-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ring-8 ${
            confirmVariant === 'danger' 
              ? 'bg-rose-100 text-rose-600 ring-rose-50' 
              : 'bg-blue-100 text-blue-600 ring-blue-50'
          }`}>
            {confirmVariant === 'danger' ? (
              <AlertCircle className="w-7 h-7" />
            ) : (
              <RefreshCw className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">
              {title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all ${
                confirmVariant === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
