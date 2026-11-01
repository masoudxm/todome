import React, { useState } from 'react';
import {
  Award,
  Clock,
  CornerDownLeft,
  Crown,
  MessageSquare,
  Send,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { TaskComment, UserProfile } from '../types';
import { toPersianDigits } from '../lib/jalali';
import { sound } from '../lib/sound';

interface CommentsSectionProps {
  taskId: string;
  comments: TaskComment[];
  currentUser: UserProfile;
  onAddComment: (comment: Omit<TaskComment, 'id' | 'createdAt'>) => void;
  onDeleteComment?: (commentId: string) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  taskId,
  comments,
  currentUser,
  onAddComment,
  onDeleteComment,
}) => {
  const [content, setContent] = useState('');
  const [isManagerNote, setIsManagerNote] = useState(currentUser.role === 'manager');
  const [isCeoDirective, setIsCeoDirective] = useState(currentUser.role === 'ceo');
  const [replyToUser, setReplyToUser] = useState<string | null>(null);

  const quickReplies =
    currentUser.role === 'ceo'
      ? [
          'دستور مدیرعامل: تایید نهایی شد، فوراً ابلاغ گردد.',
          'جهت بررسی شاخص‌های بازگشت سرمایه (ROI) بازنگری شود.',
          'گزارش خروجی این کمپین تا پایان هفته برای هیئت مدیره ارسال شود.',
          'کیفیت عالی است، از تلاش تیم کمال تشکر را دارم.',
        ]
      : currentUser.role === 'manager'
      ? [
          'تایید شد، اقدام نمایید.',
          'لطفاً نسخه اصلاح‌شده را آپلود کنید.',
          'اولویت این کار بالاست، زودتر نهایی شود.',
          'گزارش و پیش‌نویس ضمیمه بررسی شد، عالی است.',
        ]
      : [
          'نسخه جدید طبق دستور به‌روزرسانی شد.',
          'فایل‌های مربوطه ضمیمه شد، در انتظار تایید.',
          'کار در حال پیشرفت است و تا فردا آماده تحویل است.',
        ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const finalContent = replyToUser ? `@${replyToUser}: ${content.trim()}` : content.trim();

    onAddComment({
      taskId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      content: finalContent,
      isManagerNote: currentUser.role === 'manager' && isManagerNote,
      isCeoDirective: currentUser.role === 'ceo' && isCeoDirective,
    });

    sound.playSuccessSound();
    setContent('');
    setReplyToUser(null);
  };

  const handleQuickReply = (text: string) => {
    setContent((prev) => (prev ? `${prev} ${text}` : text));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          بحث‌ها، نظرات و به‌روزرسانی‌های کار ({toPersianDigits(comments.length)})
        </h4>
        {currentUser.role === 'ceo' ? (
          <span className="text-xs bg-amber-500 text-slate-950 px-3 py-1 rounded-full font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20">
            <Crown className="w-4 h-4 text-slate-950" />
            حالت مدیرعامل (CEO Directive)
          </span>
        ) : currentUser.role === 'manager' ? (
          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-amber-300 dark:border-amber-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            حالت نظردهی مدیریت
          </span>
        ) : null}
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">هنوز دیدگاهی برای این وظیفه ثبت نشده است.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              مدیرعامل، مدیر تیم یا کارشناس مربوطه می‌توانند نظرات، رهنمودها و دستورات را اینجا بنویسند.
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isCeo = comment.isCeoDirective || comment.authorRole === 'ceo';
            const isManager = comment.isManagerNote || comment.authorRole === 'manager';

            return (
              <div
                key={comment.id}
                className={`p-3.5 rounded-2xl border transition ${
                  isCeo
                    ? 'bg-gradient-to-r from-amber-100/90 via-amber-50/70 to-yellow-100/60 dark:from-amber-950/50 dark:via-yellow-950/30 dark:to-slate-900 border-amber-400 dark:border-amber-600/80 shadow-md ring-1 ring-amber-400/30'
                    : isManager
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    {comment.authorAvatar ? (
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                        {comment.authorName[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {comment.authorName}
                        </span>
                        {isCeo ? (
                          <span className="text-[10px] bg-linear-to-r from-amber-500 to-yellow-600 text-slate-950 font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                            <Crown className="w-3 h-3 text-slate-950" />
                            دستور مستقیم مدیرعامل (CEO)
                          </span>
                        ) : isManager ? (
                          <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5 shadow-2xs">
                            <Award className="w-3 h-3" />
                            دستور مدیر مجموعه
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium">
                            کارشناس
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {toPersianDigits(comment.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setReplyToUser(comment.authorName)}
                      className="text-slate-400 hover:text-blue-600 p-1 rounded-md transition"
                      title="پاسخ به این نظر"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteComment &&
                      (comment.authorId === currentUser.id ||
                        currentUser.role === 'manager' ||
                        currentUser.role === 'ceo') && (
                        <button
                          type="button"
                          onClick={() => onDeleteComment(comment.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition"
                          title="حذف نظر"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                  </div>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap pr-1 font-normal">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Reply Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[10px] text-slate-400 shrink-0">پاسخ‌های پیشنهادی:</span>
        {quickReplies.map((qr, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickReply(qr)}
            className="text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg whitespace-nowrap transition cursor-pointer"
          >
            {qr}
          </button>
        ))}
      </div>

      {/* Add Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {replyToUser && (
          <div className="flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60">
            <span>
              در حال پاسخ به: <b>{replyToUser}</b>
            </span>
            <button
              type="button"
              onClick={() => setReplyToUser(null)}
              className="text-slate-400 hover:text-rose-500"
            >
              لغو
            </button>
          </div>
        )}

        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              currentUser.role === 'ceo'
                ? 'ثبت دستور یا رهنمود مدیرعامل برای ابلاغ مستقیم به تیم و مدیر...'
                : currentUser.role === 'manager'
                ? 'ثبت رهنمود، بازخورد و دستور مدیریتی پیرامون این وظیفه...'
                : 'نوشتن دیدگاه، گزارش آخرین پیشرفت یا سوال برای مدیر...'
            }
            rows={2}
            className="w-full text-xs p-3 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition resize-none leading-relaxed"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="absolute left-2.5 bottom-3.5 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition"
            title="ارسال دیدگاه"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </div>

        {currentUser.role === 'ceo' ? (
          <label className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 font-bold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCeoDirective}
              onChange={(e) => setIsCeoDirective(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
            />
            ثبت به عنوان «دستور مستقیم و رسمی مدیرعامل (CEO)» با برچسب تاج طلایی
          </label>
        ) : currentUser.role === 'manager' ? (
          <label className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isManagerNote}
              onChange={(e) => setIsManagerNote(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
            />
            ثبت به عنوان «دستور و نظر رسمی مدیر ارشد» با برچسب و قاب طلایی
          </label>
        ) : null}
      </form>
    </div>
  );
};
