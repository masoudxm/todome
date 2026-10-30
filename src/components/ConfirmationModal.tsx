import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'تایید و ادامه',
  cancelLabel = 'انصراف',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-right">
        <div className="flex items-start gap-3">
          <div
            className={`p-3 rounded-xl ${
              isDestructive
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                : 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
            }`}
          >
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-xs transition ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            }`}
          >
            <Check className="w-4 h-4" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
