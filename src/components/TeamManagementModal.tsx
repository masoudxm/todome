import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Edit2,
  KeyRound,
  Lock,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { toPersianDigits } from '../lib/jalali';
import { sound } from '../lib/sound';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: UserProfile[];
  currentUser: UserProfile;
  onSaveMember: (member: UserProfile) => void;
  onDeleteMember: (memberId: string) => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
  currentUser,
  onSaveMember,
  onDeleteMember,
}) => {
  if (!isOpen) return null;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<UserProfile | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<UserProfile | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('specialist');
  const [avatar, setAvatar] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const defaultAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  ];

  const handleOpenAddForm = () => {
    setEditingMember(null);
    setName('');
    setUsername('');
    setPassword('123');
    setTitle('کارشناس دیجیتال مارکتینگ');
    setDepartment('تبلیغات و دیجیتال مارکتینگ RCG');
    setPhone('۰۹۱۲۳۴۵۶۷۸۹');
    setEmail('');
    setRole('specialist');
    setAvatar(defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (member: UserProfile) => {
    setEditingMember(member);
    setName(member.name);
    setUsername(member.username);
    setPassword(member.password || '123');
    setTitle(member.title);
    setDepartment(member.department || 'تبلیغات و دیجیتال مارکتینگ RCG');
    setPhone(member.phone || '۰۹۱۲۳۴۵۶۷۸۹');
    setEmail(member.email);
    setRole(member.role);
    setAvatar(member.avatar);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setFormError('نام کاربری نمی‌تواند خالی باشد.');
      return;
    }

    // Check duplicate username (except when editing self)
    const existing = teamMembers.find(
      (m) => m.username.toLowerCase() === cleanUsername && m.id !== editingMember?.id
    );
    if (existing) {
      setFormError('این نام کاربری قبلاً برای عضو دیگری ثبت شده است.');
      return;
    }

    const memberData: UserProfile = {
      ...editingMember,
      id: editingMember ? editingMember.id : `user-${Date.now()}`,
      username: cleanUsername,
      password: password.trim() || '123',
      name: name.trim(),
      title: title.trim(),
      department: department.trim() || 'تبلیغات و دیجیتال مارکتینگ RCG',
      phone: phone.trim() || undefined,
      email: email.trim() || `${cleanUsername}@rcg-agency.com`,
      role,
      avatar: avatar.trim() || defaultAvatars[0],
      isDefault: editingMember ? editingMember.isDefault : false,
      createdAt: editingMember?.createdAt || new Date().toISOString(),
    };

    onSaveMember(memberData);
    sound.playSuccessSound();
    setIsFormOpen(false);
    setEditingMember(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-right max-h-[90vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              مدیریت اعضای تیم، سمت‌ها و اطلاعات ورود
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              پنل مدیر ارشد جهت ثبت‌نام، اصلاح سمت و رمز عبور یا حذف اعضای پیش‌فرض و جدید
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-0.5">
          {/* Action Bar */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              تعداد اعضای فعال تیم: {toPersianDigits(teamMembers.length)} نفر
            </span>

            <button
              type="button"
              onClick={handleOpenAddForm}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>ثبت‌نام عضو جدید</span>
            </button>
          </div>

          {/* Form Modal / Overlay when adding or editing */}
          {isFormOpen && (
            <form
              onSubmit={handleFormSubmit}
              className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-500/30 rounded-2xl space-y-3.5 animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-2 border-b border-blue-200 dark:border-blue-900/60">
                <span className="text-xs font-black text-blue-900 dark:text-blue-200">
                  {editingMember ? `ویرایش اطلاعات: ${editingMember.name}` : 'ثبت‌نام و تعریف کاربر جدید'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    نام و نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: علی رضایی"
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    سمت و عنوان شغلی *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: متخصص کمپین‌های عملکردی"
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    نام کاربری برای ورود *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ali_rezaei"
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    رمز عبور *
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="رمز ورود"
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    سطح دسترسی
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="specialist">کارشناس تخصصی</option>
                    <option value="manager">مدیر ارشد مجموعه</option>
                    <option value="ceo">مدیرعامل هلدینگ (CEO)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ایمیل سازمانی (اختیاری)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ali@rcg-agency.com"
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    شماره تماس / موبایل
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  واحد یا دپارتمان سازمانی
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="تبلیغات و دیجیتال مارکتینگ RCG"
                  className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  تصویر پروفایل (آواتار)
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {defaultAvatars.map((avUrl, i) => (
                    <img
                      key={i}
                      src={avUrl}
                      alt={`Avatar ${i}`}
                      onClick={() => setAvatar(avUrl)}
                      className={`w-10 h-10 rounded-xl object-cover cursor-pointer border-2 transition ${
                        avatar === avUrl ? 'border-blue-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                >
                  ذخیره مشخصات عضو
                </button>
              </div>
            </form>
          )}

          {/* Members List */}
          <div className="space-y-2.5">
            {teamMembers.map((member) => {
              const isCurrent = member.id === currentUser.id;

              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {member.name}
                        </h4>
                        {member.role === 'ceo' ? (
                          <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                            مدیرعامل (CEO)
                          </span>
                        ) : member.role === 'manager' ? (
                          <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" />
                            مدیر ارشد
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                            کارشناس
                          </span>
                        )}
                        {member.isDefault && (
                          <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                            پیش‌فرض
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{member.title}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1" dir="ltr">
                        <span>نام‌کاربری: <b>{member.username}</b></span>
                        <span>•</span>
                        <span>رمز: <b>{member.password || '123'}</b></span>
                        {member.phone && (
                          <>
                            <span>•</span>
                            <span>تلفن: {member.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEditForm(member)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 rounded-xl transition shadow-2xs cursor-pointer"
                      title="ویرایش سمت و مشخصات این عضو"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>ویرایش</span>
                    </button>

                    {/* Delete member (Manager can delete any other member; cannot delete currently logged in account) */}
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => setMemberToDelete(member)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                        title="حذف این عضو از سیستم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* In-Modal Delete Confirmation Dialog (Iframe Safe) */}
        {memberToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900 rounded-3xl p-5 max-w-md w-full shadow-2xl text-right space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    حذف عضو «{memberToDelete.name}» از تیم؟
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    سمت: {memberToDelete.title}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                ⚠️ با تایید حذف، این عضو از سامانه حذف شده و کلیه وظایف محوله به ایشان به صورت خودکار به مدیر ارشد بازتخصیص خواهد یافت.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMemberToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteMember(memberToDelete.id);
                    setMemberToDelete(null);
                  }}
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                >
                  بله، حذف قطعی عضو
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
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
