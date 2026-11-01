import React, { useState } from 'react';
import {
  AlertOctagon,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Coins,
  Crown,
  Filter,
  MessageSquare,
  Paperclip,
  Plus,
  SlidersHorizontal,
  Star,
  UserCheck,
} from 'lucide-react';
import { Task, TaskStatus, UserProfile } from '../types';
import { CATEGORIES, PRIORITIES } from '../lib/constants';
import { toPersianDigits } from '../lib/jalali';
import { sound } from '../lib/sound';

interface MyTasksViewProps {
  tasks: Task[];
  currentUser: UserProfile;
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewTask: () => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  currentUser,
  onSelectTask,
  onUpdateStatus,
  onOpenNewTask,
}) => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [scope, setScope] = useState<'assigned' | 'all'>(
    currentUser.role === 'ceo' || currentUser.role === 'manager' ? 'all' : 'assigned'
  );

  // If user is CEO/Manager and chooses 'all', show all team tasks
  const myTasks =
    scope === 'all'
      ? tasks
      : tasks.filter((t) => t.assigneeId === currentUser.id || t.creatorId === currentUser.id);

  const filtered = myTasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const completedCount = myTasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'in_progress').length;
  const reviewCount = myTasks.filter((t) => t.status === 'review').length;
  const todoCount = myTasks.filter((t) => t.status === 'todo').length;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-sm"
            />
            {currentUser.role === 'ceo' && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow-xs">
                <Crown className="w-3 h-3" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{currentUser.role === 'ceo' ? 'میز کار و پایش مدیرعامل:' : 'وظایف و مسئولیت‌های من:'}</span>
                <span className="text-blue-600 dark:text-blue-400">{currentUser.name}</span>
              </h2>
              {currentUser.role === 'ceo' && (
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-md">
                  اختیارات عالیه
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              مجموع {toPersianDigits(myTasks.length)} وظیفه در این نما نمایش داده شده است.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          {(currentUser.role === 'ceo' || currentUser.role === 'manager') && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setScope('assigned')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  scope === 'assigned'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                کارهای خودم
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  scope === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                نظارت بر همه وظایف ({toPersianDigits(tasks.length)})
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenNewTask}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن وظیفه جدید</span>
          </button>
        </div>
      </div>

      {/* Status Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'all', label: 'همه وظایف', count: myTasks.length, color: 'text-slate-700 dark:text-slate-200' },
          { key: 'in_progress', label: 'در حال انجام', count: inProgressCount, color: 'text-blue-600 dark:text-blue-400' },
          { key: 'review', label: 'در انتظار تایید', count: reviewCount, color: 'text-amber-600 dark:text-amber-400' },
          { key: 'completed', label: 'تکمیل شده', count: completedCount, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setStatusFilter(item.key as any)}
            className={`p-3.5 rounded-2xl border text-right transition cursor-pointer ${
              statusFilter === item.key
                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {item.label}
            </span>
            <span className={`text-xl font-black ${item.color}`}>{toPersianDigits(item.count)}</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-500" />
            فهرست وظایف ({toPersianDigits(filtered.length)})
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">اولویت:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="all">همه اولویت‌ها</option>
              {Object.values(PRIORITIES).map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">هیچ وظیفه‌ای با این مشخصات یافت نشد.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((task) => {
              const cat = CATEGORIES.find((c) => c.key === task.category);
              const pri = PRIORITIES[task.priority];
              const isDone = task.status === 'completed';

              // Dependency Check
              const dependencyTask = task.dependencyTaskId
                ? tasks.find((t) => t.id === task.dependencyTaskId)
                : null;
              const isBlocked = dependencyTask ? dependencyTask.status !== 'completed' : false;

              // Subtasks count
              const totalSub = task.subtasks?.length || 0;
              const doneSub = task.subtasks?.filter((s) => s.completed).length || 0;

              return (
                <div
                  key={task.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border transition ${
                    isBlocked
                      ? 'bg-rose-50/20 dark:bg-rose-950/15 border-rose-300 dark:border-rose-900/60'
                      : 'bg-slate-50 dark:bg-slate-850/80 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Status Toggle Checkbox */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextStatus = isDone ? 'in_progress' : 'completed';
                        onUpdateStatus(task.id, nextStatus);
                        sound.playSuccessSound();
                      }}
                      className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition shrink-0 cursor-pointer ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                      }`}
                      title={isDone ? 'بازگرداندن به حالت در حال انجام' : 'علامت‌گذاری به عنوان تکمیل شده'}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-2xs"
                          style={{ backgroundColor: cat?.colorHex }}
                        >
                          {cat?.label}
                        </span>
                        <span className={`text-[10px] font-bold ${pri.textClass}`}>
                          {pri.label}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          سررسید: {toPersianDigits(task.jalaliDueDate)}
                        </span>
                        {task.assigneeName && scope === 'all' && (
                          <span className="text-[10px] text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            مسئول: {task.assigneeName}
                          </span>
                        )}
                      </div>

                      {/* Blocked Alert Banner if blocked */}
                      {dependencyTask && isBlocked && (
                        <div className="flex items-center gap-1.5 my-1.5 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-[10px] font-bold animate-pulse">
                          <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>مسدود شده: در انتظار تکمیل وظیفه «{dependencyTask.title}»</span>
                        </div>
                      )}

                      <h4
                        onClick={() => onSelectTask(task)}
                        className={`text-sm font-bold cursor-pointer transition ${
                          isDone
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks and Budget chips */}
                      {(totalSub > 0 || task.budgetToman) && (
                        <div className="flex items-center gap-2 mt-2">
                          {totalSub > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-blue-500" />
                              {toPersianDigits(doneSub)} از {toPersianDigits(totalSub)} زیروظیفه
                            </span>
                          )}
                          {task.budgetToman && task.budgetToman > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                              <Coins className="w-3 h-3 text-amber-500" />
                              بودجه: {toPersianDigits(Math.round(task.budgetToman / 1_000_000))} م تومان
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Meta */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block">پیشرفت</span>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {toPersianDigits(task.progress)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {task.commentsCount !== undefined && task.commentsCount > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                          <span>{toPersianDigits(task.commentsCount)}</span>
                        </div>
                      )}
                      {task.attachments?.length > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg">
                          <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                          <span>{toPersianDigits(task.attachments.length)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
