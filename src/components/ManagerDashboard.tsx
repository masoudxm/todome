import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
  Filter,
  Flame,
  MessageSquare,
  PieChart,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { Task, UserProfile } from '../types';
import { CATEGORIES, PRIORITIES, TEAM_MEMBERS } from '../lib/constants';
import { formatJalaliDate, getCurrentJalaliDate, toPersianDigits } from '../lib/jalali';

interface ManagerDashboardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenTaskComments: (task: Task) => void;
  onNavigateToReports?: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  tasks,
  onSelectTask,
  onOpenTaskComments,
  onNavigateToReports,
}) => {
  // Multi-Filter State
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const today = getCurrentJalaliDate();
  const formattedToday = formatJalaliDate(today);

  // Filter Tasks based on filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Member filter
      if (selectedMemberId !== 'all' && t.assigneeId !== selectedMemberId) return false;
      // Status filter
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      // Time range filter (heuristic based on Jalali due date)
      if (selectedTimeRange === 'today' && t.jalaliDueDate !== formattedToday) return false;
      return true;
    });
  }, [tasks, selectedMemberId, selectedStatus, selectedTimeRange, formattedToday]);

  // Overall Status Calculations
  const inProgressCount = filteredTasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = filteredTasks.filter((t) => t.status === 'completed').length;
  const reviewCount = filteredTasks.filter((t) => t.status === 'review').length;
  const todoCount = filteredTasks.filter((t) => t.status === 'todo').length;

  const totalFiltered = filteredTasks.length;
  const overallEfficiency = totalFiltered > 0 ? Math.round((completedCount / totalFiltered) * 100) : 0;

  // High Priority & Critical Tasks (Core Requirement!)
  const highPriorityTasks = useMemo(() => {
    return tasks.filter(
      (t) => (t.priority === 'critical' || t.priority === 'high') && t.status !== 'completed'
    );
  }, [tasks]);

  // Team Productivity Calculations
  const memberProductivity = useMemo(() => {
    return TEAM_MEMBERS.map((member) => {
      const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
      const done = memberTasks.filter((t) => t.status === 'completed').length;
      const active = memberTasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length;
      const todo = memberTasks.filter((t) => t.status === 'todo').length;
      const rate = memberTasks.length > 0 ? Math.round((done / memberTasks.length) * 100) : 0;
      const totalHours = memberTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

      return {
        member,
        total: memberTasks.length,
        done,
        active,
        todo,
        rate,
        totalHours,
      };
    });
  }, [tasks]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-blue-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                داشبورد پایش عملکرد و بهره‌وری تیم مارکتینگ RCG
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mb-1">
              مرکز نظارت و مدیریت کلان وظایف دیجیتال مارکتینگ
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              تحلیل برخط وضعیت وظایف جاری، بازدهی اعضای تیم تبلیغات، پایش کارهای با اولویت بالا و دریافت گزارش‌های دوره‌ای.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl self-stretch md:self-auto justify-around">
            <div className="text-center px-3">
              <span className="text-[10px] text-blue-200 block mb-0.5">میانگین بازدهی تیم</span>
              <span className="text-2xl font-black text-emerald-400">{toPersianDigits(overallEfficiency)}%</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-3">
              <span className="text-[10px] text-amber-200 block mb-0.5">وظایف با اولویت بالا</span>
              <span className="text-2xl font-black text-amber-400">{toPersianDigits(highPriorityTasks.length)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Filter Bar (Core Requirement!) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-blue-500" />
          <span>فیلترهای مدیریتی:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full sm:w-auto flex-1 max-w-2xl justify-end">
          {/* Member Filter */}
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="all">همه اعضای تیم ({toPersianDigits(TEAM_MEMBERS.length)})</option>
            {TEAM_MEMBERS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.title.split(' ')[0]})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="in_progress">در حال انجام</option>
            <option value="review">معلق / در انتظار تایید</option>
            <option value="completed">تکمیل شده</option>
            <option value="todo">برای انجام</option>
          </select>

          {/* Time Range Filter */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="all">همه بازه‌های زمانی</option>
            <option value="today">امروز</option>
            <option value="week">این هفته</option>
            <option value="month">این ماه</option>
          </select>
        </div>
      </div>

      {/* 1. نمایش کلی وضعیت وظایف (در حال انجام، تکمیل شده، معلق، برای انجام) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* In Progress */}
        <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">وظایف در حال انجام</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {toPersianDigits(inProgressCount)}
            </span>
            <span className="text-xs text-blue-500 font-semibold">جاری در تیم</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">تکمیل شده با موفقیت</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {toPersianDigits(completedCount)}
            </span>
            <span className="text-xs text-emerald-500 font-semibold">تحویل نهایی</span>
          </div>
        </div>

        {/* Review / Suspended / Pending */}
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">معلق / در انتظار تایید</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {toPersianDigits(reviewCount)}
            </span>
            <span className="text-xs text-amber-600 font-semibold">نیازمند بررسی</span>
          </div>
        </div>

        {/* To Do */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">در صف شروع (برای انجام)</span>
            <div className="p-2.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {toPersianDigits(todoCount)}
            </span>
            <span className="text-xs text-slate-400 font-medium">برنامه‌ریزی شده</span>
          </div>
        </div>
      </div>

      {/* 2. بخش وظایف با اولویت بالا (High Priority & Critical Tasks Section) */}
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-950/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                وظایف با اولویت بالا و بحرانی (High Priority)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                موارد نیازمند توجه فوری مدیریت و اقدامات ضرب‌الاجل تیم
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {toPersianDigits(highPriorityTasks.length)} کار حیاتی
          </span>
        </div>

        {highPriorityTasks.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            در حال حاضر هیچ وظیفه بحرانی تکمیل‌نشده‌ای در سیستم وجود ندارد.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highPriorityTasks.map((task) => {
              const cat = CATEGORIES.find((c) => c.key === task.category);
              const pri = PRIORITIES[task.priority];

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex flex-col justify-between space-y-3 hover:border-rose-400 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: cat?.colorHex }}
                      >
                        {cat?.label}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${pri.bgClass} ${pri.textClass}`}>
                        {pri.label}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>مسئول: <b>{task.assigneeName}</b></span>
                      <span>•</span>
                      <span>ددلاین: {toPersianDigits(task.jalaliDueDate)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenTaskComments(task)}
                        className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-lg transition"
                        title="ثبت نظر یا دستور فوری"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectTask(task)}
                        className="p-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition hover:text-blue-600"
                        title="مشاهده جزئیات"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. نمودار و جدول بازدهی اعضای تیم (Team Productivity & Performance Chart) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                نمودار بازدهی و عملکرد اعضای تیم
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مقایسه درصد پیشرفت، ساعات ثبت شده و تعداد کارهای تکمیل شده هر کارشناس
              </p>
            </div>
          </div>
        </div>

        {/* Visual Performance Progress Bars */}
        <div className="space-y-4">
          {memberProductivity.map(({ member, total, done, active, todo, rate, totalHours }) => (
            <div
              key={member.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-300 dark:border-slate-700"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {member.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">{member.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {toPersianDigits(active)} در حال انجام
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {toPersianDigits(done)} تکمیل شده
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {toPersianDigits(totalHours)} ساعت
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {toPersianDigits(rate)}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${rate}%` }}
                  title={`تکمیل شده: ${rate}%`}
                />
                <div
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (active / total) * 100 : 0}%` }}
                  title={`در حال انجام`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. گزارش‌های دوره‌ای قابل تنظیم (Configurable Periodic Reports Widget) */}
      <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-slate-900/10 border border-emerald-200 dark:border-emerald-900/40 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60 dark:border-emerald-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                گزارش‌های دوره‌ای قابل تنظیم برای مدیریت
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تولید سریع گزارش‌های روزانه، هفتگی و ماهانه با قابلیت ارسال مستقیم به Google Sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setReportPeriod(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  reportPeriod === p
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {p === 'daily' ? 'روزانه' : p === 'weekly' ? 'هفتگی' : 'ماهانه'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 block mb-1">دوره انتخاب‌شده</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {reportPeriod === 'daily'
                ? 'گزارش روزانه امروز'
                : reportPeriod === 'weekly'
                ? 'گزارش هفتگی واحد مارکتینگ'
                : 'گزارش ماهانه عملکرد کمپین‌ها'}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 block mb-1">شاخص‌های تجمیعی این دوره</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {toPersianDigits(completedCount)} وظیفه تکمیل شده ({toPersianDigits(overallEfficiency)}%)
            </span>
          </div>

          <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            {onNavigateToReports && (
              <button
                type="button"
                onClick={onNavigateToReports}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <span>مشاهده و صدور شیت دوره</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
