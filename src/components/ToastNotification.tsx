import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Crown,
  Info,
  Sparkles,
  X,
} from 'lucide-react';
import { toPersianDigits } from '../lib/jalali';

export interface SystemAlert {
  id: string;
  type: 'success' | 'info' | 'warning' | 'alert' | 'ceo';
  title: string;
  message: string;
  jalaliTime: string;
  taskId?: string;
}

interface ToastNotificationProps {
  alerts: SystemAlert[];
  onDismiss: (id: string) => void;
  onSelectTask?: (taskId: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  alerts,
  onDismiss,
  onSelectTask,
}) => {
  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {alerts.slice(0, 3).map((alert) => (
          <ToastItem
            key={alert.id}
            alert={alert}
            onDismiss={() => onDismiss(alert.id)}
            onSelectTask={onSelectTask}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  alert: SystemAlert;
  onDismiss: () => void;
  onSelectTask?: (taskId: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ alert, onDismiss, onSelectTask }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isCeo = alert.type === 'ceo';
  const isSuccess = alert.type === 'success';
  const isWarning = alert.type === 'warning' || alert.type === 'alert';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      className={`pointer-events-auto rounded-2xl p-4 shadow-xl border text-right backdrop-blur-md transition-all ${
        isCeo
          ? 'bg-linear-to-r from-amber-900/95 via-yellow-950/90 to-slate-900/95 text-white border-amber-400/80 ring-2 ring-amber-400/40 shadow-amber-500/20'
          : isSuccess
          ? 'bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 border-emerald-500/80 shadow-emerald-500/10'
          : isWarning
          ? 'bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 border-amber-400/80 shadow-amber-500/10'
          : 'bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 border-blue-500/80 shadow-blue-500/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
            isCeo
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
              : isSuccess
              ? 'bg-emerald-500 text-white'
              : isWarning
              ? 'bg-amber-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          {isCeo ? (
            <Crown className="w-4 h-4" />
          ) : isSuccess ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : isWarning ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <h4
              className={`text-xs font-black truncate flex items-center gap-1.5 ${
                isCeo ? 'text-amber-300' : 'text-slate-100 dark:text-slate-900'
              }`}
            >
              {isCeo && <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
              <span>{alert.title}</span>
            </h4>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] opacity-60">
                {toPersianDigits(alert.jalaliTime)}
              </span>
              <button
                type="button"
                onClick={onDismiss}
                className="opacity-60 hover:opacity-100 transition p-0.5 rounded cursor-pointer"
                title="بستن هشدار"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed opacity-90 line-clamp-2">
            {alert.message}
          </p>

          {alert.taskId && onSelectTask && (
            <button
              type="button"
              onClick={() => {
                onSelectTask(alert.taskId!);
                onDismiss();
              }}
              className="mt-2 text-[10px] font-bold text-amber-400 dark:text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>مشاهده و بررسی وظیفه مرتبط &larr;</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
