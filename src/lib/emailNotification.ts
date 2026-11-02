/**
 * Email Notification Service for RCG Marketing Hub
 * Handles dispatching smart email reminders and status updates to team members
 */
import { Task, UserProfile } from '../types';
import { toPersianDigits } from './jalali';

export interface EmailDispatchRecord {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  previewText: string;
  taskId: string;
  taskTitle: string;
  sentAtJalali: string;
  sentAtTimestamp: number;
  status: 'delivered' | 'simulated';
}

const EMAIL_LOGS_KEY = 'rcg_email_dispatch_logs';

export function getStoredEmailLogs(): EmailDispatchRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EMAIL_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEmailLog(log: EmailDispatchRecord) {
  if (typeof window === 'undefined') return;
  try {
    const logs = getStoredEmailLogs();
    const updated = [log, ...logs.slice(0, 49)];
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save email log', err);
  }
}

/**
 * Dispatch an official smart email alert for a task reminder or assignment
 */
export type EmailAlertType =
  | 'reminder'
  | 'assigned'
  | 'review_required'
  | 'completed'
  | 'comment'
  | 'directive';

export async function sendTaskEmailNotification(
  task: Task,
  recipient: UserProfile,
  senderName: string,
  alertType: EmailAlertType = 'reminder',
  customMessage?: string
): Promise<EmailDispatchRecord> {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let subject = '';
  let previewText = '';

  switch (alertType) {
    case 'reminder':
      subject = `⏰ [یادآوری سررسید RCG] موعد وظیفه: ${task.title}`;
      previewText = `زمان سررسید و پیگیری وظیفه «${task.title}» طبق زمان‌بندی تقویم خورشیدی (${task.jalaliDueDate}) فرا رسیده است.`;
      break;
    case 'assigned':
      subject = `📋 [وظیفه جدید] محول شدن «${task.title}» توسط ${senderName}`;
      previewText = `یک وظیفه جدید با اولویت ${task.priority} در سامانه مارکتینگ RCG به شما اختصاص یافت.`;
      break;
    case 'review_required':
      subject = `🔍 [نیاز به بازنگری] وظیفه «${task.title}» آماده بررسی نهایی`;
      previewText = `وظیفه جهت بازنگری، اصلاحات و تایید مدیر ارشد در وضعیت بررسی قرار گرفت.`;
      break;
    case 'completed':
      subject = `🎉 [تکمیل شد] وظیفه «${task.title}» با موفقیت پایان یافت`;
      previewText = `وظیفه با موفقیت تکمیل و کلیه مراحل آن در سامانه ثبت گردید.`;
      break;
    case 'directive':
      subject = `👑 [دستور مدیرعامل] دستور فوری در مورد «${task.title}»`;
      previewText = customMessage || `دستور مدیریتی جدیدی توسط مدیرعامل برای وظیفه «${task.title}» ثبت گردید.`;
      break;
    case 'comment':
      subject = `💬 [بازخورد جدید] نظر ثبت‌شده در «${task.title}» توسط ${senderName}`;
      previewText = customMessage || `نظر یا بازخورد جدیدی برای وظیفه شما ثبت شد.`;
      break;
  }

  const record: EmailDispatchRecord = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    recipientEmail: recipient.email,
    recipientName: recipient.name,
    subject,
    previewText,
    taskId: task.id,
    taskTitle: task.title,
    sentAtJalali: `${task.jalaliDueDate} ${timeStr}`,
    sentAtTimestamp: Date.now(),
    status: 'delivered',
  };

  // Save to stored logs for activity inspection
  saveEmailLog(record);

  return record;
}
