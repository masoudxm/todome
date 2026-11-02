import React, { useState } from 'react';
import {
  Bell,
  Check,
  Database,
  Moon,
  RefreshCw,
  Settings,
  Shield,
  Sun,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import { sound } from '../lib/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onResetData: () => void;
  onResetToEmpty: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onToggleTheme,
  onResetData,
  onResetToEmpty,
}) => {
  if (!isOpen) return null;

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const handleTestSound = () => {
    sound.playAlarmChime();
  };

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setBrowserNotifEnabled(permission === 'granted');
      if (permission === 'granted') {
        new Notification('RCG Marketing Hub', {
          body: 'اعلان‌های سیستمی و هشدارهای سررسید با موفقیت فعال شد.',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-right overflow-hidden relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            تنظیمات سامانه مدیریت وظایف RCG
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-4">
          {/* Theme setting */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                پوسته نمایشی سامانه (تم)
              </span>
              <span className="text-[11px] text-slate-400">
                انتخاب بین حالت دارک و لایت برای راحتی چشم
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:border-blue-500 transition"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>روشن</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-500" />
                  <span>تاریک</span>
                </>
              )}
            </button>
          </div>

          {/* Sound & Alarm Chime */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                صدای هشدار و اعلان‌ها
              </span>
              <span className="text-[11px] text-slate-400">
                پخش صدای آلارم هنگام رسیدن زمان مقرر تسک‌ها
              </span>
            </div>
            <button
              type="button"
              onClick={handleTestSound}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 shadow-2xs hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
              title="تست صدای زنگ هشدار"
            >
              <Volume2 className="w-4 h-4" />
              <span>تست صدا</span>
            </button>
          </div>

          {/* Browser Notification */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                اعلان‌های مرورگر (Browser Push)
              </span>
              <span className="text-[11px] text-slate-400">
                دریافت اعلان هشدار حتی هنگام بستن پنجره
              </span>
            </div>
            {browserNotifEnabled ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                فعال است
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestNotification}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                فعال‌سازی
              </button>
            )}
          </div>

          {/* Cloud Database & Storage info */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                پایگاه داده ابری و ذخیره‌سازی پایدار
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              تمامی وظایف، نظرات و فایل‌ها در دیتابیس ابری Firestore متصل به پروژه RCG ذخیره شده و همزمان به صورت کش محلی برای دسترسی آفلاین نگهداری می‌شوند.
            </p>
          </div>

          {/* Reset Options */}
          <div className="space-y-2.5">
            {/* Clear All Data - Empty Board (بدون وظایف) */}
            <div className="flex items-center justify-between p-3.5 bg-rose-50/80 dark:bg-rose-950/30 rounded-2xl border-2 border-rose-300 dark:border-rose-900/60 shadow-xs">
              <div>
                <span className="text-xs font-black text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  حذف تمام اطلاعات و بازنشانی بدون وظایف (تخته خام)
                </span>
                <span className="text-[11px] text-rose-700/80 dark:text-rose-300 mt-0.5 block">
                  پاکسازی کامل وظایف، کامنت‌ها و گزارش‌ها برای شروع صفر از ابتدا
                </span>
              </div>
              <button
                type="button"
                onClick={onResetToEmpty}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
                title="پاکسازی کامل تمام اطلاعات و شروع با تخته خالی"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>پاکسازی کامل</span>
              </button>
            </div>

            {/* Restore Sample Demo Tasks */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  بازگرداندن وظایف و داده‌های نمونه اولیه
                </span>
                <span className="text-[11px] text-slate-400">
                  بازیابی ۶ وظیفه آزمایشی مارکتینگ RCG برای تست امکانات
                </span>
              </div>
              <button
                type="button"
                onClick={onResetData}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition shadow-2xs shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>داده‌های نمونه</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
