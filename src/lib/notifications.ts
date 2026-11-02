/**
 * Web Browser Notification API utilities
 */
import { Task } from '../types';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

export function sendTaskBrowserNotification(
  task: Task,
  onClick?: () => void
): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const title = `⏰ هشدار سررسید: ${task.title}`;
    const body = `مسئول: ${task.assigneeName} | سررسید خورشیدی: ${task.jalaliDueDate}\n${task.description || 'زمان پیگیری این وظیفه فرا رسیده است.'}`;

    const notification = new Notification(title, {
      body,
      dir: 'rtl',
      lang: 'fa',
      tag: `rcg-task-${task.id}-${Date.now()}`,
      requireInteraction: true,
      silent: false,
    });

    notification.onclick = () => {
      try {
        window.focus();
      } catch (e) {
        // window focus may be restricted in some iframe contexts
      }
      if (onClick) onClick();
      notification.close();
    };

    return notification;
  } catch (err) {
    console.error('Failed to trigger native browser notification:', err);
    return null;
  }
}

export function sendGeneralBrowserNotification(
  title: string,
  body: string,
  onClick?: () => void
): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      body,
      dir: 'rtl',
      lang: 'fa',
      tag: `rcg-alert-${Date.now()}`,
      silent: false,
    });

    notification.onclick = () => {
      try {
        window.focus();
      } catch (e) {}
      if (onClick) onClick();
      notification.close();
    };

    return notification;
  } catch (err) {
    console.error('Failed to trigger native notification:', err);
    return null;
  }
}
