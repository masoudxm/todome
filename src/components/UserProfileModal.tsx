import React from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  LogOut,
  Mail,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { Task, UserProfile } from '../types';
import { TEAM_MEMBERS } from '../lib/constants';
import { toPersianDigits } from '../lib/jalali';

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
}) => {
  if (!isOpen) return null;

  const membersList = teamMembers && teamMembers.length > 0 ? teamMembers : TEAM_MEMBERS;
  const userTasks = tasks.filter((t) => t.assigneeId === currentUser.id);
  const completedCount = userTasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = userTasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length;
  const totalHours = userTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-right overflow-hidden relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            پروفایل کاربری و اطلاعات فردی
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {currentUser.name}
                </h4>
                {currentUser.role === 'manager' ? (
                  <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    مدیریت ارشد مارکتینگ
                  </span>
                ) : (
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                    کارشناس تخصصی
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{currentUser.title}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                <span className="font-mono text-slate-500">نام‌کاربری: @{currentUser.username}</span>
                <span dir="ltr">{currentUser.email}</span>
              </div>
            </div>
          </div>

          {/* User Performance Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">در حال انجام</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                {toPersianDigits(inProgressCount)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">تکمیل شده</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {toPersianDigits(completedCount)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">ساعات کارکرد</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-200">
                {toPersianDigits(totalHours)} س
              </span>
            </div>
          </div>

          {/* Senior Manager: Team Management Entry */}
          {currentUser.role === 'manager' && onOpenTeamModal && (
            <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  مدیریت اعضای تیم و کاربران
                </h5>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                  ثبت کاربر جدید، تغییر سمت، تعیین نام کاربری، رمز عبور و حذف اعضا
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTeamModal();
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition shadow-xs"
              >
                ورود به مدیریت
              </button>
            </div>
          )}

          {/* Switch Active User Profile */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              سوئیچ سریع بین پروفایل‌ها:
            </label>
            <p className="text-[11px] text-slate-400">
              می‌توانید بین اکانت‌های کارشناسان و مدیر تیم جابجا شوید یا جهت ورود امن با رمز عبور از دکمه خروج استفاده نمایید.
            </p>
            <div className="grid grid-cols-1 gap-2 pt-1 max-h-48 overflow-y-auto">
              {membersList.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangeUser(m)}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs transition ${
                    currentUser.id === m.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 font-bold text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
                    <span>{m.name}</span>
                    <span className="text-[10px] text-slate-400">(@{m.username})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {m.role === 'manager' ? 'مدیر ارشد' : 'کارشناس'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Google Workspace Connection status */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
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

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          {onLogout ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
              خروج از حساب
            </button>
          ) : <div />}

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
