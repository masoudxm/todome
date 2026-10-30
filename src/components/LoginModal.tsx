import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Lock,
  LogOut,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { UserProfile } from '../types';
import { sound } from '../lib/sound';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (user: UserProfile) => void;
  teamMembers: UserProfile[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLogin,
  teamMembers,
}) => {
  if (!isOpen) return null;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const user = teamMembers.find(
      (m) => m.username.toLowerCase() === cleanUsername
    );

    if (!user) {
      setError('کاربری با این نام کاربری در سامانه یافت نشد.');
      return;
    }

    if (user.password && user.password !== password) {
      setError('رمز عبور وارد شده نادرست است.');
      return;
    }

    sound.playSuccessSound();
    onLogin(user);
  };

  const handleQuickSelect = (member: UserProfile) => {
    setUsername(member.username);
    setPassword(member.password || '123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 text-right relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

        {/* Logo and Branding Header */}
        <div className="text-center pt-2 pb-5 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
            RCG
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            ورود به سامانه مدیریت وظایف و مسئولیت‌ها
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            واحد تبلیغات و دیجیتال مارکتینگ RCG
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              نام کاربری
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: masoud یا sara"
                className="w-full text-xs pr-9 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                required
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              رمز عبور
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full text-xs pr-9 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                required
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>ورود به حساب کاربری</span>
          </button>
        </form>

        {/* Quick Account Switcher Helper (Helpful for testing accounts) */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
            انتخاب سریع حساب‌های فعال تیم (رمز پیش‌فرض: ۱۲۳):
          </span>
          <div className="grid grid-cols-2 gap-2">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleQuickSelect(member)}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right transition"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0 flex-1 truncate">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {member.name}
                  </span>
                  <span className="text-[9px] text-slate-400 block truncate" dir="ltr">
                    @{member.username}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
