import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Check,
  Clock,
  Lock,
  MessageSquare,
  Paperclip,
  Share2,
  Trash2,
  User,
  X,
  CalendarPlus,
  ListTodo,
} from 'lucide-react';
import { Task, TaskAttachment, TaskCategory, TaskComment, TaskPriority, TaskStatus, UserProfile } from '../types';
import { CATEGORIES, PRIORITIES, TEAM_MEMBERS } from '../lib/constants';
import { getCurrentJalaliDate, JALALI_MONTH_NAMES, toPersianDigits } from '../lib/jalali';
import { CommentsSection } from './CommentsSection';
import { AttachmentsSection } from './AttachmentsSection';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  currentUser: UserProfile;
  comments: TaskComment[];
  teamMembers?: UserProfile[];
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
  onAddComment: (comment: Omit<TaskComment, 'id' | 'createdAt'>) => void;
  onDeleteComment?: (commentId: string) => void;
  onSyncCalendar?: (task: Task) => void;
  onSyncGoogleTasks?: (task: Task) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  currentUser,
  comments,
  teamMembers,
  onClose,
  onSave,
  onDelete,
  onAddComment,
  onDeleteComment,
  onSyncCalendar,
  onSyncGoogleTasks,
}) => {
  if (!isOpen) return null;

  const currentJDate = getCurrentJalaliDate();
  const membersList = teamMembers && teamMembers.length > 0 ? teamMembers : TEAM_MEMBERS;

  // Strict Permission Check: Only the Assignee, Creator, or Senior Manager can modify this task
  const canEdit =
    !task ||
    currentUser.role === 'manager' ||
    task.assigneeId === currentUser.id ||
    task.creatorId === currentUser.id;

  const canDelete =
    Boolean(task && onDelete && (currentUser.role === 'manager' || task.creatorId === currentUser.id));

  // Active Tab
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments' | 'sync'>('details');

  // Form State
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [category, setCategory] = useState<TaskCategory>(task?.category || 'campaigns');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo');
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || currentUser.id);
  const [progress, setProgress] = useState(task?.progress ?? 0);
  const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours ?? 4);
  const [actualHours, setActualHours] = useState(task?.actualHours ?? 0);
  const [tags, setTags] = useState(task?.tags?.join('، ') || '');

  // Jalali Due Date State
  const initialDueParts = task?.jalaliDueDate
    ? task.jalaliDueDate.split('/')
    : [String(currentJDate.jy), String(currentJDate.jm).padStart(2, '0'), String(currentJDate.jd).padStart(2, '0')];

  const [dueYear, setDueYear] = useState(initialDueParts[0] || '1404');
  const [dueMonth, setDueMonth] = useState(initialDueParts[1] || '08');
  const [dueDay, setDueDay] = useState(initialDueParts[2] || '15');

  // Reminder Alarm State
  const hasInitialReminder = Boolean(task?.reminderDateTime);
  const [hasReminder, setHasReminder] = useState(hasInitialReminder);
  const [reminderHour, setReminderHour] = useState(
    task?.reminderDateTime?.split(' ')[1]?.split(':')[0] || '10'
  );
  const [reminderMinute, setReminderMinute] = useState(
    task?.reminderDateTime?.split(' ')[1]?.split(':')[1] || '00'
  );

  // Attachments State
  const [attachments, setAttachments] = useState<TaskAttachment[]>(task?.attachments || []);

  const handleAddAttachment = (att: TaskAttachment) => {
    setAttachments([...attachments, att]);
  };

  const handleDeleteAttachment = (attId: string) => {
    setAttachments(attachments.filter((a) => a.id !== attId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!title.trim()) return;

    const formattedJalaliDue = `${dueYear}/${dueMonth.padStart(2, '0')}/${dueDay.padStart(2, '0')}`;
    const reminderFormatted = hasReminder
      ? `${formattedJalaliDue} ${reminderHour.padStart(2, '0')}:${reminderMinute.padStart(2, '0')}`
      : undefined;

    const assignedMember = membersList.find((m) => m.id === assigneeId) || currentUser;

    const taskPayload: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status,
      assigneeId,
      assigneeName: assignedMember.name,
      assigneeAvatar: assignedMember.avatar,
      jalaliDueDate: formattedJalaliDue,
      reminderDateTime: reminderFormatted,
      reminderTriggered: false,
      progress: Number(progress),
      estimatedHours: Number(estimatedHours),
      actualHours: Number(actualHours),
      tags: tags
        .split(/[،,]/)
        .map((t) => t.trim())
        .filter(Boolean),
      attachments,
    };

    onSave(taskPayload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {task ? 'ویرایش و بازبینی وظیفه' : 'تعریف وظیفه و مسئولیت جدید'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              واحد تبلیغات و دیجیتال مارکتینگ RCG
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            جزئیات و اولویت
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'comments'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            نظرات و دستورات مدیر ({toPersianDigits(comments.length)})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attachments')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'attachments'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            فایل‌های ضمیمه ({toPersianDigits(attachments.length)})
          </button>

          {task && (
            <button
              type="button"
              onClick={() => setActiveTab('sync')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'sync'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              همگام‌سازی گوگل
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'details' && (
            <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
              {!canEdit && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <Lock className="w-5 h-5 shrink-0 text-amber-600" />
                  <span>
                    <b>دسترسی فقط‌خواندنی:</b> این وظیفه به <b>{task?.assigneeName}</b> محول شده است. تغییر مشخصات تنها توسط مجری وظیفه و مدیر ارشد امکان‌پذیر است. شما می‌توانید دیدگاه یا فایل ضمیمه ثبت کنید.
                  </span>
                </div>
              )}

              {/* Task Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  عنوان وظیفه یا موضوع مسئولیت *
                </label>
                <input
                  type="text"
                  value={title}
                  disabled={!canEdit}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: طراحی ست بنرهای کمپین اینستاگرام و ادنتورک"
                  className="w-full text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  شرح کامل و بریف مارکتینگ
                </label>
                <textarea
                  value={description}
                  disabled={!canEdit}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیحات تکمیلی، نیازمندی‌ها، کانال‌های انتشار، اهداف KPI و استانداردهای طراحی..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    حوزه مسئولیت / کانال مارکتینگ
                  </label>
                  <select
                    value={category}
                    disabled={!canEdit}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    سطح اولویت
                  </label>
                  <select
                    value={priority}
                    disabled={!canEdit}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {Object.values(PRIORITIES).map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Assignee Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Status */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    وضعیت فعلی
                  </label>
                  <select
                    value={status}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const newStatus = e.target.value as TaskStatus;
                      setStatus(newStatus);
                      if (newStatus === 'completed') setProgress(100);
                    }}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="todo">تعریف شده / در انتظار اقدام</option>
                    <option value="in_progress">در حال انجام و تولید</option>
                    <option value="review">بازبینی و تایید مدیر ارشد</option>
                    <option value="completed">تکمیل شده و انتشاریافته</option>
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    مسئول و مجری وظیفه
                  </label>
                  <select
                    value={assigneeId}
                    disabled={!canEdit || currentUser.role !== 'manager'}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {membersList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.title})
                      </option>
                    ))}
                  </select>
                  {currentUser.role !== 'manager' && (
                    <span className="text-[10px] text-slate-400 block mt-1">
                      * تغییر مسئول تنها در حیطه اختیارات مدیر ارشد مارکتینگ است
                    </span>
                  )}
                </div>
              </div>

              {/* Jalali Solar Due Date */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  سررسید و ددلاین خورشیدی
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">سال</label>
                    <select
                      value={dueYear}
                      disabled={!canEdit}
                      onChange={(e) => setDueYear(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {['1403', '1404', '1405'].map((y) => (
                        <option key={y} value={y}>
                          {toPersianDigits(y)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">ماه</label>
                    <select
                      value={dueMonth}
                      disabled={!canEdit}
                      onChange={(e) => setDueMonth(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {JALALI_MONTH_NAMES.map((name, idx) => {
                        const mStr = String(idx + 1).padStart(2, '0');
                        return (
                          <option key={mStr} value={mStr}>
                            {name} ({toPersianDigits(idx + 1)})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">روز</label>
                    <select
                      value={dueDay}
                      disabled={!canEdit}
                      onChange={(e) => setDueDay(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(
                        (d) => (
                          <option key={d} value={d}>
                            {toPersianDigits(d)}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Exact Date & Time Alarm / Reminder */}
              <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasReminder}
                      disabled={!canEdit}
                      onChange={(e) => setHasReminder(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 disabled:opacity-60"
                    />
                    <Bell className="w-4 h-4 text-amber-600" />
                    تعیین هشدار اختصاصی روز و ساعت
                  </label>
                  {hasReminder && (
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      هشدار با پخش صدا و اعلان مرورگر
                    </span>
                  )}
                </div>

                {hasReminder && (
                  <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in">
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                        ساعت یادآوری
                      </label>
                      <select
                        value={reminderHour}
                        disabled={!canEdit}
                        onChange={(e) => setReminderHour(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-slate-800 dark:text-slate-200 disabled:opacity-60"
                      >
                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                          <option key={h} value={h}>
                            ساعت {toPersianDigits(h)}:00
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                        دقیقه
                      </label>
                      <select
                        value={reminderMinute}
                        disabled={!canEdit}
                        onChange={(e) => setReminderMinute(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-slate-800 dark:text-slate-200 disabled:opacity-60"
                      >
                        {['00', '15', '30', '45'].map((m) => (
                          <option key={m} value={m}>
                            {toPersianDigits(m)} دقیقه
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>درصد پیشرفت کار</span>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">
                    {toPersianDigits(progress)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  disabled={!canEdit}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Estimated & Actual Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                    زمان تخمینی (ساعت)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={estimatedHours}
                    disabled={!canEdit}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                    زمان واقعی ثبت شده (ساعت)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={actualHours}
                    disabled={!canEdit}
                    onChange={(e) => setActualHours(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  برچسب‌ها (با ویرگول یا کاما جدا کنید)
                </label>
                <input
                  type="text"
                  value={tags}
                  disabled={!canEdit}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="کمپین، پروموشن، تخفیف، اینستاگرام"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-60"
                />
              </div>
            </form>
          )}

          {activeTab === 'comments' && (
            <CommentsSection
              taskId={task?.id || 'new'}
              comments={comments}
              currentUser={currentUser}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
            />
          )}

          {activeTab === 'attachments' && (
            <AttachmentsSection
              attachments={attachments}
              onAddAttachment={handleAddAttachment}
              onDeleteAttachment={handleDeleteAttachment}
            />
          )}

          {activeTab === 'sync' && task && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  همگام‌سازی ابری با Google Workspace
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  این وظیفه را به صورت مستقیم و با مجوز شما به تقویم گوگل یا فهرست تسک‌های شخصی خود اضافه نمایید.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onSyncCalendar && onSyncCalendar(task)}
                  className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 text-slate-800 dark:text-slate-200 hover:text-blue-600 transition shadow-xs"
                >
                  <CalendarPlus className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold">ثبت در تقویم گوگل (Google Calendar)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSyncGoogleTasks && onSyncGoogleTasks(task)}
                  className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-500 text-slate-800 dark:text-slate-200 hover:text-emerald-600 transition shadow-xs"
                >
                  <ListTodo className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold">ارسال به گوگل تسک (Google Tasks)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          <div>
            {canDelete && task && (
              <button
                type="button"
                onClick={() => onDelete && onDelete(task.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" />
                حذف وظیفه
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
            >
              انصراف
            </button>
            {canEdit ? (
              <button
                type="submit"
                form="task-form"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition"
              >
                <Check className="w-4 h-4" />
                {task ? 'ذخیره تغییرات' : 'ثبت وظیفه جدید'}
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-medium px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                حالت فقط‌خواندنی
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
