/**
 * RCG Marketing Hub - مدیریت وظایف، مسئولیت‌ها و داشبورد بازدهی مارکتینگ
 * @license Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  MarketingReport,
  Task,
  TaskCategory,
  TaskComment,
  TaskPriority,
  TaskStatus,
  UserProfile,
} from './types';
import { INITIAL_COMMENTS, INITIAL_TASKS, TEAM_MEMBERS } from './lib/constants';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import {
  exportReportToGoogleSheets,
  getAccessToken,
  googleSignIn,
  initAuth,
  logout,
  syncTaskToGoogleCalendar,
  syncTaskToGoogleTasks,
} from './lib/workspace';
import { Sidebar, NavView } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { KanbanBoard } from './components/KanbanBoard';
import { MyTasksView } from './components/MyTasksView';
import { JalaliCalendarView } from './components/JalaliCalendarView';
import { ManagerDashboard } from './components/ManagerDashboard';
import { PeriodicReports } from './components/PeriodicReports';
import { TaskModal } from './components/TaskModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { TeamManagementModal } from './components/TeamManagementModal';
import { LoginModal } from './components/LoginModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ReminderNotification } from './components/ReminderNotification';
import { sound } from './lib/sound';
import { getCurrentJalaliDate, formatJalaliDate, toEnglishDigits } from './lib/jalali';
import { sendTaskBrowserNotification } from './lib/notifications';

export default function App() {
  // Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('rcg_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rcg_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rcg_theme', 'light');
    }
  }, [isDark]);

  // Team Members State (Loaded from localStorage or initial constants)
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('rcg_team_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing team members from storage', e);
      }
    }
    return TEAM_MEMBERS;
  });

  useEffect(() => {
    localStorage.setItem('rcg_team_members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Current Active User
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedId = localStorage.getItem('rcg_user_id');
    const found = teamMembers.find((m) => m.id === savedId);
    return found || teamMembers[0] || TEAM_MEMBERS[0];
  });

  // Login Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('rcg_is_logged_in') !== 'false';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const handleUserChange = (u: UserProfile) => {
    setCurrentUser(u);
    localStorage.setItem('rcg_user_id', u.id);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('rcg_user_id', user.id);
    localStorage.setItem('rcg_is_logged_in', 'true');
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('rcg_is_logged_in', 'false');
    setIsLoginModalOpen(true);
  };

  const handleSaveMember = (member: UserProfile) => {
    const exists = teamMembers.some((m) => m.id === member.id);
    let updated: UserProfile[];
    if (exists) {
      updated = teamMembers.map((m) => (m.id === member.id ? member : m));
    } else {
      updated = [...teamMembers, member];
    }
    setTeamMembers(updated);
    if (currentUser.id === member.id) {
      setCurrentUser(member);
    }
    sound.playSuccessSound();
  };

  const handleDeleteMember = (memberId: string) => {
    const fallbackManager =
      teamMembers.find((m) => m.role === 'manager' && m.id !== memberId) || TEAM_MEMBERS[0];
    
    // Reassign orphan tasks to senior manager
    setTasks((prev) =>
      prev.map((t) =>
        t.assigneeId === memberId
          ? {
              ...t,
              assigneeId: fallbackManager.id,
              assigneeName: fallbackManager.name,
              assigneeAvatar: fallbackManager.avatar,
            }
          : t
      )
    );

    const updated = teamMembers.filter((m) => m.id !== memberId);
    setTeamMembers(updated);
    if (currentUser.id === memberId) {
      setCurrentUser(fallbackManager);
    }
    sound.playSuccessSound();
  };

  // View Navigation (defaulting to 'dashboard' as requested by user)
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string | 'all'>('all');

  // Dialog & Modal Toggles
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Task & Comment States (Local + Cloud Sync)
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('rcg_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing cached tasks', e);
      }
    }
    return INITIAL_TASKS;
  });

  const [commentsMap, setCommentsMap] = useState<Record<string, TaskComment[]>>(() => {
    const saved = localStorage.getItem('rcg_comments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing cached comments', e);
      }
    }
    return INITIAL_COMMENTS;
  });

  const [reports, setReports] = useState<MarketingReport[]>(() => {
    const saved = localStorage.getItem('rcg_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing cached reports', e);
      }
    }
    return [
      {
        id: 'rep-init-1',
        title: 'گزارش هفتگی واحد دیجیتال مارکتینگ - هفته اول آبان',
        period: 'weekly',
        authorId: 'user_manager',
        authorName: 'مسعود صیدگر',
        authorRole: 'مدیر ارشد بازاریابی دیجیتال (CMO)',
        dateRange: '۱۴۰۴/۰۸/۰۱ تا ۱۴۰۴/۰۸/۰۸',
        metrics: {
          totalTasks: 6,
          completedTasks: 2,
          inProgressTasks: 2,
          completionRate: 33,
          totalEstimatedHours: 64,
          totalActualHours: 27,
        },
        summary:
          'کمپین گوگل ادز با موفقیت بررسی اولیه شد و ست بنرهای جشنواره تخفیف در مرحله ۶۵٪ است. هماهنگی نمایشگاه الکامپ به عنوان وظیفه بحرانی وارد فاز اجرایی شد.',
        achievements: ['بهینه‌سازی اولیه هزینه‌های ادز', 'طراحی تمپلیت خبرنامه'],
        challenges: ['تایید بودجه نمایشگاه الکامپ'],
        nextSteps: ['شروع تست A/B بنرها', 'بهبود Core Web Vitals'],
        createdAt: '۱۴۰۴/۰۸/۰۸',
      },
    ];
  });

  // Local Storage Sync
  useEffect(() => {
    localStorage.setItem('rcg_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('rcg_comments', JSON.stringify(commentsMap));
  }, [commentsMap]);

  useEffect(() => {
    localStorage.setItem('rcg_reports', JSON.stringify(reports));
  }, [reports]);

  // Google Workspace User State
  const [googleUser, setGoogleUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
      }
    } catch (e) {
      console.error('Google Sign In error:', e);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setGoogleUser(null);
    } catch (e) {
      console.error('Sign Out error:', e);
    }
  };

  // Firestore Sync Listeners (When Authenticated)
  useEffect(() => {
    if (!auth.currentUser) return;

    const unsub = onSnapshot(
      collection(db, 'tasks'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteTasks: Task[] = [];
          snapshot.forEach((docSnap) => {
            remoteTasks.push(docSnap.data() as Task);
          });
          setTasks(remoteTasks);
        }
      },
      (error) => {
        console.warn('Firestore snapshot note:', error);
      }
    );

    return () => unsub();
  }, [googleUser]);

  // Reset Data Handler
  const handleResetData = () => {
    setTasks(INITIAL_TASKS);
    setCommentsMap(INITIAL_COMMENTS);
    setTeamMembers(TEAM_MEMBERS);
    localStorage.removeItem('rcg_tasks');
    localStorage.removeItem('rcg_comments');
    localStorage.removeItem('rcg_team_members');
    sound.playSuccessSound();
    setIsSettingsModalOpen(false);
  };

  // Confirmation Modal State (MANDATORY for Workspace Destructive/Mutating operations)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Alarm & Reminders Check Engine
  const [activeAlarm, setActiveAlarm] = useState<Task | null>(null);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentJalali = getCurrentJalaliDate();
      const currentFormattedDate = formatJalaliDate(currentJalali);
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHour}:${currentMinute}`;

      tasks.forEach((task) => {
        if (task.reminderDateTime && !task.reminderTriggered) {
          const [remDate, remTime] = toEnglishDigits(task.reminderDateTime).split(' ');
          if (remDate === currentFormattedDate && remTime === currentTimeStr) {
            setActiveAlarm(task);
            sound.playAlarmChime();
            sendTaskBrowserNotification(task, () => handleSelectTask(task));

            setTasks((prev) =>
              prev.map((t) => (t.id === task.id ? { ...t, reminderTriggered: true } : t))
            );
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 25000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Task Handlers
  const handleOpenNewTask = (status: TaskStatus = 'todo', prefillDate?: string) => {
    const todayJalali = prefillDate || formatJalaliDate(getCurrentJalaliDate());

    const emptyTask: Task = {
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      category: 'campaigns',
      priority: 'medium',
      status,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      assigneeId: currentUser.id,
      assigneeName: currentUser.name,
      assigneeAvatar: currentUser.avatar,
      jalaliDueDate: todayJalali,
      progress: 0,
      estimatedHours: 4,
      actualHours: 0,
      tags: [],
      attachments: [],
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingTask(emptyTask);
    setIsTaskModalOpen(true);
  };

  const handleSelectTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return;

    // RBAC Check: Only creator, assignee, or senior manager can modify task
    const isNew = !tasks.some((t) => t.id === editingTask.id);
    if (
      !isNew &&
      currentUser.role !== 'manager' &&
      editingTask.assigneeId !== currentUser.id &&
      editingTask.creatorId !== currentUser.id
    ) {
      alert('شما مجاز به تغییر اطلاعات این وظیفه نیستید. تغییرات فقط توسط مجری یا مدیر ارشد امکان‌پذیر است.');
      return;
    }

    const updatedTask: Task = {
      ...editingTask,
      ...taskData,
      updatedAt: new Date().toISOString(),
    } as Task;

    if (isNew) {
      setTasks([updatedTask, ...tasks]);
    } else {
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    }

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'tasks', updatedTask.id), updatedTask);
      }
    } catch (e) {
      console.warn('Saved locally');
    }

    setIsTaskModalOpen(false);
    setEditingTask(null);
    sound.playSuccessSound();
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (target && currentUser.role !== 'manager' && target.creatorId !== currentUser.id) {
      alert('تنها ایجادکننده وظیفه و مدیر ارشد مجاز به حذف وظیفه هستند.');
      return;
    }

    setConfirmationModal({
      isOpen: true,
      title: 'حذف این وظیفه از سیستم؟',
      message: 'آیا از حذف کامل این وظیفه اطمینان دارید؟ تمام فایل‌های ضمیمه و نظرات مرتبط حذف خواهند شد.',
      isDestructive: true,
      confirmLabel: 'بله، حذف شود',
      onConfirm: async () => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        try {
          if (auth.currentUser) {
            await deleteDoc(doc(db, 'tasks', taskId));
          }
        } catch (e) {
          console.warn('Deleted locally.');
        }
        setIsTaskModalOpen(false);
        setEditingTask(null);
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (
      targetTask &&
      currentUser.role !== 'manager' &&
      targetTask.assigneeId !== currentUser.id
    ) {
      alert('شما تنها مجاز به تغییر وضعیت وظایف محوله به خودتان هستید.');
      return;
    }

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newProgress = newStatus === 'completed' ? 100 : t.progress;
          return {
            ...t,
            status: newStatus,
            progress: newProgress,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, 'tasks', taskId), {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      // Local state is updated
    }
  };

  // Comment Handlers
  const handleAddComment = (commentData: Omit<TaskComment, 'id' | 'createdAt'>) => {
    const todayJalali = formatJalaliDate(getCurrentJalaliDate(), { withTime: true });
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const fullCreatedAt = `${todayJalali} ${timeStr}`;

    const newComment: TaskComment = {
      ...commentData,
      id: `comm-${Date.now()}`,
      createdAt: fullCreatedAt,
    };

    const targetTaskId = commentData.taskId;
    const existing = commentsMap[targetTaskId] || [];
    const updated = [newComment, ...existing];

    setCommentsMap({
      ...commentsMap,
      [targetTaskId]: updated,
    });

    setTasks((prev) =>
      prev.map((t) => (t.id === targetTaskId ? { ...t, commentsCount: updated.length } : t))
    );
  };

  const handleDeleteComment = (commentId: string) => {
    if (!editingTask) return;
    const targetTaskId = editingTask.id;
    const existing = commentsMap[targetTaskId] || [];
    const updated = existing.filter((c) => c.id !== commentId);

    setCommentsMap({
      ...commentsMap,
      [targetTaskId]: updated,
    });

    setTasks((prev) =>
      prev.map((t) => (t.id === targetTaskId ? { ...t, commentsCount: updated.length } : t))
    );
  };

  // Report Handlers
  const handleSaveReport = (newReport: MarketingReport) => {
    setReports([newReport, ...reports]);
  };

  // Google Workspace API Handlers with Confirmation Modals
  const handleExportToGoogleSheets = (report: MarketingReport) => {
    setConfirmationModal({
      isOpen: true,
      title: 'خروجی به Google Sheets',
      message: `آیا مایلید سند جدید شامل شاخص‌های عملکردی و فهرست وظایف گزارش «${report.title}» در Google Drive شما ایجاد شود؟`,
      confirmLabel: 'تایید و صدور شیت',
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
        try {
          let token = await getAccessToken();
          if (!token) {
            const loginRes = await googleSignIn();
            token = loginRes?.accessToken || null;
          }

          if (!token) {
            alert('لطفاً ابتدا با حساب گوگل وارد شوید.');
            return;
          }

          const res = await exportReportToGoogleSheets(token, report, tasks);
          setReports((prev) =>
            prev.map((r) =>
              r.id === report.id
                ? { ...r, exportedToSheets: true, sheetsUrl: res.spreadsheetUrl }
                : r
            )
          );

          window.open(res.spreadsheetUrl, '_blank');
          sound.playSuccessSound();
        } catch (err: any) {
          console.error('Sheets export error:', err);
          alert(`خطا در ایجاد گوگل شیت: ${err.message || 'لطفاً دسترسی را بررسی نمایید'}`);
        }
      },
    });
  };

  const handleSyncToGoogleCalendar = (task: Task) => {
    setConfirmationModal({
      isOpen: true,
      title: 'ثبت در تقویم گوگل (Google Calendar)',
      message: `آیا مایلید رویداد و ددلاین وظیفه «${task.title}» برای سررسید ${task.jalaliDueDate} با هشدارهای ۳۰ دقیقه قبل در تقویم گوگل شما ثبت شود؟`,
      confirmLabel: 'ثبت رویداد در تقویم',
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
        try {
          let token = await getAccessToken();
          if (!token) {
            const loginRes = await googleSignIn();
            token = loginRes?.accessToken || null;
          }
          if (!token) {
            alert('لطفاً ابتدا با حساب گوگل وارد شوید.');
            return;
          }

          const res = await syncTaskToGoogleCalendar(token, task);
          if (res.htmlLink) {
            window.open(res.htmlLink, '_blank');
          }
          sound.playSuccessSound();
        } catch (err: any) {
          console.error('Calendar sync error:', err);
          alert(`خطا در ثبت تقویم گوگل: ${err.message}`);
        }
      },
    });
  };

  const handleSyncToGoogleTasks = (task: Task) => {
    setConfirmationModal({
      isOpen: true,
      title: 'افزودن به گوگل تسک (Google Tasks)',
      message: `آیا مایلید وظیفه «${task.title}» به همراه توضیحات و ددلاین به لیست Google Tasks حساب شما اضافه گردد؟`,
      confirmLabel: 'افزودن به Google Tasks',
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
        try {
          let token = await getAccessToken();
          if (!token) {
            const loginRes = await googleSignIn();
            token = loginRes?.accessToken || null;
          }
          if (!token) {
            alert('لطفاً ابتدا با حساب گوگل وارد شوید.');
            return;
          }

          await syncTaskToGoogleTasks(token, task);
          sound.playSuccessSound();
          alert('وظیفه با موفقیت به Google Tasks شما افزوده شد!');
        } catch (err: any) {
          console.error('Tasks sync error:', err);
          alert(`خطا در افزودن به Google Tasks: ${err.message}`);
        }
      },
    });
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
      if (selectedAssignee !== 'all' && t.assigneeId !== selectedAssignee) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesAssignee = t.assigneeName?.toLowerCase().includes(q);
        const matchesTags = t.tags?.some((tag) => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesAssignee && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, selectedCategory, selectedPriority, selectedAssignee, searchQuery]);

  // Upcoming Reminders & My Tasks count
  const upcomingReminders = useMemo(() => {
    return tasks.filter((t) => Boolean(t.reminderDateTime) && !t.reminderTriggered);
  }, [tasks]);

  const myTasksCount = useMemo(() => {
    return tasks.filter((t) => t.assigneeId === currentUser.id && t.status !== 'completed').length;
  }, [tasks, currentUser.id]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-['Vazirmatn',sans-serif]">
      {/* Persian Minimal Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        currentUser={currentUser}
        onChangeUser={handleUserChange}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenNewTaskModal={() => handleOpenNewTask()}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        onLogout={handleLogout}
        googleUser={googleUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        activeRemindersCount={upcomingReminders.length}
        myTasksCount={myTasksCount}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          selectedAssignee={selectedAssignee}
          onAssigneeChange={setSelectedAssignee}
          onOpenNewTaskModal={() => handleOpenNewTask()}
          upcomingReminders={upcomingReminders}
          onSelectTask={handleSelectTask}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* View Switcher Container with bottom padding for mobile bar */}
        <div className="flex-1 pb-24 md:pb-12">
          {currentView === 'dashboard' && (
            <ManagerDashboard
              tasks={tasks}
              onSelectTask={handleSelectTask}
              onOpenTaskComments={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onNavigateToReports={() => setCurrentView('reports')}
            />
          )}

          {currentView === 'my_tasks' && (
            <MyTasksView
              tasks={tasks}
              currentUser={currentUser}
              onSelectTask={handleSelectTask}
              onUpdateStatus={handleUpdateStatus}
              onOpenNewTask={() => handleOpenNewTask()}
            />
          )}

          {currentView === 'kanban' && (
            <KanbanBoard
              tasks={filteredTasks}
              onSelectTask={handleSelectTask}
              onUpdateStatus={handleUpdateStatus}
              onQuickAddTask={(status) => handleOpenNewTask(status)}
              currentUser={currentUser}
            />
          )}

          {currentView === 'calendar' && (
            <JalaliCalendarView
              tasks={filteredTasks}
              onSelectTask={handleSelectTask}
              onAddTaskForDate={(jalaliDateStr) => handleOpenNewTask('todo', jalaliDateStr)}
            />
          )}

          {currentView === 'reports' && (
            <PeriodicReports
              tasks={tasks}
              reports={reports}
              currentUser={currentUser}
              onSaveReport={handleSaveReport}
              onRequestExportToSheets={handleExportToGoogleSheets}
            />
          )}
        </div>

        {/* Mobile App Bottom Navigation Bar */}
        <MobileBottomNav
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenNewTask={() => handleOpenNewTask()}
          myTasksCount={myTasksCount}
          remindersCount={upcomingReminders.length}
        />
      </main>

      {/* Task Creation & Detail Modal */}
      {isTaskModalOpen && (
        <TaskModal
          task={editingTask}
          isOpen={isTaskModalOpen}
          currentUser={currentUser}
          comments={editingTask ? commentsMap[editingTask.id] || [] : []}
          teamMembers={teamMembers}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onSyncCalendar={handleSyncToGoogleCalendar}
          onSyncGoogleTasks={handleSyncToGoogleTasks}
        />
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onChangeUser={handleUserChange}
        tasks={tasks}
        googleUser={googleUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        teamMembers={teamMembers}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Senior Manager Team Management Modal */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        teamMembers={teamMembers}
        currentUser={currentUser}
        onSaveMember={handleSaveMember}
        onDeleteMember={handleDeleteMember}
      />

      {/* Login Authentication Modal */}
      <LoginModal
        isOpen={!isLoggedIn || isLoginModalOpen}
        onLogin={handleLogin}
        teamMembers={teamMembers}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onResetData={handleResetData}
      />

      {/* Confirmation Modal for Workspace Operations */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmLabel={confirmationModal.confirmLabel}
        isDestructive={confirmationModal.isDestructive}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Active Alarm / Reminder Toast Popup */}
      <ReminderNotification
        activeAlarm={activeAlarm}
        onDismiss={() => setActiveAlarm(null)}
        onOpenTask={handleSelectTask}
      />
    </div>
  );
}
