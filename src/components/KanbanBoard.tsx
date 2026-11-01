import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4 lg:p-6 items-start">
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
            className={`flex flex-col bg-slate-100/70 dark:bg-slate-900/40 rounded-3xl p-3 border-2 transition-all min-h-[580px] ${
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
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
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
  );
};
