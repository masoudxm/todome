import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Clock, Volume2, X } from 'lucide-react';
import { Task } from '../types';
import { toPersianDigits } from '../lib/jalali';

interface ReminderNotificationProps {
  activeAlarm: Task | null;
  onDismiss: () => void;
  onOpenTask: (task: Task) => void;
}

export const ReminderNotification: React.FC<ReminderNotificationProps> = ({
  activeAlarm,
  onDismiss,
  onOpenTask,
}) => {
  if (!activeAlarm) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 left-6 z-50 max-w-sm w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="p-3 bg-amber-500 text-white rounded-2xl animate-bounce shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] font-black uppercase text-amber-400 dark:text-amber-600 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                هشدار سررسید مارکتینگ
              </span>
              <button
                type="button"
                onClick={onDismiss}
                className="text-slate-400 hover:text-white dark:hover:text-slate-800 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h4 className="text-sm font-bold truncate mb-1">{activeAlarm.title}</h4>
            <p className="text-xs text-slate-300 dark:text-slate-600 mb-3 line-clamp-1">
              مسئول: {activeAlarm.assigneeName} • سررسید: {toPersianDigits(activeAlarm.jalaliDueDate)}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onOpenTask(activeAlarm);
                  onDismiss();
                }}
                className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white dark:text-slate-950 font-bold text-xs rounded-xl transition text-center shadow-xs"
              >
                مشاهده وظیفه
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="py-1.5 px-3 bg-white/10 dark:bg-slate-200 hover:bg-white/20 dark:hover:bg-slate-300 text-xs font-semibold rounded-xl transition"
              >
                بستن هشدار
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
