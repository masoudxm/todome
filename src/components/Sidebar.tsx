import React, { useState } from 'react';
import {
  BarChart3,
  Calculator,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Kanban,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  Settings,
  ShieldCheck,
  Sun,
  User,
  Users,
  X,
} from 'lucide-react';
import { UserProfile } from '../types';
import { toPersianDigits } from '../lib/jalali';

export type NavView = 'dashboard' | 'my_tasks' | 'kanban' | 'calendar' | 'reports';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  currentUser: UserProfile;
  onChangeUser: (user: UserProfile) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenNewTaskModal: () => void;
  onOpenProfileModal: () => void;
  onOpenSettingsModal: () => void;
  googleUser: any;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  activeRemindersCount: number;
  myTasksCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenTeamModal?: () => void;
  onOpenMarketingTools?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  onChangeUser,
  isDark,
  onToggleTheme,
  isCollapsed,
  onToggleCollapse,
  onOpenNewTaskModal,
  onOpenProfileModal,
  onOpenSettingsModal,
  googleUser,
  onGoogleSignIn,
  onGoogleSignOut,
  activeRemindersCount,
  myTasksCount,
  isMobileOpen = false,
  onCloseMobile,
  onOpenTeamModal,
  onOpenMarketingTools,
  onLogout,
}) => {
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  const mainNavItems = [
    {
      id: 'dashboard' as NavView,
      label: 'داشبورد',
      description: 'تحلیل جامع بازدهی و عملکرد تیم',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'my_tasks' as NavView,
      label: 'وظایف من',
      description: 'کارهای اختصاص‌یافته به من',
      icon: CheckSquare,
      badge: myTasksCount > 0 ? myTasksCount : null,
    },
    {
      id: 'kanban' as NavView,
      label: 'بورد وظایف',
      description: 'مدیریت کارتی و درگ و دراپ',
      icon: Kanban,
      badge: null,
    },
    {
      id: 'calendar' as NavView,
      label: 'تقویم',
      description: 'سررسیدها و رویدادهای خورشیدی',
      icon: Calendar,
      badge: activeRemindersCount > 0 ? activeRemindersCount : null,
    },
    {
      id: 'reports' as NavView,
      label: 'گزارش‌ها',
      description: 'گزارش‌های دوره‌ای و گوگل شیت',
      icon: BarChart3,
      badge: null,
    },
  ];

  const handleItemClick = (view: NavView) => {
    onSelectView(view);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static top-0 right-0 z-50 md:z-30 flex flex-col justify-between bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-all duration-300 h-screen select-none shrink-0 md:shadow-none ${
          isMobileOpen
            ? 'translate-x-0 w-72 shadow-2xl visible pointer-events-auto'
            : 'translate-x-full md:translate-x-0 invisible md:visible pointer-events-none md:pointer-events-auto shadow-none'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Top Section */}
        <div className="p-3.5 space-y-4 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
                RCG
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="leading-tight truncate">
                  <span className="text-xs font-black text-slate-900 dark:text-white block truncate">
                    RCG Marketing Hub
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block truncate">
                    واحد تبلیغات و دیجیتال
                  </span>
                </div>
              )}
            </div>

            {/* Close button on mobile, Collapse button on desktop */}
            <div className="flex items-center gap-1">
              {isMobileOpen && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition shrink-0"
                title={isCollapsed ? 'باز کردن منو' : 'جمع کردن منو'}
              >
                {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Add Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                onOpenNewTaskModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all ${
                isCollapsed && !isMobileOpen ? 'px-0' : ''
              }`}
              onMouseEnter={() => isCollapsed && !isMobileOpen && setHoveredTooltip('تعریف وظیفه جدید')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <Plus className="w-4 h-4 shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span>تعریف وظیفه جدید</span>}
            </button>

            {isCollapsed && !isMobileOpen && hoveredTooltip === 'تعریف وظیفه جدید' && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in">
                تعریف وظیفه جدید
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-900 rotate-45" />
              </div>
            )}
          </div>

          {/* Minimal Navigation Buttons with Tooltips */}
          <nav className="space-y-1.5 pt-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isHovered = hoveredTooltip === item.id;

              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    onMouseEnter={() => setHoveredTooltip(item.id)}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-xs font-bold transition-all relative ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    } ${isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-start'}`}
                  >
                    {isActive && (
                      <span className="absolute right-0 top-2.5 bottom-2.5 w-1 bg-blue-600 dark:bg-blue-400 rounded-l-full" />
                    )}
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform ${
                        isActive ? 'text-blue-600 dark:text-blue-400 scale-105' : 'text-slate-400'
                      }`}
                    />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate flex-1 text-right">{item.label}</span>
                    )}
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          isCollapsed && !isMobileOpen
                            ? 'absolute -top-1 -right-1 bg-amber-500 text-white'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {toPersianDigits(item.badge)}
                      </span>
                    )}
                  </button>

                  {/* Floating Tooltip (Desktop only) */}
                  {isHovered && isCollapsed && !isMobileOpen && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in flex items-center gap-1.5">
                      <span>{item.label}</span>
                      <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Marketing Utilities Section */}
          {onOpenMarketingTools && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onOpenMarketingTools();
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/60 transition cursor-pointer ${
                  isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-start'
                }`}
                title="جعبه‌ابزار مارکتینگ (محاسبه ROAS و سازنده UTM)"
              >
                <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate flex-1 text-right">جعبه‌ابزار مارکتینگ</span>
                )}
                {(!isCollapsed || isMobileOpen) && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-indigo-600 text-white font-black">
                    ROAS & UTM
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Bottom Section: User Profile, Settings, Theme */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* User Profile Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                onOpenProfileModal();
                if (onCloseMobile) onCloseMobile();
              }}
              onMouseEnter={() => isCollapsed && !isMobileOpen && setHoveredTooltip('profile')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className={`w-full flex items-center gap-2.5 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
                isCollapsed && !isMobileOpen ? 'justify-center' : ''
              }`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-300 dark:border-slate-700 shadow-2xs"
              />
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex-1 min-w-0 text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {currentUser.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold block truncate ${
                      currentUser.role === 'ceo'
                        ? 'text-amber-500'
                        : currentUser.role === 'manager'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {currentUser.role === 'ceo'
                      ? 'مدیرعامل هلدینگ (CEO)'
                      : currentUser.role === 'manager'
                      ? 'مدیر ارشد مارکتینگ'
                      : 'کارشناس تبلیغات'}
                  </span>
                </div>
              )}
            </button>

            {isCollapsed && !isMobileOpen && hoveredTooltip === 'profile' && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in">
                پروفایل کاربری ({currentUser.name})
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
              </div>
            )}
          </div>

          {/* Senior Manager & CEO: Team & Access Management */}
          {(currentUser.role === 'manager' || currentUser.role === 'ceo') && onOpenTeamModal && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  onOpenTeamModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                onMouseEnter={() => isCollapsed && !isMobileOpen && setHoveredTooltip('team')}
                onMouseLeave={() => setHoveredTooltip(null)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-2xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition cursor-pointer ${
                  isCollapsed && !isMobileOpen ? 'justify-center' : ''
                }`}
              >
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span>مدیریت اعضا و دسترسی‌ها</span>}
              </button>

              {isCollapsed && !isMobileOpen && hoveredTooltip === 'team' && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in">
                  مدیریت اعضای تیم و کاربران
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
                </div>
              )}
            </div>
          )}

          {/* Settings Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                onOpenSettingsModal();
                if (onCloseMobile) onCloseMobile();
              }}
              onMouseEnter={() => isCollapsed && !isMobileOpen && setHoveredTooltip('settings')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className={`w-full flex items-center gap-2.5 p-2 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
                isCollapsed && !isMobileOpen ? 'justify-center' : ''
              }`}
            >
              <Settings className="w-5 h-5 text-slate-400 shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span>تنظیمات</span>}
            </button>

            {isCollapsed && !isMobileOpen && hoveredTooltip === 'settings' && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in">
                تنظیمات سامانه
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={onToggleTheme}
              onMouseEnter={() => isCollapsed && !isMobileOpen && setHoveredTooltip('theme')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className={`w-full flex items-center gap-2.5 p-2 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
                isCollapsed && !isMobileOpen ? 'justify-center' : ''
              }`}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              {(!isCollapsed || isMobileOpen) && <span>{isDark ? 'حالت روشن' : 'حالت تاریک'}</span>}
            </button>

            {isCollapsed && !isMobileOpen && hoveredTooltip === 'theme' && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in">
                {isDark ? 'حالت روشن' : 'حالت تاریک'}
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
              </div>
            )}
          </div>

          {/* Logout Button */}
          {onLogout && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  if (onCloseMobile) onCloseMobile();
                }}
                onMouseEnter={() => isCollapsed && !isMobileOpen && setHoveredTooltip('logout')}
                onMouseLeave={() => setHoveredTooltip(null)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition ${
                  isCollapsed && !isMobileOpen ? 'justify-center' : ''
                }`}
              >
                <LogOut className="w-5 h-5 text-rose-500 shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span>خروج از حساب کاربری</span>}
              </button>

              {isCollapsed && !isMobileOpen && hoveredTooltip === 'logout' && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in">
                  خروج از حساب کاربری
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
