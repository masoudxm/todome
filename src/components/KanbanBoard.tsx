import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Kanban, Maximize2, Minimize2, Plus } from 'lucide-react';
import { Task, TaskStatus, UserProfile } from '../types';
import { STATUS_COLUMNS } from '../lib/constants';
import { TaskCard } from './TaskCard';
import { toPersianDigits } from '../lib/jalali';
import { sound } from '../lib/sound';

interface KanbanBoardProps {
  tasks: Task[];
  allTasks?: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAddTask: (status: TaskStatus) => void;
  currentUser?: UserProfile;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  allTasks,
  onSelectTask,
  onUpdateStatus,
  onQuickAddTask,
  currentUser,
}) => {
  const [activeDragCol, setActiveDragCol] = useState<TaskStatus | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Keyboard shortcut: Press Escape to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  const toggleFocusMode = () => {
    const nextState = !isFocusMode;
    setIsFocusMode(nextState);
    sound.playSuccessSound();

    if (nextState) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleDragOver = (e: React.DragEvent, colStatus: TaskStatus) => {
    e.preventDefault();
    if (activeDragCol !== colStatus) {
      setActiveDragCol(colStatus);
    }
  };

  const handleDragLeave = (colStatus: TaskStatus) => {
    if (activeDragCol === colStatus) {
      setActiveDragCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setActiveDragCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      const targetTask = tasks.find((t) => t.id === taskId);
      if (
        targetTask &&
        currentUser &&
        currentUser.role !== 'manager' &&
        currentUser.role !== 'ceo' &&
        targetTask.assigneeId !== currentUser.id
      ) {
        return;
      }
      onUpdateStatus(taskId, targetStatus);
      sound.playSuccessSound();
    }
  };

  return (
    <div
      className={
        isFocusMode
          ? 'fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col p-4 lg:p-6 overflow-hidden animate-in fade-in select-none'
          : 'flex flex-col space-y-4 p-4 lg:p-6'
      }
    >
      {/* Kanban Header Bar with Full-Screen Focus Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                بورد وظایف و گردش کار (Kanban)
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {toPersianDigits(tasks.length)} وظیفه
              </span>
              {isFocusMode && (
                <span className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  حالت تمرکز تمام‌صفحه فعال است
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              مدیریت دیداری، تغییر وضعیت درگ و دراپ و پایش موانع کمپین‌ها
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Quick Add Task */}
          <button
            type="button"
            onClick={() => onQuickAddTask('todo')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>وظیفه جدید</span>
          </button>

          {/* Fullscreen / Focus Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleFocusMode}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shadow-xs ${
              isFocusMode
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400 shadow-amber-500/20'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title={
              isFocusMode
                ? 'خروج از حالت تمام‌صفحه (یا کلید Esc)'
                : 'حالت تمرکز و تمام‌صفحه (مخفی‌سازی منوهای کناری)'
            }
          >
            {isFocusMode ? (
              <>
                <Minimize2 className="w-4 h-4 text-slate-950" />
                <span>خروج از تمام‌صفحه (Esc)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-blue-500" />
                <span>حالت تمرکز (تمام‌صفحه)</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div
        className={
          isFocusMode
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 min-h-0 items-stretch'
            : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start'
        }
      >
      {STATUS_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        const totalEstimated = colTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
        const isHovered = activeDragCol === col.key;

        return (
          <div
            key={col.key}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={() => handleDragLeave(col.key)}
            onDrop={(e) => handleDrop(e, col.key)}
            className={`flex flex-col bg-slate-100/70 dark:bg-slate-900/40 rounded-3xl p-3 border-2 transition-all ${
              isFocusMode ? 'flex-1 min-h-0' : 'min-h-[580px]'
            } ${
              isHovered
                ? 'border-dashed border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 scale-[1.01]'
                : `${col.colorClass} border-slate-200/80 dark:border-slate-800`
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between p-2 mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {col.label}
                </h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeClass}`}
                >
                  {toPersianDigits(colTasks.length)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className="text-[10px] text-slate-400 dark:text-slate-500"
                  title="مجموع ساعات تخمینی"
                >
                  {toPersianDigits(totalEstimated)} س
                </span>
                <button
                  type="button"
                  onClick={() => onQuickAddTask(col.key)}
                  className="p-1 hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition"
                  title={`افزودن تسک به ${col.label}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subtitle description */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 px-2 mb-3">
              {col.description}
            </p>

            {/* Task Cards Container */}
            <div
              className={`flex-1 space-y-3 overflow-y-auto pr-0.5 ${
                isFocusMode ? 'min-h-0' : 'max-h-[calc(100vh-280px)]'
              }`}
            >
              <AnimatePresence mode="popLayout">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      هیچ وظیفه‌ای در این ستون نیست
                    </p>
                    <button
                      type="button"
                      onClick={() => onQuickAddTask(col.key)}
                      className="mt-2 text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      + افزودن کار جدید
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      allTasks={allTasks || tasks}
                      onSelect={onSelectTask}
                      onStatusChange={onUpdateStatus}
                      currentUser={currentUser}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
