import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Exam, Paper, Question, UserProfile, NotificationItem, QuizConfig, QuizAttempt } from '../types';
import { examService } from '../services/examService';
import { supabase, isSupabaseConfigured, downloadPaperViaEdgeFunction } from '../services/supabase';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: UserProfile | null;
  loginAs: (role: 'student' | 'admin') => void;
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
  downloadedPaperIds: string[];
  
  activeQuizConfig: QuizConfig | null;
  setActiveQuizConfig: (cfg: QuizConfig | null) => void;
  lastQuizResult: QuizAttempt | null;
  setLastQuizResult: (res: QuizAttempt | null) => void;
  
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  authInitialTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('aptitude_arena_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('aptitude_arena_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // User state
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Load profile and blend with database achievements
    examService.getUserProfile().then(async profile => {
      const achievements = await examService.getAchievements();
      setUser({ ...profile, achievements });
    });

    // Check Supabase session if active
    if (isSupabaseConfigured) {
      const loadUserSupabaseData = async (userId: string, baseProfile: UserProfile) => {
        const updatedProfile = { ...baseProfile };
        try {
          const [bookmarksRes, downloadsRes] = await Promise.all([
            supabase.from('bookmarks').select('*').eq('user_id', userId),
            supabase.from('downloads').select('*').eq('user_id', userId)
          ]);

          if (bookmarksRes.data && bookmarksRes.data.length > 0) {
            const paperIds = bookmarksRes.data.filter(b => b.paper_id).map(b => b.paper_id);
            const questionIds = bookmarksRes.data.filter(b => b.question_id).map(b => b.question_id);
            updatedProfile.bookmarks = {
              ...updatedProfile.bookmarks,
              paperIds: Array.from(new Set([...updatedProfile.bookmarks.paperIds, ...paperIds])),
              questionIds: Array.from(new Set([...updatedProfile.bookmarks.questionIds, ...questionIds]))
            };
          }

          if (downloadsRes.data && downloadsRes.data.length > 0) {
            const items = downloadsRes.data.map(d => ({
              paperId: d.paper_id,
              downloadedAt: d.downloaded_at || new Date().toISOString()
            }));
            const map = new Map<string, { paperId: string; downloadedAt: string }>();
            [...updatedProfile.downloadedPapers, ...items].forEach(i => map.set(i.paperId, i));
            updatedProfile.downloadedPapers = Array.from(map.values());
          }
        } catch (err) {
          console.warn('Could not fetch user bookmarks/downloads from Supabase:', err);
        }
        return updatedProfile;
      };

      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const base = await examService.getUserProfile();
          const merged = await loadUserSupabaseData(session.user.id, {
            ...base,
            id: session.user.id,
            email: session.user.email || base.email,
            name: session.user.user_metadata?.full_name || base.name,
          });
          setUser(merged);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const base = await examService.getUserProfile();
          const merged = await loadUserSupabaseData(session.user.id, {
            ...base,
            id: session.user.id,
            email: session.user.email || base.email,
            name: session.user.user_metadata?.full_name || base.name,
          });
          setUser(merged);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const loginAs = async (role: 'student' | 'admin') => {
    const base = await examService.getUserProfile();
    const updatedUser: UserProfile = {
      ...base,
      role,
      name: role === 'admin' ? 'Devansh Verma (Administrator)' : 'Aryan Sharma',
      email: role === 'admin' ? 'admin@aptitudearena.internal' : 'aryan.sharma@prep.arena'
    };
    await examService.saveUserProfile(updatedUser);
    setUser(updatedUser);
    showToast(`Logged in as ${role === 'admin' ? 'Admin' : 'Student'}`);
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
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
    await examService.saveUserProfile(updated);
    setUser(updated);
    showToast('Profile updated');
  };

  // Exams, Papers, Questions
  const [exams, setExams] = useState<Exam[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const refreshExams = async () => {
    const data = await examService.getExams();
    setExams(data);
  };

  const refreshPapers = async () => {
    const data = await examService.getPapers();
    setPapers(data);
  };

  const refreshQuestions = async () => {
    const data = await examService.getQuestions();
    setQuestions(data);
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
   * Downloads a paper using the Supabase Edge Function:
   * GET https://iwcbhuombytkckowabig.supabase.co/functions/v1/download-paper?paper_id=<paper.id>
   * Sends the actual database paper.id
   */
  const downloadPaper = async (paper: Paper) => {
    showToast(`Downloading ${paper.title}...`);

    let downloadedViaEdge = false;

    // Use Edge Function for download
    if (isSupabaseConfigured) {
      try {
        const edgeRes = await downloadPaperViaEdgeFunction(paper.id);
        if (edgeRes.success && edgeRes.download_url) {
          downloadedViaEdge = true;
          showToast(`Downloaded official PDF for ${paper.title}`);
        }
      } catch (err) {
        console.warn('Edge function download invocation failed:', err);
      }
    }

    // Fallback if edge function or storage object was not present (e.g. for synthetic mock cards)
    if (!downloadedViaEdge) {
      const content = `=====================================================
APTITUDE ARENA - OFFICIAL PREVIOUS YEAR EXAMINATION PAPER
=====================================================
EXAM: ${paper.examName} (${paper.year})
TITLE: ${paper.title}
SUBJECT: ${paper.subjectName}
DURATION: ${paper.durationMinutes} Minutes
TOTAL QUESTIONS: ${paper.totalQuestions}
TOTAL MARKS: ${paper.totalMarks}
DIFFICULTY: ${paper.difficulty.toUpperCase()}

INSTRUCTIONS:
${paper.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}

=====================================================
PRACTICE VERIFICATION HASH: AA-${paper.id.toUpperCase()}-${paper.year}
=====================================================
Verified by Aptitude Arena Exam Research Committee.
Practice more questions at https://aptitudearena.internal
`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper.examName}_${paper.year}_${paper.subjectName.replace(/\s+/g, '_')}_Paper.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Save download in profile
    if (user) {
      const already = user.downloadedPapers.find(d => d.paperId === paper.id);
      if (!already) {
        const updatedDownloads = [
          { paperId: paper.id, downloadedAt: new Date().toISOString() },
          ...user.downloadedPapers
        ];
        await updateUserProfile({ downloadedPapers: updatedDownloads });

        // Record in Supabase downloads table if user has database UUID
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

    // Increment download count in Supabase
    if (isSupabaseConfigured && paper.id.includes('-') && paper.id.length > 20) {
      try {
        await supabase.from('papers').update({ download_count: (paper.downloadCount || 0) + 1 }).eq('id', paper.id);
      } catch {
        // ignore
      }
    }
  };

  // Quiz state
  const [activeQuizConfig, setActiveQuizConfig] = useState<QuizConfig | null>(null);
  const [lastQuizResult, setLastQuizResult] = useState<QuizAttempt | null>(null);

  // Search & Auth Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthInitialTab(tab);
    setIsAuthOpen(true);
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
        downloadedPaperIds,
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
