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
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { toastMessage } = useApp();

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
      case '/dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case '/leaderboard':
        return <LeaderboardPage onNavigate={navigate} />;
      case '/bookmarks':
        return <BookmarksPage onNavigate={navigate} />;
      case '/downloads':
        return <DownloadsPage onNavigate={navigate} />;
      case '/profile':
        return <ProfilePage onNavigate={navigate} />;
      case '/admin':
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
