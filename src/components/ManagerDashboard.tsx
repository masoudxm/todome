import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  Award,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Coins,
  Crown,
  Eye,
  FileSpreadsheet,
  Filter,
  Flame,
  GitBranch,
  Layers,
  MessageSquare,
  PieChart,
  Send,
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
  onAddDirectComment?: (taskId: string, commentText: string) => void;
  onOpenTeamModal?: () => void;
  currentUser?: UserProfile;
  teamMembers?: UserProfile[];
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  tasks,
  onSelectTask,
  onOpenTaskComments,
  onNavigateToReports,
  onAddDirectComment,
  onOpenTeamModal,
  currentUser,
  teamMembers = TEAM_MEMBERS,
}) => {
  // Multi-Filter State
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);

  // Direct Inline Feedback States
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [sentFeedbackSuccess, setSentFeedbackSuccess] = useState<Record<string, boolean>>({});
  const [expandedTaskFeedback, setExpandedTaskFeedback] = useState<Record<string, boolean>>({});

  const handleSendFeedback = (taskId: string) => {
    const text = feedbackInputs[taskId]?.trim();
    if (!text || !onAddDirectComment) return;
    onAddDirectComment(taskId, text);
    setFeedbackInputs((prev) => ({ ...prev, [taskId]: '' }));
    setSentFeedbackSuccess((prev) => ({ ...prev, [taskId]: true }));
    setTimeout(() => {
      setSentFeedbackSuccess((prev) => ({ ...prev, [taskId]: false }));
    }, 2500);
  };

  const handleSelectQuickFeedback = (taskId: string, snippet: string) => {
    setFeedbackInputs((prev) => ({ ...prev, [taskId]: snippet }));
  };

  const toggleTaskFeedbackExpanded = (taskId: string) => {
    setExpandedTaskFeedback((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const today = getCurrentJalaliDate();
  const formattedToday = formatJalaliDate(today);

  // Blocked Tasks Calculation
  const blockedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.dependencyTaskId || t.status === 'completed') return false;
      const dep = tasks.find((d) => d.id === t.dependencyTaskId);
      return dep && dep.status !== 'completed';
    });
  }, [tasks]);

  // Marketing Budget Calculation
  const totalBudgetToman = useMemo(() => {
    return tasks.reduce((sum, t) => sum + (t.budgetToman || 0), 0);
  }, [tasks]);

  // Filter Tasks based on filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (showBlockedOnly) {
        if (!t.dependencyTaskId || t.status === 'completed') return false;
        const dep = tasks.find((d) => d.id === t.dependencyTaskId);
        if (!dep || dep.status === 'completed') return false;
      }
      // Member filter
      if (selectedMemberId !== 'all' && t.assigneeId !== selectedMemberId) return false;
      // Status filter
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      // Time range filter
      if (selectedTimeRange === 'today' && t.jalaliDueDate !== formattedToday) return false;
      return true;
    });
  }, [tasks, selectedMemberId, selectedStatus, selectedTimeRange, formattedToday, showBlockedOnly]);

  // Overall Status Calculations
  const inProgressCount = filteredTasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = filteredTasks.filter((t) => t.status === 'completed').length;
  const reviewCount = filteredTasks.filter((t) => t.status === 'review').length;
  const todoCount = filteredTasks.filter((t) => t.status === 'todo').length;

  const totalFiltered = filteredTasks.length;
  const overallEfficiency = totalFiltered > 0 ? Math.round((completedCount / totalFiltered) * 100) : 0;

  // High Priority & Critical Tasks
  const highPriorityTasks = useMemo(() => {
    return tasks.filter(
      (t) => (t.priority === 'critical' || t.priority === 'high') && t.status !== 'completed'
    );
  }, [tasks]);

  // Team Productivity Calculations
  const memberProductivity = useMemo(() => {
    return teamMembers.map((member) => {
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
  }, [tasks, teamMembers]);

  // Marketing Channels Progress & Trend Calculations
  const channelTrends = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const catTasks = tasks.filter((t) => t.category === cat.key);
      const done = catTasks.filter((t) => t.status === 'completed').length;
      const active = catTasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length;
      const todo = catTasks.filter((t) => t.status === 'todo').length;
      const budget = catTasks.reduce((sum, t) => sum + (t.budgetToman || 0), 0);
      const rate = catTasks.length > 0 ? Math.round((done / catTasks.length) * 100) : 0;

      return {
        cat,
        total: catTasks.length,
        done,
        active,
        todo,
        budget,
        rate,
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
              {currentUser?.role === 'ceo' ? (
                <span className="text-xs font-black bg-amber-500 text-slate-950 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                  <Crown className="w-4 h-4 text-slate-950" />
                  پنل نظارت عالیه مدیرعامل هلدینگ (CEO Executive Dashboard)
                </span>
              ) : (
                <span className="text-xs font-black bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  داشبورد پایش عملکرد و بهره‌وری تیم مارکتینگ RCG
                </span>
              )}
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

      {/* Executive CEO KPI Widget (Blocked, Budget, Approvals) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-slate-900/10 border-2 border-amber-300/80 dark:border-amber-700/60 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 rounded-xl shadow-xs">
              <Crown className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                دیده‌بان راهبردی مدیرعامل و مدیریت ارشد (Executive Intelligence)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                پایش گلوگاه‌ها، وظایف مسدود، بودجه‌های کلان و تاییدات نهایی
              </p>
            </div>
          </div>

          {blockedTasks.length > 0 && (
            <button
              type="button"
              onClick={() => setShowBlockedOnly(!showBlockedOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                showBlockedOnly
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{toPersianDigits(blockedTasks.length)} تسک مسدود (کلیک برای فیلتر)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Blocked Tasks */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                تسک‌های معطل پیش‌نیاز (Blocked)
              </span>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                {toPersianDigits(blockedTasks.length)} وظیفه
              </span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <GitBranch className="w-5 h-5" />
            </div>
          </div>

          {/* Total Budget */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                مجموع بودجه مصوب کمپین‌ها
              </span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                {toPersianDigits(Math.round(totalBudgetToman / 1_000_000))} میلیون تومان
              </span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          {/* Pending Approval */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                در انتظار تایید و بازبینی مدیر
              </span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                {toPersianDigits(reviewCount)} وظیفه
              </span>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Filter Bar */}
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
            <option value="all">همه اعضای تیم ({toPersianDigits(teamMembers.length)})</option>
            {teamMembers.map((m) => (
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

      {/* 1. نمایش کلی وضعیت وظایف */}
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

      {/* 2. بخش وظایف با اولویت بالا */}
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
                        className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-lg transition cursor-pointer"
                        title="ثبت نظر یا دستور فوری"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectTask(task)}
                        className="p-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition hover:text-blue-600 cursor-pointer"
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

      {/* 3. نمودار و جدول بازدهی اعضای تیم */}
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

          {onOpenTeamModal && (
            <button
              type="button"
              onClick={onOpenTeamModal}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>مدیریت و ویرایش اعضا</span>
            </button>
          )}
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

      {/* 4. نمودارهای روند پیشرفت و توزیع کانال‌های مارکتینگ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                روند پیشرفت و توزیع کانال‌های مارکتینگ (Marketing Channels Trends)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                توزیع وظایف، نرخ تکمیل و تخصیص بودجه در حوزه‌های تخصصی بازاریابی دیجیتال
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            {toPersianDigits(CATEGORIES.length)} کانال فعال
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {channelTrends.map(({ cat, total, done, active, todo, budget, rate }) => (
            <div
              key={cat.key}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shadow-xs"
                    style={{ backgroundColor: cat.colorHex }}
                  />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {cat.label}
                  </h3>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {toPersianDigits(rate)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${rate}%`,
                    backgroundColor: cat.colorHex || '#3b82f6',
                  }}
                  title={`نرخ تکمیل: ${rate}%`}
                />
                <div
                  className="bg-blue-400 h-full opacity-50 transition-all duration-500"
                  style={{ width: `${total > 0 ? (active / total) * 100 : 0}%` }}
                  title="در حال انجام"
                />
              </div>

              {/* Stats Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800 text-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">کل وظایف</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {toPersianDigits(total)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">در حال اجرا</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {toPersianDigits(active)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">تکمیل شده</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {toPersianDigits(done)}
                  </span>
                </div>
              </div>

              {budget > 0 && (
                <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl">
                  <span>بودجه مصوب این کانال:</span>
                  <span className="font-bold">
                    {toPersianDigits(Math.round(budget / 1_000_000))} م تومان
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. پایش وظایف ثبت‌شده و ثبت بازخورد مستقیم مدیریت */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                وظایف ثبت‌شده و ثبت بازخورد مستقیم مدیریت
                <span className="text-xs font-normal text-slate-500">
                  (بدون نیاز به باز کردن مدال)
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مشاهده وضعیت فعلی هر مسئولیت و ارسال فوری دستور و نظرات مدیریتی به مجریان وظایف
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            نمایش {toPersianDigits(filteredTasks.length)} از {toPersianDigits(tasks.length)} وظیفه
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            هیچ وظیفه‌ای با فیلترهای انتخابی مطابقت ندارد.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const cat = CATEGORIES.find((c) => c.key === task.category);
              const pri = PRIORITIES[task.priority];
              const isBlocked =
                task.dependencyTaskId &&
                task.status !== 'completed' &&
                tasks.some((d) => d.id === task.dependencyTaskId && d.status !== 'completed');

              const statusLabels: Record<string, { label: string; badgeClass: string }> = {
                todo: {
                  label: 'برای انجام',
                  badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                },
                in_progress: {
                  label: 'در حال انجام',
                  badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300',
                },
                review: {
                  label: 'نیاز به بازنگری',
                  badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
                },
                completed: {
                  label: 'تکمیل شده',
                  badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
                },
              };

              const stInfo = statusLabels[task.status] || {
                label: task.status,
                badgeClass: 'bg-slate-100 text-slate-700',
              };

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition ${
                    isBlocked
                      ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Task Header & Badges */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-md text-white shadow-2xs"
                        style={{ backgroundColor: cat?.colorHex }}
                      >
                        {cat?.label}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${stInfo.badgeClass}`}>
                        {stInfo.label}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${pri.bgClass} ${pri.textClass}`}>
                        {pri.label}
                      </span>
                      {isBlocked && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" />
                          مسدود توسط پیش‌نیاز
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>سررسید: <b>{toPersianDigits(task.jalaliDueDate)}</b></span>
                      {task.budgetToman ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          {toPersianDigits(Math.round(task.budgetToman / 1_000_000))} م تومان
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Task Title & Details */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-stretch md:self-auto justify-between">
                      {/* Assignee Card */}
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assigneeAvatar}
                          alt={task.assigneeName}
                          className="w-7 h-7 rounded-lg object-cover border border-slate-300 dark:border-slate-700"
                        />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {task.assigneeName}
                        </span>
                      </div>

                      {/* Progress Mini Bar */}
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                          <span>پیشرفت</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {toPersianDigits(task.progress)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Action View Task */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectTask(task)}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                          title="مشاهده جزئیات کامل"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenTaskComments(task)}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 border border-slate-200 dark:border-slate-700 transition cursor-pointer relative"
                          title="تاریخچه دیدگاه‌ها"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          {(task.commentsCount || 0) > 0 && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 text-white rounded-full text-[8px] flex items-center justify-center font-bold">
                              {task.commentsCount}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Direct Inline Feedback Input Row */}
                  <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        ثبت سریع بازخورد یا دستور مدیریتی به مجری:
                      </span>
                      {sentFeedbackSuccess[task.id] && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                          <Check className="w-3.5 h-3.5" />
                          بازخورد شما با موفقیت ثبت شد
                        </span>
                      )}
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        '✅ تایید شد، طبق برنامه اقدام شود',
                        '⚠️ نیاز به اصلاح متن بریف و بررسی ROI',
                        '⚡ اولویت فوری - پیگیری تا پایان وقت اداری',
                        '📊 لطفا نمونه اتود و شاخص‌ها ارسال گردد',
                      ].map((snippet) => (
                        <button
                          key={snippet}
                          type="button"
                          onClick={() => handleSelectQuickFeedback(task.id, snippet)}
                          className="text-[10px] px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        >
                          {snippet}
                        </button>
                      ))}
                    </div>

                    {/* Input Field + Submit Button */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feedbackInputs[task.id] || ''}
                        onChange={(e) =>
                          setFeedbackInputs((prev) => ({ ...prev, [task.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendFeedback(task.id);
                          }
                        }}
                        placeholder="متن بازخورد، دستور مدیریتی یا راهنمایی برای مجری این وظیفه..."
                        className="flex-1 text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendFeedback(task.id)}
                        disabled={!feedbackInputs[task.id]?.trim()}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:cursor-not-allowed"
                      >
                        <span>ارسال</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. گزارش‌های دوره‌ای قابل تنظیم */}
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
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
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
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
