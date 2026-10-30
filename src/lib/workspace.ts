import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { MarketingReport, Task } from '../types';
import { auth } from './firebase';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/tasks',
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      console.warn('Google credential obtained without access token');
    }
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken || '' };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// ==========================================
// 1. Google Sheets API Integration
// ==========================================
export async function exportReportToGoogleSheets(
  accessToken: string,
  report: MarketingReport,
  tasks: Task[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  // Step 1: Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `گزارش بازاریابی دیجیتال RCG - ${report.title} (${report.dateRange})`,
      },
      sheets: [
        {
          properties: {
            title: 'خلاصه و تحلیل عملکرد',
            rightToLeft: true,
          },
        },
        {
          properties: {
            title: 'فهرست وظایف و مسئولیت‌ها',
            rightToLeft: true,
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorJson = await createRes.json();
    throw new Error(errorJson.error?.message || 'خطا در ایجاد گوگل شیت');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Step 2: Append Summary Data
  const summaryValues = [
    ['عنوان گزارش', report.title],
    ['دوره گزارش', report.period],
    ['تهیه کننده', `${report.authorName} (${report.authorRole})`],
    ['بازه زمانی خورشیدی', report.dateRange],
    ['تاریخ ثبت گزارش', report.createdAt],
    [],
    ['شاخص‌های عملکردی کلیدی (KPIs)', 'مقدار'],
    ['کل وظایف دوره', report.metrics.totalTasks],
    ['وظایف تکمیل شده', report.metrics.completedTasks],
    ['وظایف در دست اقدام', report.metrics.inProgressTasks],
    ['نرخ بازدهی و تکمیل', `${report.metrics.completionRate}%`],
    ['مجموع ساعت تخمینی', `${report.metrics.totalEstimatedHours} ساعت`],
    ['مجموع ساعت واقعی ثبت شده', `${report.metrics.totalActualHours} ساعت`],
    [],
    ['خلاصه و شرح دستاوردها:'],
    [report.summary],
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'خلاصه و تحلیل عملکرد'!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: summaryValues }),
    }
  );

  // Step 3: Append Tasks Data
  const taskRows = [
    ['شناسه', 'عنوان وظیفه / کمپین', 'دسته‌بندی', 'اولویت', 'وضعیت', 'مسئول اجرا', 'سررسید خورشیدی', 'درصد پیشرفت', 'ساعت تخمینی', 'ساعت واقعی'],
    ...tasks.map((t) => [
      t.id,
      t.title,
      t.category,
      t.priority,
      t.status,
      t.assigneeName,
      t.jalaliDueDate,
      `${t.progress}%`,
      t.estimatedHours,
      t.actualHours,
    ]),
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'فهرست وظایف و مسئولیت‌ها'!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: taskRows }),
    }
  );

  return { spreadsheetId, spreadsheetUrl };
}

// ==========================================
// 2. Google Calendar API Integration
// ==========================================
export async function syncTaskToGoogleCalendar(
  accessToken: string,
  task: Task
): Promise<{ eventId: string; htmlLink: string }> {
  // Construct event dates
  let startIso: string;
  let endIso: string;

  if (task.dueDate) {
    const d = new Date(task.dueDate);
    startIso = d.toISOString();
    // Default 1 hour duration
    endIso = new Date(d.getTime() + 60 * 60 * 1000).toISOString();
  } else {
    const now = new Date();
    startIso = now.toISOString();
    endIso = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  }

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: `[RCG Marketing] ${task.title}`,
      description: `مسئولیت واحد تبلیغات و دیجیتال مارکتینگ\nدسته‌بندی: ${task.category}\nاولویت: ${task.priority}\nمسئول: ${task.assigneeName}\nددلاین خورشیدی: ${task.jalaliDueDate}\nتوضیحات: ${task.description}`,
      start: { dateTime: startIso },
      end: { dateTime: endIso },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'email', minutes: 120 },
        ],
      },
    }),
  });

  if (!res.ok) {
    const errorJson = await res.json();
    throw new Error(errorJson.error?.message || 'خطا در ثبت رویداد در تقویم گوگل');
  }

  const eventData = await res.json();
  return { eventId: eventData.id, htmlLink: eventData.htmlLink };
}

// ==========================================
// 3. Google Tasks API Integration
// ==========================================
export async function syncTaskToGoogleTasks(
  accessToken: string,
  task: Task
): Promise<{ id: string }> {
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `[RCG] ${task.title}`,
      notes: `دسته‌بندی: ${task.category} | اولویت: ${task.priority} | سررسید خورشیدی: ${task.jalaliDueDate}\n${task.description}`,
      due: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
    }),
  });

  if (!res.ok) {
    const errorJson = await res.json();
    throw new Error(errorJson.error?.message || 'خطا در ثبت وظیفه در گوگل تسک');
  }

  return await res.json();
}
