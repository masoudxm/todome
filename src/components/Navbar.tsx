import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  Calendar,
  Filter,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority, UserProfile } from '../types';
import { CATEGORIES, PRIORITIES, TEAM_MEMBERS } from '../lib/constants';
import {
  formatJalaliDate,
  getCurrentJalaliDate,
  JALALI_WEEKDAYS,
  toPersianDigits,
} from '../lib/jalali';
import {
  isNotificationSupported,
  requestNotificationPermission,
} from '../lib/notifications';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: TaskCategory | 'all';
  onCategoryChange: (cat: TaskCategory | 'all') => void;
  selectedPriority: TaskPriority | 'all';
  onPriorityChange: (pri: TaskPriority | 'all') => void;
  selectedAssignee: string | 'all';
  onAssigneeChange: (userId: string | 'all') => void;
  onOpenNewTaskModal: () => void;
  upcomingReminders: Task[];
  onSelectTask: (task: Task) => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  selectedAssignee,
  onAssigneeChange,
  onOpenNewTaskModal,
  upcomingReminders,
  onSelectTask,
  onOpenMobileMenu,
}) => {
  const [showRemindersPopover, setShowRemindersPopover] = useState(false);
  const [showFilterPills, setShowFilterPills] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const today = getCurrentJalaliDate();
  const formattedToday = formatJalaliDate(today, { format: 'long' });

  const hasActiveFilters =
    selectedCategory !== 'all' || selectedPriority !== 'all' || selectedAssignee !== 'all';

  const handleClearFilters = () => {
    onCategoryChange('all');
    onPriorityChange('all');
    onAssigneeChange('all');
    onSearchChange('');
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotifPermission('granted');
      new Notification('اعلان‌های ددلاین RCG فعال شد', {
        body: 'از این پس یادآوری‌های روز و ساعت تسک‌ها به عنوان نوتیفیکیشن مرورگر برای شما ارسال خواهد شد.',
        dir: 'rtl',
      });
    } else {
      setNotifPermission('denied');
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Mobile Hamburger & Brand Icon */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="منوی اصلی"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-black text-slate-800 dark:text-white truncate">
            RCG Marketing
          </span>
        </div>

        {/* Date Badge & Search Input */}
        <div className="hidden sm:flex items-center gap-3 flex-1 max-w-md">
          {/* Today's Jalali Date Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold shrink-0">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>امروز: {formattedToday}</span>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجو در تسک‌ها، کمپین‌ها، بریف‌ها..."
              className="w-full text-xs pr-9 pl-8 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 transition focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 justify-end flex-1 sm:flex-initial">
          {/* Browser Notification Permission Button if not yet granted */}
          {isNotificationSupported() && notifPermission === 'default' && (
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-bold transition animate-pulse"
              title="فعال‌سازی نوتیفیکیشن مرورگر برای باخبر شدن از ددلاین‌ها"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-600" />
              <span>فعال‌سازی اعلان ددلاین</span>
            </button>
          )}

          {/* Search for Mobile (visible on < sm screens) */}
          <div className="relative sm:hidden flex-1 max-w-[170px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجو..."
              className="w-full text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Filter Pills Toggle */}
          <button
            type="button"
            onClick={() => setShowFilterPills(!showFilterPills)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 ${
              hasActiveFilters || showFilterPills
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300'
            }`}
            title="فیلترهای پیشرفته"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden md:inline">فیلترها</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          {/* Reminders / Alarms Bell Popover */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowRemindersPopover(!showRemindersPopover)}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="هشدارهای زمان‌بندی شده"
            >
              <Bell className="w-4 h-4" />
              {upcomingReminders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                  {toPersianDigits(upcomingReminders.length)}
                </span>
              )}
            </button>

            {showRemindersPopover && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 text-right animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                    هشدارهای فعال سررسید و کمپین‌ها
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowRemindersPopover(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {upcomingReminders.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      هیچ هشدار فعالی برای وظایف تنظیم نشده است.
                    </p>
                  ) : (
                    upcomingReminders.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          onSelectTask(task);
                          setShowRemindersPopover(false);
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-100 dark:border-slate-700/60 cursor-pointer transition"
                      >
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {task.title}
                        </h5>
                        <div className="flex items-center justify-between text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                          <span>زمان هشدار: {toPersianDigits(task.reminderDateTime || '')}</span>
                          <span>مسئول: {task.assigneeName}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Create Task Button (Desktop) */}
          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>وظیفه جدید</span>
          </button>
        </div>
      </div>

      {/* Expanded Filter Pills (when toggled) */}
      {showFilterPills && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-in fade-in">
          {/* Category filter */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">دسته‌بندی مارکتینگ:</label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as any)}
              className="w-full text-xs p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="all">همه حوزه‌ها</option>
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">اولویت:</label>
            <select
              value={selectedPriority}
              onChange={(e) => onPriorityChange(e.target.value as any)}
              className="w-full text-xs p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="all">همه اولویت‌ها</option>
              {Object.values(PRIORITIES).map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee filter */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">مسئول انجام:</label>
            <div className="flex items-center gap-1.5">
              <select
                value={selectedAssignee}
                onChange={(e) => onAssigneeChange(e.target.value)}
                className="w-full text-xs p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="all">همه کارشناسان</option>
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg whitespace-nowrap transition"
                  title="پاک کردن فیلترها"
                >
                  حذف فیلتر
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
