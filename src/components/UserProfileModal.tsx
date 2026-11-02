import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Award,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Eye,
  Flame,
  ListTodo,
  LogOut,
  Mail,
  Moon,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  User,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import { Task, UserActivityItem, UserProfile } from '../types';
import { CATEGORIES, PRIORITIES, TEAM_MEMBERS } from '../lib/constants';
import { toPersianDigits } from '../lib/jalali';
import { sound } from '../lib/sound';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onChangeUser: (user: UserProfile) => void;
  tasks: Task[];
  googleUser: any;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  teamMembers?: UserProfile[];
  onOpenTeamModal?: () => void;
  onLogout?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onSelectTask?: (task: Task) => void;
  onUpdateUserProfile?: (updatedUser: UserProfile) => void;
  onDeleteMember?: (memberId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onChangeUser,
  tasks,
  googleUser,
  onGoogleSignIn,
  onGoogleSignOut,
  teamMembers,
  onOpenTeamModal,
  onLogout,
  isDark,
  onToggleTheme,
  onSelectTask,
  onUpdateUserProfile,
  onDeleteMember,
}) => {
  if (!isOpen) return null;

  const membersList = teamMembers && teamMembers.length > 0 ? teamMembers : TEAM_MEMBERS;
  const [selectedMemberId, setSelectedMemberId] = useState<string>(currentUser.id);
  const [activeTab, setActiveTab] = useState<'tasks' | 'activity' | 'preferences'>('tasks');
  const [confirmDeleteMember, setConfirmDeleteMember] = useState(false);

  const isManagerOrCeo = currentUser.role === 'manager' || currentUser.role === 'ceo';

  // Currently viewed user (can be the logged-in user or any team member inspected)
  const viewedUser = membersList.find((m) => m.id === selectedMemberId) || currentUser;
  const isSelf = viewedUser.id === currentUser.id;

  // Notification Preferences State for viewed user
  const [enableSound, setEnableSound] = useState(
    viewedUser.notificationPreferences?.enableSound ?? true
  );
  const [enableBrowserPush, setEnableBrowserPush] = useState(
    viewedUser.notificationPreferences?.enableBrowserPush ?? true
  );
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(
    viewedUser.notificationPreferences?.enableEmailAlerts ?? true
  );
  const [alertEmail, setAlertEmail] = useState(
    viewedUser.notificationPreferences?.emailAddress || viewedUser.email
  );
  const [reminderMinutes, setReminderMinutes] = useState(
    viewedUser.notificationPreferences?.reminderMinutesBefore ?? 30
  );
  const [phone, setPhone] = useState(viewedUser.phone || '۰۹۱۲۳۴۵۶۷۸۹');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Tasks assigned to viewed user
  const userTasks = tasks.filter((t) => t.assigneeId === viewedUser.id);
  const completedCount = userTasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = userTasks.filter((t) => t.status === 'in_progress').length;
  const reviewCount = userTasks.filter((t) => t.status === 'review').length;
  const todoCount = userTasks.filter((t) => t.status === 'todo').length;
  const totalHours = userTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
  const completionRate =
    userTasks.length > 0 ? Math.round((completedCount / userTasks.length) * 100) : 0;

  // Filter tasks in tab
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'review' | 'completed' | 'todo'>('all');
  const filteredUserTasks =
    statusFilter === 'all'
      ? userTasks
      : userTasks.filter((t) => t.status === statusFilter);

  // Generate dynamic Activity History for this user based on tasks, status, and comments
  const userActivities: UserActivityItem[] = [
    ...userTasks.slice(0, 5).map((t, idx) => ({
      id: `act-task-${t.id}`,
      userId: viewedUser.id,
      userName: viewedUser.name,
      action: t.status === 'completed' ? 'تکمیل موفقیت‌آمیز وظیفه' : 'پیگیری و اجرای وظیفه',
      targetTitle: t.title,
      timestampJalali: t.jalaliDueDate,
      type: t.status === 'completed' ? ('task_completed' as const) : ('status_changed' as const),
    })),
    {
      id: `act-rev-${viewedUser.id}`,
      userId: viewedUser.id,
      userName: viewedUser.name,
      action: 'ثبت چک‌لیست و بررسی شاخص‌های عملکردی مارکتینگ',
      targetTitle: 'کمپین تبلیغات دیجیتال RCG',
      timestampJalali: 'امروز',
      type: 'comment_added' as const,
    },
    {
      id: `act-time-${viewedUser.id}`,
      userId: viewedUser.id,
      userName: viewedUser.name,
      action: 'ثبت و همگام‌سازی ساعات کارکرد موثر',
      targetTitle: `${toPersianDigits(totalHours)} ساعت کارکرد ماه جاری`,
      timestampJalali: 'دیروز',
      type: 'task_created' as const,
    },
  ];

  const handleSavePreferences = () => {
    const updatedUser: UserProfile = {
      ...viewedUser,
      phone,
      notificationPreferences: {
        enableSound,
        enableBrowserPush,
        enableEmailAlerts,
        emailAddress: alertEmail,
        reminderMinutesBefore: Number(reminderMinutes),
      },
    };

    if (onUpdateUserProfile) {
      onUpdateUserProfile(updatedUser);
    }
    sound.playSuccessSound();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 text-right overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                پروفایل کاربری اعضای تیم مارکتینگ
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                مشخصات فردی، وظایف، تاریخچه فعالیت‌ها و تنظیمات تم و هشدارها
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Selector Bar (Choose whose profile to inspect) */}
        <div className="py-2.5 overflow-x-auto flex items-center gap-2 shrink-0 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">مشاهده پروفایل:</span>
          {membersList.map((m) => {
            const isSelected = m.id === viewedUser.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMemberId(m.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{m.name}</span>
                {m.id === currentUser.id && (
                  <span className="text-[9px] opacity-80">(شما)</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Profile Identity Card */}
        <div className="py-3.5 shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <img
                src={viewedUser.avatar}
                alt={viewedUser.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {viewedUser.name}
                  </h4>
                  {viewedUser.role === 'ceo' ? (
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Award className="w-3.5 h-3.5" />
                      مدیرعامل هلدینگ (CEO)
                    </span>
                  ) : viewedUser.role === 'manager' ? (
                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      مدیر ارشد مارکتینگ (CMO)
                    </span>
                  ) : (
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                      کارشناس تخصصی
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {viewedUser.title} • {viewedUser.department}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                  <span className="font-mono text-slate-500">@{viewedUser.username}</span>
                  <span dir="ltr">{viewedUser.email}</span>
                </div>
              </div>
            </div>

            {/* Actions for Manager / User */}
            <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-end">
              {isManagerOrCeo && onOpenTeamModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTeamModal();
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="ویرایش، تغییر سمت و اطلاعات این عضو"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>مدیریت و ویرایش اعضا</span>
                </button>
              )}

              {isManagerOrCeo && !isSelf && onDeleteMember && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteMember(true)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="حذف این کاربر از تیم مارکتینگ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف این عضو</span>
                </button>
              )}

              {!isSelf && (
                <button
                  type="button"
                  onClick={() => {
                    onChangeUser(viewedUser);
                    sound.playSuccessSound();
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                >
                  ورود با این اکانت
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Delete Member Confirmation Modal (Iframe Safe) */}
        {confirmDeleteMember && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900 rounded-3xl p-5 max-w-md w-full shadow-2xl text-right space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    حذف عضو «{viewedUser.name}» از تیم؟
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    سمت: {viewedUser.title}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                ⚠️ با تایید حذف، این عضو از سامانه حذف شده و کلیه وظایف محوله به ایشان به صورت خودکار به مدیر ارشد بازتخصیص خواهد یافت.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteMember(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteMember) {
                      onDeleteMember(viewedUser.id);
                    }
                    setConfirmDeleteMember(false);
                    setSelectedMemberId(currentUser.id);
                  }}
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                >
                  بله، حذف قطعی عضو
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick KPI Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 shrink-0">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">کل وظایف محوله</span>
            <span className="text-base font-black text-slate-800 dark:text-slate-200">
              {toPersianDigits(userTasks.length)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">در دست اقدام</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400">
              {toPersianDigits(inProgressCount + reviewCount)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">تکمیل شده</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {toPersianDigits(completedCount)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">نرخ بازدهی</span>
            <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
              ٪{toPersianDigits(completionRate)}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-3 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>وظایف محوله ({toPersianDigits(userTasks.length)})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>تاریخچه فعالیت‌ها</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>تم و هشدارهای هوشمند</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          {/* TAB 1: Assigned Tasks & Status */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    statusFilter === 'all'
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  همه ({toPersianDigits(userTasks.length)})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('in_progress')}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    statusFilter === 'in_progress'
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  در حال انجام ({toPersianDigits(inProgressCount)})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('review')}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    statusFilter === 'review'
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  نیاز به بازنگری ({toPersianDigits(reviewCount)})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('completed')}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    statusFilter === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  تکمیل شده ({toPersianDigits(completedCount)})
                </button>
              </div>

              {filteredUserTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-semibold">هیچ وظیفه‌ای در این وضعیت یافت نشد.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUserTasks.map((t) => {
                    const cat = CATEGORIES.find((c) => c.key === t.category);
                    const pri = PRIORITIES[t.priority];
                    const isDone = t.status === 'completed';
                    const isBlocked =
                      t.dependencyTaskId &&
                      tasks.find((d) => d.id === t.dependencyTaskId)?.status !== 'completed';

                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          if (onSelectTask) {
                            onSelectTask(t);
                            onClose();
                          }
                        }}
                        className={`p-3 rounded-2xl border transition cursor-pointer hover:border-blue-400 ${
                          isBlocked
                            ? 'bg-rose-50/20 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                            : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                              style={{ backgroundColor: cat?.colorHex }}
                            >
                              {cat?.label}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${pri?.bgClass} ${pri?.textClass}`}>
                              {pri?.label}
                            </span>
                            {isBlocked && (
                              <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded animate-pulse">
                                مسدود شده
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {toPersianDigits(t.jalaliDueDate)}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {t.title}
                        </h5>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                          <span>
                            وضعیت:{' '}
                            <b className={isDone ? 'text-emerald-600' : 'text-blue-600'}>
                              {t.status === 'completed'
                                ? 'تکمیل شده'
                                : t.status === 'review'
                                ? 'نیاز به بازنگری'
                                : t.status === 'in_progress'
                                ? 'در حال انجام'
                                : 'برای انجام'}
                            </b>
                          </span>
                          <span>پیشرفت: ٪{toPersianDigits(t.progress || 0)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Activity History */}
          {activeTab === 'activity' && (
            <div className="space-y-2.5">
              <p className="text-[11px] text-slate-400 mb-2">
                تاریخچه فعالیت‌ها، مشارکت‌ها و اقدامات ثبت شده توسط {viewedUser.name}:
              </p>
              {userActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 mt-0.5">
                    {act.type === 'task_completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : act.type === 'comment_added' ? (
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {act.action}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {toPersianDigits(act.timestampJalali)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {act.targetTitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Theme Toggle & Smart Alert Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-3.5">
              {/* Theme Toggle Requirement */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    انتخاب پوسته رابط کاربری (تم لایت / دارک)
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    تغییر تم دیداری سامانه به انتخاب اختصاصی کاربر
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs hover:border-blue-500 transition cursor-pointer"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>حالت روشن (Light)</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span>حالت تاریک (Dark)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Smart Alert & Notification Customization */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-500" />
                  تنظیمات شخصی‌سازی هشدارها و اعلان‌های هوشمند
                </h5>

                {/* Email Alert Toggle & Address */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      ارسال اعلان و هشدارهای سررسید به ایمیل کاربر
                    </span>
                    <input
                      type="checkbox"
                      checked={enableEmailAlerts}
                      onChange={(e) => setEnableEmailAlerts(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  {enableEmailAlerts && (
                    <div className="pr-6">
                      <label className="text-[10px] text-slate-400 block mb-1">
                        آدرس ایمیل دریافت هشدارها:
                      </label>
                      <input
                        type="email"
                        value={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.value)}
                        placeholder="your-email@company.com"
                        className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        dir="ltr"
                      />
                    </div>
                  )}
                </div>

                {/* Sound Alert Toggle */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-emerald-500" />
                      پخش صدای زنگ هنگام سررسید و دستورات جدید
                    </span>
                    <input
                      type="checkbox"
                      checked={enableSound}
                      onChange={(e) => setEnableSound(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>

                {/* Browser Push Toggle */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-500" />
                      ارسال نوتیفیکیشن پوش مرورگر (Browser Push)
                    </span>
                    <input
                      type="checkbox"
                      checked={enableBrowserPush}
                      onChange={(e) => setEnableBrowserPush(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>

                {/* Reminder Timing Preset */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    زمان پیش‌فرض اعلام هشدار قبل از موعد سررسید:
                  </label>
                  <select
                    value={reminderMinutes}
                    onChange={(e) => setReminderMinutes(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value={15}>۱۵ دقیقه قبل از موعد</option>
                    <option value={30}>۳۰ دقیقه قبل از موعد</option>
                    <option value={60}>۱ ساعت قبل از موعد</option>
                    <option value={180}>۳ ساعت قبل از موعد</option>
                    <option value={1440}>۱ روز قبل از موعد سررسید</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>ذخیره تنظیمات هشدارها</span>
                  </button>
                  {saveSuccess && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      تنظیمات ذخیره شد
                    </span>
                  )}
                </div>
              </div>

              {/* Google Workspace Connection status */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  اتصال Google Workspace (شیت، تقویم و تسک‌ها)
                </span>
                {googleUser ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>متصل به {googleUser.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={onGoogleSignOut}
                      className="px-3 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                    >
                      قطع اتصال
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 shadow-2xs transition"
                  >
                    ورود و اتصال به Google
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          {onLogout ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              خروج از حساب
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
