import React from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Lock,
  MessageSquare,
  Paperclip,
  ShieldAlert,
  Star,
  UserCheck,
} from 'lucide-react';
import { Task, UserProfile } from '../types';
import { CATEGORIES, PRIORITIES } from '../lib/constants';
import { toPersianDigits } from '../lib/jalali';

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  currentUser?: UserProfile;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onSelect,
  onDragStart,
  onStatusChange,
  currentUser,
}) => {
  const categoryMeta = CATEGORIES.find((c) => c.key === task.category) || CATEGORIES[0];
  const priorityMeta = PRIORITIES[task.priority] || PRIORITIES.medium;

  const canEdit = !currentUser || currentUser.role === 'manager' || task.assigneeId === currentUser.id;

  const handleCardDragStart = (e: React.DragEvent) => {
    if (!canEdit) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', task.id);
    if (onDragStart) onDragStart(e, task.id);
  };

  return (
    <div
      draggable={canEdit}
      onDragStart={handleCardDragStart}
      className={`select-none ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
    >
      <motion.div
        layout
        layoutId={task.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        onClick={() => onSelect(task)}
        className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md dark:hover:shadow-slate-900/50 transition-all overflow-hidden"
      >
      {/* Category Color Accent Strip on the Right (RTL) */}
      <div
        className="absolute top-0 right-0 bottom-0 w-1.5 rounded-r-2xl"
        style={{ backgroundColor: categoryMeta.colorHex }}
      />

      {/* Header: Category Badge & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pr-1">
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${categoryMeta.bgLight} ${categoryMeta.bgDark} ${categoryMeta.textLight} ${categoryMeta.textDark} ${categoryMeta.borderLight} ${categoryMeta.borderDark} flex items-center gap-1`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: categoryMeta.colorHex }}
          />
          {categoryMeta.label}
        </span>

        <div className="flex items-center gap-1.5">
          {!canEdit && (
            <span
              className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-850"
              title="دسترسی فقط‌خواندنی (فقط مجری وظیفه و مدیر ارشد مجاز به تغییر هستند)"
            >
              <Lock className="w-3 h-3" />
            </span>
          )}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityMeta.bgClass} ${priorityMeta.textClass} ${priorityMeta.borderClass}`}
          >
            {priorityMeta.label}
          </span>
        </div>
      </div>

      {/* Task Title */}
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug line-clamp-2">
        {task.title}
      </h3>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
          <span>پیشرفت وظیفه</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {toPersianDigits(task.progress)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              task.progress === 100
                ? 'bg-emerald-500'
                : task.progress > 50
                ? 'bg-blue-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Footer Info: Jalali Deadline, Assignee, Meta counts */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        {/* Due Date & Reminder */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md"
            title="سررسید خورشیدی"
          >
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{toPersianDigits(task.jalaliDueDate)}</span>
          </div>

          {task.reminderDateTime && (
            <span
              className="text-amber-500 dark:text-amber-400 p-1 bg-amber-50 dark:bg-amber-950/50 rounded-md"
              title={`هشدار زمان‌بندی: ${toPersianDigits(task.reminderDateTime)}`}
            >
              <Bell className="w-3 h-3 animate-pulse" />
            </span>
          )}
        </div>

        {/* Right side: Assignee & Counters */}
        <div className="flex items-center gap-2.5">
          {/* Comments count */}
          {task.commentsCount !== undefined && task.commentsCount > 0 && (
            <div
              className="flex items-center gap-0.5 text-[11px] text-slate-400 dark:text-slate-500"
              title={`${toPersianDigits(task.commentsCount)} نظر و دستور`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>{toPersianDigits(task.commentsCount)}</span>
            </div>
          )}

          {/* Attachments count */}
          {task.attachments?.length > 0 && (
            <div
              className="flex items-center gap-0.5 text-[11px] text-slate-400 dark:text-slate-500"
              title={`${toPersianDigits(task.attachments.length)} فایل ضمیمه`}
            >
              <Paperclip className="w-3 h-3" />
              <span>{toPersianDigits(task.attachments.length)}</span>
            </div>
          )}

          {/* Assignee Avatar */}
          <div className="relative" title={`مسئول: ${task.assigneeName}`}>
            {task.assigneeAvatar ? (
              <img
                src={task.assigneeAvatar}
                alt={task.assigneeName}
                className="w-6 h-6 rounded-full object-cover border border-white dark:border-slate-800"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 flex items-center justify-center text-[10px] font-bold">
                {task.assigneeName[0]}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);
};
