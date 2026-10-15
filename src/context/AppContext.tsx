import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Exam, Paper, Question, UserProfile, NotificationItem, QuizConfig, QuizAttempt } from '../types';
import { examService } from '../services/examService';
import { supabase, isSupabaseConfigured, downloadPaperViaEdgeFunction, getPublicStoragePdfUrl } from '../services/supabase';
import { authService } from '../services/authService';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: UserProfile | null;
  loginAs: (role: 'student' | 'admin') => void;
  loginStudent: (email: string, pass: string) => { success: boolean; error?: string };
  registerStudent: (params: { name: string; email: string; password: string; confirmPassword?: string; targetExam?: string }) => { success: boolean; error?: string };
  loginAdmin: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  
  exams: Exam[];
  refreshExams: () => Promise<void>;
  
  papers: Paper[];
  refreshPapers: () => Promise<void>;
  
  questions: Question[];
  refreshQuestions: () => Promise<void>;
  
  notifications: NotificationItem[];
  unreadNotifCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  
  bookmarks: {
    examIds: string[];
    paperIds: string[];
    questionIds: string[];
  };
  toggleBookmark: (type: 'exam' | 'paper' | 'question', id: string) => Promise<void>;
  isBookmarked: (type: 'exam' | 'paper' | 'question', id: string) => boolean;
  
  downloadPaper: (paper: Paper) => void;
  viewPaperPdf: (paper: Paper) => void;
  downloadedPaperIds: string[];
  isBackendConnecting: boolean;
  backendError: string | null;
  
  activeQuizConfig: QuizConfig | null;
  setActiveQuizConfig: (cfg: QuizConfig | null) => void;
  lastQuizResult: QuizAttempt | null;
  setLastQuizResult: (res: QuizAttempt | null) => void;
  
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  authInitialTab: 'student' | 'admin' | 'register';
  openAuthModal: (tab?: 'student' | 'admin' | 'register' | 'login', onAuthenticated?: () => void) => void;
  requireAuth: (action: () => void, promptMessage?: string) => boolean;
  executePendingAction: () => void;
  
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state: robust centralized theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('aptitude_arena_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('aptitude_arena_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // User state: initialized strictly from active session
  const [user, setUser] = useState<UserProfile | null>(() => {
    return authService.getCurrentUser();
  });

  useEffect(() => {
    const active = authService.getCurrentUser();
    if (active) {
      examService.getAchievements().then(achievements => {
        setUser(prev => prev ? { ...prev, achievements } : active);
      });
    } else {
      setUser(null);
    }
  }, []);

  const loginStudent = (email: string, pass: string) => {
    const res = authService.loginStudent(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name.split(' ')[0]}!`);
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid email or password.' };
  };

  const registerStudent = (params: { name: string; email: string; password: string; confirmPassword?: string; targetExam?: string }) => {
    const res = authService.registerStudent(params);
    if (res.success && res.user) {
      setUser(res.user);
      showToast(`Welcome, ${res.user.name.split(' ')[0]}! Account created successfully.`);
      return { success: true };
    }
    return { success: false, error: res.error || 'Registration failed.' };
  };

  const loginAdmin = (email: string, pass: string) => {
    const res = authService.loginAdmin(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
      showToast('Logged in as Administrator');
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid administrator credentials.' };
  };

  const loginAs = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      loginAdmin('admin@aptitudearena.internal', 'krishna@123');
    } else {
      loginStudent('aryan.sharma@prep.arena', 'student@123');
    }
  };

  const logout = () => {
    authService.logout();
    if (isSupabaseConfigured) {
      try {
        supabase.auth.signOut().catch(() => {});
      } catch {
        // ignore
      }
    }
    setUser(null);
    showToast('Logged out successfully');
  };

  const updateUserProfile = async (partial: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...partial };
    authService.saveUserProfile(updated);
    setUser(updated);
    showToast('Profile updated');
  };

  // Exams, Papers, Questions
  const [exams, setExams] = useState<Exam[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isBackendConnecting, setIsBackendConnecting] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  const refreshExams = async () => {
    try {
      setIsBackendConnecting(true);
      const data = await examService.getExams();
      setExams(data);
      setBackendError(null);
    } catch (err: any) {
      console.warn('Backend exams fetch notice:', err);
      setBackendError(err?.message || 'Connecting to backend...');
    } finally {
      setIsBackendConnecting(false);
    }
  };

  const refreshPapers = async () => {
    try {
      const data = await examService.getPapers();
      setPapers(data);
    } catch (err) {
      console.warn('Backend papers fetch notice:', err);
    }
  };

  const refreshQuestions = async () => {
    try {
      const data = await examService.getQuestions();
      setQuestions(data);
    } catch (err) {
      console.warn('Backend questions fetch notice:', err);
    }
  };

  useEffect(() => {
    refreshExams();
    refreshPapers();
    refreshQuestions();
  }, []);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  useEffect(() => {
    examService.getNotifications().then(setNotifications);
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const markNotificationRead = async (id: string) => {
    const updated = await examService.markNotificationAsRead(id);
    setNotifications(updated);
  };

  const markAllNotificationsRead = async () => {
    const updated = await examService.markAllNotificationsAsRead();
    setNotifications(updated);
    showToast('All notifications marked as read');
  };

  // Bookmarks
  const bookmarks = user?.bookmarks || { examIds: [], paperIds: [], questionIds: [] };

  const isBookmarked = (type: 'exam' | 'paper' | 'question', id: string): boolean => {
    if (!user) return false;
    if (type === 'exam') return user.bookmarks.examIds.includes(id);
    if (type === 'paper') return user.bookmarks.paperIds.includes(id);
    if (type === 'question') return user.bookmarks.questionIds.includes(id);
    return false;
  };

  const toggleBookmark = async (type: 'exam' | 'paper' | 'question', id: string) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const currentList = 
      type === 'exam' ? user.bookmarks.examIds :
      type === 'paper' ? user.bookmarks.paperIds :
      user.bookmarks.questionIds;

    const exists = currentList.includes(id);
    const updatedList = exists 
      ? currentList.filter(item => item !== id)
      : [...currentList, id];

    const updatedBookmarks = {
      ...user.bookmarks,
      [type === 'exam' ? 'examIds' : type === 'paper' ? 'paperIds' : 'questionIds']: updatedList
    };

    await updateUserProfile({ bookmarks: updatedBookmarks });

    // Sync with Supabase bookmarks table if user has UUID
    if (isSupabaseConfigured && user.id.includes('-') && user.id.length > 20) {
      try {
        if (!exists && type === 'paper') {
          await supabase.from('bookmarks').insert({ user_id: user.id, paper_id: id });
        } else if (exists && type === 'paper') {
          await supabase.from('bookmarks').delete().match({ user_id: user.id, paper_id: id });
        }
      } catch (err) {
        console.warn('Could not sync bookmark with Supabase:', err);
      }
    }

    showToast(exists ? `Removed from bookmarks` : `Saved to bookmarks`);
  };

  // Downloads
  const downloadedPaperIds = user?.downloadedPapers.map(d => d.paperId) || [];

  /**
   * Opens the official paper PDF in a new browser tab via direct Supabase Public Storage URL.
   * Does NOT route large PDF files through Spring Boot or create empty documents.
   */
  const viewPaperPdf = (paper: Paper) => {
    let targetUrl = paper.pdfUrl;
    if (!targetUrl && paper.filePath && paper.downloadAvailable) {
      targetUrl = getPublicStoragePdfUrl(paper.filePath);
    }

    if (targetUrl) {
      try {
        if (typeof window !== 'undefined' && window.open) {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        } else if (typeof document !== 'undefined') {
          const a = document.createElement('a');
          a.href = targetUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        showToast(`Opening official PDF for ${paper.title}`);
        return;
      } catch (err) {
        console.warn('Could not open PDF viewer window:', err);
      }
    }

    const targetPath = paper.filePath || `${paper.examName.replace(/\s+/g, '-')}/${paper.year}/${paper.title.replace(/\s+/g, '-')}.pdf`;
    showToast(`PDF storage asset for "${paper.title}" is pending upload in Supabase Storage "PYQS PAPER'S" bucket at path: ${targetPath}`);
  };

  /**
   * Downloads official examination paper using public Supabase Storage CDN or Edge Function.
   * If a required file is missing from Supabase Storage, explains the exact status instead of generating fake files.
   */
  const downloadPaper = async (paper: Paper) => {
    if (!user) {
      requireAuth(() => downloadPaper(paper), 'Please sign in or register to download official examination papers.');
      return;
    }

    let targetUrl = paper.pdfUrl;
    if (!targetUrl && paper.filePath && paper.downloadAvailable) {
      targetUrl = getPublicStoragePdfUrl(paper.filePath);
    }

    const recordDownload = async () => {
      if (user) {
        const already = user.downloadedPapers.find(d => d.paperId === paper.id);
        if (!already) {
          const updatedDownloads = [
            { paperId: paper.id, downloadedAt: new Date().toISOString() },
            ...user.downloadedPapers
          ];
          await updateUserProfile({ downloadedPapers: updatedDownloads });

          if (isSupabaseConfigured && user.id.includes('-') && user.id.length > 20 && paper.id.includes('-') && paper.id.length > 20) {
            try {
              await supabase.from('downloads').insert({
                user_id: user.id,
                paper_id: paper.id,
              });
            } catch {
              // ignore
            }
          }
        }
      }

      if (isSupabaseConfigured && paper.id.includes('-') && paper.id.length > 20) {
        try {
          await supabase.from('papers').update({ download_count: (paper.downloadCount || 0) + 1 }).eq('id', paper.id);
        } catch {
          // ignore
        }
      }
    };

    if (targetUrl) {
      showToast(`Initiating download for ${paper.title}...`);
      const safeFilename = `${paper.examName.replace(/\s+/g, '_')}_${paper.year}_${paper.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

      try {
        const response = await fetch(targetUrl);
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = safeFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
          showToast(`Downloaded official PDF: ${safeFilename}`);
          await recordDownload();
          return;
        }
      } catch (blobErr) {
        console.warn('Direct blob fetch failed, falling back to download anchor:', blobErr);
      }

      try {
        const a = document.createElement('a');
        a.href = targetUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.download = safeFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast(`Downloaded official PDF: ${safeFilename}`);
        await recordDownload();
        return;
      } catch (err) {
        console.warn('Direct public storage download failed:', err);
      }
    }

    // Try Supabase edge function if configured
    if (isSupabaseConfigured) {
      try {
        const edgeRes = await downloadPaperViaEdgeFunction(paper.id);
        if (edgeRes.success && edgeRes.download_url) {
          showToast(`Downloaded official PDF for ${paper.title}`);
          await recordDownload();
          return;
        } else if (edgeRes.error) {
          showToast(`Download notice: ${edgeRes.error}`);
          return;
        }
      } catch (err) {
        console.warn('Edge function download invocation failed:', err);
      }
    }

    // Inform user of missing storage asset with exact storage bucket path required
    const targetPath = paper.filePath || `${paper.examName.replace(/\s+/g, '-')}/${paper.year}/${paper.title.replace(/\s+/g, '-')}.pdf`;
    showToast(`PDF document is not yet uploaded to Supabase Storage "PYQS PAPER'S" bucket at path: ${targetPath}`);
  };

  // Quiz state
  const [activeQuizConfig, setActiveQuizConfig] = useState<QuizConfig | null>(null);
  const [lastQuizResult, setLastQuizResult] = useState<QuizAttempt | null>(null);

  // Search & Auth Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'student' | 'admin' | 'register'>('student');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const openAuthModal = (
    tab: 'student' | 'admin' | 'register' | 'login' = 'student',
    onAuthenticated?: () => void
  ) => {
    setAuthInitialTab(tab === 'login' ? 'student' : tab);
    if (onAuthenticated) {
      setPendingAction(() => onAuthenticated);
    }
    setIsAuthOpen(true);
  };

  const requireAuth = (action: () => void, promptMessage?: string): boolean => {
    if (user) {
      action();
      return true;
    }
    if (promptMessage) {
      showToast(promptMessage);
    } else {
      showToast('Please sign in or create an account to continue.');
    }
    openAuthModal('student', action);
    return false;
  };

  const executePendingAction = () => {
    if (pendingAction) {
      const act = pendingAction;
      setPendingAction(null);
      try {
        act();
      } catch (e) {
        console.warn('Failed to execute pending action:', e);
      }
    }
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        loginAs,
        loginStudent,
        registerStudent,
        loginAdmin,
        logout,
        updateUserProfile,
        exams,
        refreshExams,
        papers,
        refreshPapers,
        questions,
        refreshQuestions,
        notifications,
        unreadNotifCount,
        markNotificationRead,
        markAllNotificationsRead,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        downloadPaper,
        viewPaperPdf,
        downloadedPaperIds,
        isBackendConnecting,
        backendError,
        activeQuizConfig,
        setActiveQuizConfig,
        lastQuizResult,
        setLastQuizResult,
        isSearchOpen,
        setIsSearchOpen,
        isAuthOpen,
        setIsAuthOpen,
        authInitialTab,
        openAuthModal,
        requireAuth,
        executePendingAction,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
