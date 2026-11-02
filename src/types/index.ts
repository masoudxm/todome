export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type TaskCategory = 
  | 'campaigns' 
  | 'social_media' 
  | 'content_design' 
  | 'seo_web' 
  | 'digital_ads' 
  | 'email_sms' 
  | 'pr_branding' 
  | 'events_sponsorship';

export type UserRole = 'manager' | 'specialist' | 'ceo';

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: UserRole;
  content: string;
  isManagerNote?: boolean;
  isCeoDirective?: boolean;
  isRevisionChecklist?: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  creatorId: string;
  creatorName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  jalaliDueDate: string; // e.g. "1404/08/15"
  dueDate?: string; // ISO string
  reminderDateTime?: string; // e.g. "1404/08/15 14:30"
  reminderTriggered?: boolean;
  sendEmailAlert?: boolean;
  progress: number; // 0 to 100
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  attachments: TaskAttachment[];
  subtasks?: TaskSubtask[];
  budgetToman?: number;
  dependencyTaskId?: string;
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
  googleTaskId?: string;
  googleCalendarEventId?: string;
}

export interface UserActivityItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetTitle: string;
  timestampJalali: string;
  type: 'task_created' | 'status_changed' | 'comment_added' | 'task_completed';
}

export interface UserNotificationPreferences {
  enableSound: boolean;
  enableBrowserPush: boolean;
  enableEmailAlerts: boolean;
  emailAddress?: string;
  reminderMinutesBefore?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar: string;
  department: string;
  title: string;
  isDefault?: boolean;
  createdAt?: string;
  themePreference?: 'dark' | 'light';
  notificationPreferences?: UserNotificationPreferences;
}

export interface MarketingReport {
  id: string;
  title: string;
  period: 'daily' | 'weekly' | 'monthly' | 'campaign';
  authorId: string;
  authorName: string;
  authorRole: string;
  dateRange: string;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    completionRate: number;
    totalEstimatedHours: number;
    totalActualHours: number;
  };
  summary: string;
  achievements: string[];
  challenges: string[];
  nextSteps: string[];
  exportedToSheets?: boolean;
  sheetsUrl?: string;
  createdAt: string;
}

export interface CategoryMeta {
  key: TaskCategory;
  label: string;
  colorHex: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textLight: string;
  textDark: string;
  iconName: string;
}

export interface PriorityMeta {
  key: TaskPriority;
  label: string;
  colorHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}
