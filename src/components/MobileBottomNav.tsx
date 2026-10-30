import React from 'react';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  Kanban,
  LayoutDashboard,
  Plus,
} from 'lucide-react';
import { NavView } from './Sidebar';
import { toPersianDigits } from '../lib/jalali';

interface MobileBottomNavProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenNewTask: () => void;
  myTasksCount: number;
  remindersCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenNewTask,
  myTasksCount,
  remindersCount,
}) => {
  const items = [
    { id: 'dashboard' as NavView, label: 'داشبورد', icon: LayoutDashboard },
    { id: 'my_tasks' as NavView, label: 'وظایف من', icon: CheckSquare, badge: myTasksCount },
    { id: 'kanban' as NavView, label: 'کانبان', icon: Kanban },
    { id: 'calendar' as NavView, label: 'تقویم', icon: Calendar, badge: remindersCount },
    { id: 'reports' as NavView, label: 'گزارش‌ها', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectView(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {toPersianDigits(item.badge)}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label}</span>
            {isActive && (
              <span className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5" />
            )}
          </button>
        );
      })}

      {/* Floating Quick Add Button on Mobile */}
      <button
        type="button"
        onClick={onOpenNewTask}
        className="p-2.5 bg-blue-600 text-white rounded-full shadow-md shadow-blue-500/30 -mt-5 transition active:scale-95"
        title="وظیفه جدید"
      >
        <Plus className="w-5 h-5" />
      </button>
    </nav>
  );
};
