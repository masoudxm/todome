import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Task } from '../types';
import {
  formatJalaliDate,
  getCurrentJalaliDate,
  getDaysInJalaliMonth,
  getJalaliFirstDayOfMonth,
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAYS,
  toEnglishDigits,
  toPersianDigits,
} from '../lib/jalali';
import { CATEGORIES, PRIORITIES } from '../lib/constants';

interface JalaliCalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onAddTaskForDate: (jalaliDateStr: string) => void;
}

export const JalaliCalendarView: React.FC<JalaliCalendarViewProps> = ({
  tasks,
  onSelectTask,
  onAddTaskForDate,
}) => {
  const today = getCurrentJalaliDate();
  const [currentYear, setCurrentYear] = useState(today.jy);
  const [currentMonth, setCurrentMonth] = useState(today.jm);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.jd);

  const daysInMonth = getDaysInJalaliMonth(currentYear, currentMonth);
  const firstDayOfWeek = getJalaliFirstDayOfMonth(currentYear, currentMonth); // 0 = Sat, 6 = Fri

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const handleGoToday = () => {
    setCurrentYear(today.jy);
    setCurrentMonth(today.jm);
    setSelectedDay(today.jd);
  };

  // Find tasks matching date
  const getTasksForDay = (day: number) => {
    const formattedTarget = `${currentYear}/${String(currentMonth).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    return tasks.filter((t) => {
      if (!t.jalaliDueDate) return false;
      const cleanDue = toEnglishDigits(t.jalaliDueDate);
      return cleanDue === formattedTarget;
    });
  };

  const selectedDateStr = selectedDay
    ? `${currentYear}/${String(currentMonth).padStart(2, '0')}/${String(selectedDay).padStart(2, '0')}`
    : null;

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{JALALI_MONTH_NAMES[currentMonth - 1]}</span>
              <span>{toPersianDigits(currentYear)}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              تقویم شمسی ددلاین‌های تبلیغات، انتشار محتوا و رویدادهای مارکتینگ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={handleGoToday}
            className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition"
          >
            برو به امروز
          </button>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition"
              title="ماه بعد"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition"
              title="ماه قبل"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          {/* Weekday Labels (Saturday to Friday) */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {JALALI_WEEKDAYS.map((wd) => (
              <div
                key={wd.key}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
              >
                {wd.name}
              </div>
            ))}
          </div>

          {/* Month Days Matrix */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset boxes for first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div
                key={`blank-${i}`}
                className="min-h-[75px] sm:min-h-[85px] bg-slate-50/40 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-100 dark:border-slate-800/50"
              />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday =
                currentYear === today.jy && currentMonth === today.jm && day === today.jd;
              const isSelected = selectedDay === day;
              const dayTasks = getTasksForDay(day);

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[75px] sm:min-h-[85px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20'
                      : isToday
                      ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                      : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-amber-500 text-white'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {toPersianDigits(day)}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {toPersianDigits(dayTasks.length)}
                      </span>
                    )}
                  </div>

                  {/* Task mini dots / badges */}
                  <div className="space-y-1 mt-1">
                    {dayTasks.slice(0, 2).map((t) => {
                      const cat = CATEGORIES.find((c) => c.key === t.category);
                      return (
                        <div
                          key={t.id}
                          className="text-[10px] font-medium truncate px-1.5 py-0.5 rounded-md text-white shadow-2xs"
                          style={{ backgroundColor: cat?.colorHex || '#3b82f6' }}
                        >
                          {t.title}
                        </div>
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-slate-400 text-center">
                        +{toPersianDigits(dayTasks.length - 2)} مورد دیگر
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Drawer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  برنامه‌های {selectedDay ? `${toPersianDigits(selectedDay)} ${JALALI_MONTH_NAMES[currentMonth - 1]}` : 'روز انتخابی'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {toPersianDigits(selectedDayTasks.length)} وظیفه یا رویداد مارکتینگ در این روز
                </p>
              </div>

              {selectedDateStr && (
                <button
                  type="button"
                  onClick={() => onAddTaskForDate(selectedDateStr)}
                  className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 hover:bg-blue-100 rounded-xl transition"
                  title="افزودن تسک برای این تاریخ"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* List of Tasks for Selected Date */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {selectedDayTasks.length === 0 ? (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">هیچ ددلاینی برای این روز ثبت نشده است.</p>
                  {selectedDateStr && (
                    <button
                      type="button"
                      onClick={() => onAddTaskForDate(selectedDateStr)}
                      className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      + افزودن برنامه یا وظیفه برای این روز
                    </button>
                  )}
                </div>
              ) : (
                selectedDayTasks.map((t) => {
                  const cat = CATEGORIES.find((c) => c.key === t.category);
                  const pri = PRIORITIES[t.priority];
                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl hover:border-blue-500 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: cat?.colorHex }}
                        >
                          {cat?.label}
                        </span>
                        <span className={`text-[10px] font-semibold ${pri.textClass}`}>
                          {pri.label}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                        {t.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <span>مسئول: {t.assigneeName}</span>
                        <span>پیشرفت: {toPersianDigits(t.progress)}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {selectedDateStr && (
            <button
              type="button"
              onClick={() => onAddTaskForDate(selectedDateStr)}
              className="mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              افزودن وظیفه جدید برای {toPersianDigits(selectedDay || 1)} {JALALI_MONTH_NAMES[currentMonth - 1]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
