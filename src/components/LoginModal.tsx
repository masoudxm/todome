import React, { useState } from 'react';
import {
  AlertCircle,
  Crown,
  KeyRound,
  Lock,
  ShieldCheck,
  User,
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

  const ceoMember = teamMembers.find((m) => m.role === 'ceo');
  const otherMembers = teamMembers.filter((m) => m.role !== 'ceo');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 text-right relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-blue-600 to-indigo-600" />

        {/* Logo and Branding Header */}
        <div className="text-center pt-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="w-14 h-14 mx-auto mb-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
            RCG
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            ورود به سامانه مدیریت وظایف مارکتینگ
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            دپارتمان تبلیغات، سئو و دیجیتال مارکتینگ هلدینگ RCG
          </p>
        </div>

        {/* Quick CEO Access Banner Button */}
        {ceoMember && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => handleQuickSelect(ceoMember)}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/20 border-2 border-amber-400/80 dark:border-amber-500/60 hover:border-amber-500 transition-all text-right flex items-center justify-between group cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
                  <Crown className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 dark:text-amber-200">
                      ورود با حساب مدیرعامل (CEO)
                    </span>
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">
                      دسترسی عالی
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {ceoMember.name} (کاربری: ceo | رمز: ۱۲۳)
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:-translate-x-1 transition-transform">
                انتخاب ←
              </span>
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              نام کاربری
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: ceo یا masoud یا sara"
                className="w-full text-xs pr-9 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                required
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
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
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>ورود به حساب کاربری</span>
          </button>
        </form>

        {/* Quick Account Switcher Helper */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
            انتخاب سریع حساب‌های تیم (رمز عبور: ۱۲۳):
          </span>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-0.5">
            {otherMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleQuickSelect(member)}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right transition cursor-pointer"
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
                    @{member.username} ({member.role === 'manager' ? 'مدیر' : 'کارشناس'})
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
