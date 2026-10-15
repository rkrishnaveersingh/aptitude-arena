import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { AuthModal } from './components/common/AuthModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ExamsPage } from './pages/ExamsPage';
import { ExamDetailPage } from './pages/ExamDetailPage';
import { PapersPage } from './pages/PapersPage';
import { PracticePage } from './pages/PracticePage';
import { QuizResultPage } from './pages/QuizResultPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { DownloadsPage } from './pages/DownloadsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { toastMessage, user } = useApp();

  // Route state initialized from window location or default '/'
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Keep state synced with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Route Parser
  const renderRoute = () => {
    const [pathOnly, queryString] = currentPath.split('?');
    const searchParams = new URLSearchParams(queryString || '');

    // /exams/:slug
    if (pathOnly.startsWith('/exams/') && pathOnly.length > 7) {
      const slug = pathOnly.replace('/exams/', '');
      return <ExamDetailPage slug={slug} onNavigate={navigate} />;
    }

    // /practice/results/:id
    if (pathOnly.startsWith('/practice/results/')) {
      const attemptId = pathOnly.replace('/practice/results/', '');
      return <QuizResultPage attemptId={attemptId} onNavigate={navigate} />;
    }

    switch (pathOnly) {
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/exams':
        return <ExamsPage onNavigate={navigate} />;
      case '/papers': {
        const examId = searchParams.get('exam') || undefined;
        const yearStr = searchParams.get('year');
        const year = yearStr ? Number(yearStr) : undefined;
        return <PapersPage onNavigate={navigate} initialExamId={examId} initialYear={year} />;
      }
      case '/practice': {
        const examId = searchParams.get('exam') || undefined;
        const subject = searchParams.get('subject') || undefined;
        return <PracticePage onNavigate={navigate} initialExamId={examId} initialSubject={subject} />;
      }
      case '/login': {
        const tabParam = searchParams.get('tab') === 'admin' ? 'admin' : 'student';
        return <LoginPage onNavigate={navigate} initialTab={tabParam} />;
      }
      case '/dashboard':
        if (!user) {
          return <LoginPage onNavigate={navigate} initialTab="student" />;
        }
        if (user.role === 'admin') {
          return (
            <div className="max-w-2xl mx-auto py-16 px-4 text-center">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Administrator Session Active</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  You are currently logged in with coordinator privileges. The student dashboard is reserved for student aspirant accounts.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors">
                    Go to Admin Dashboard
                  </button>
                  <button onClick={() => navigate('/login?tab=student')} className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Switch to Student Account
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return <DashboardPage onNavigate={navigate} />;
      case '/leaderboard':
        return <LeaderboardPage onNavigate={navigate} />;
      case '/bookmarks':
        return <BookmarksPage onNavigate={navigate} />;
      case '/downloads':
        return <DownloadsPage onNavigate={navigate} />;
      case '/profile':
        if (!user) {
          return <LoginPage onNavigate={navigate} initialTab="student" />;
        }
        return <ProfilePage onNavigate={navigate} />;
      case '/admin':
        if (!user || user.role !== 'admin') {
          return (
            <div className="max-w-2xl mx-auto py-16 px-4 text-center">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Privileges Required</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Access to the master management console requires active administrator authentication. Regular students cannot access the admin area.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button onClick={() => navigate('/login?tab=admin')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">
                    Sign In as Administrator
                  </button>
                  <button onClick={() => navigate('/')} className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Return to Home
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return <AdminPage onNavigate={navigate} />;
      case '/about':
        return <AboutPage onNavigate={navigate} />;
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors duration-150">
      {/* Top Navbar */}
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      {/* Main Page Content */}
      <main className="flex-1">
        {renderRoute()}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigate} />

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal onNavigate={navigate} />

      {/* User Login/Register Modal */}
      <AuthModal />

      {/* Subtle Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700/60 dark:border-slate-200">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
