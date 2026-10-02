import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Flame, 
  Target, 
  Clock, 
  Award, 
  FileText, 
  Bookmark, 
  RotateCcw, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StreakHeatmap } from '../components/dashboard/StreakHeatmap';
import { StatsCard } from '../components/common/StatsCard';
import { PaperCard } from '../components/cards/PaperCard';
import { PaperPreviewModal } from '../components/common/PaperPreviewModal';
import { EmptyState } from '../components/common/EmptyState';
import { QuizAttempt, Paper } from '../types';
import { examService } from '../services/examService';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, exams, papers, setActiveQuizConfig, setLastQuizResult, openAuthModal } = useApp();
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [previewPaper, setPreviewPaper] = useState<Paper | null>(null);

  useEffect(() => {
    examService.getQuizHistory().then(setQuizHistory);
  }, []);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <EmptyState
          title="Sign in to Access Your Dashboard"
          description="Track your daily study streaks, performance analytics, and saved bookmarks by logging in."
          actionText="Sign In Now"
          onAction={() => openAuthModal('login')}
        />
      </div>
    );
  }

  // Study hours formatted
  const studyHours = (user.totalStudyMinutes / 60).toFixed(1);

  // Saved papers
  const savedPapers = papers.filter(p => user.bookmarks.paperIds.includes(p.id));

  const handleStartPaperPractice = (paper: Paper) => {
    setActiveQuizConfig({
      examId: paper.examId,
      examName: paper.examName,
      subjectName: paper.subjectName,
      paperId: paper.id,
      questionCount: Math.min(20, paper.totalQuestions),
      difficulty: paper.difficulty,
      timeLimitMinutes: paper.durationMinutes,
    });
    onNavigate('/practice');
  };

  const handleViewAttempt = (attempt: QuizAttempt) => {
    setLastQuizResult(attempt);
    onNavigate(`/practice/results/${attempt.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Candidate Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Target Focus: <span className="font-semibold text-slate-700 dark:text-slate-300">{user.targetExam}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/practice')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Continue Practice</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid with Tabular Numerals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Questions Solved"
          value={user.totalQuestionsSolved}
          subtext="Across all competitive tests"
          icon={<Target className="w-4 h-4" />}
          trend={{ positive: true, label: '+18 today' }}
        />
        <StatsCard
          label="Simulated Tests Taken"
          value={user.totalQuizzesTaken}
          subtext="Full-length & subject tests"
          icon={<FileText className="w-4 h-4" />}
        />
        <StatsCard
          label="Average Accuracy"
          value={`${user.averageAccuracy}%`}
          subtext="Target goal is 85%+"
          icon={<TrendingUp className="w-4 h-4" />}
          trend={{ positive: true, label: '+2.4%' }}
        />
        <StatsCard
          label="Total Study Time"
          value={`${studyHours} hrs`}
          subtext={`${user.totalStudyMinutes} active minutes`}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Streak System Heatmap Widget */}
      <StreakHeatmap user={user} />

      {/* Two Column Section: Recent Activity / Quiz History (Left) + Recommended Practice (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Quiz History */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Practice History
            </h2>
            <button
              onClick={() => onNavigate('/practice')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Start New Test →
            </button>
          </div>

          {quizHistory.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center bg-slate-50/50 dark:bg-slate-900/50">
              <p className="text-xs text-slate-500 mb-3">You haven't completed any quizzes yet.</p>
              <button
                onClick={() => onNavigate('/practice')}
                className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                Take First Practice Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {quizHistory.slice(0, 5).map(attempt => (
                <div
                  key={attempt.id}
                  onClick={() => handleViewAttempt(attempt)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <span>{attempt.quizConfig.examName}</span>
                      <span>·</span>
                      <span className="font-normal text-slate-500">
                        {attempt.quizConfig.subjectName || 'All Topics'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(attempt.submittedAt).toLocaleDateString()} · {attempt.questions.length} Questions ·{' '}
                      {Math.round(attempt.timeSpentSeconds / 60)} mins
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {attempt.score} marks
                    </div>
                    <div
                      className={`text-xs font-semibold tabular-nums ${
                        attempt.accuracy >= 80
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : attempt.accuracy >= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {attempt.accuracy}% accuracy
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recommended Exams & Saved Papers */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recommended Exams */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Recommended for Your Goals
            </h3>
            <div className="space-y-2.5">
              {exams.slice(0, 2).map(exam => (
                <div
                  key={exam.id}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {exam.name} ({exam.category})
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      {exam.paperCount} official papers · {exam.questionCount}+ questions
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate(`/exams/${exam.slug}`)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    title="View Exam"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Papers Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Bookmarked Papers ({savedPapers.length})
              </h3>
              <button
                onClick={() => onNavigate('/bookmarks')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all →
              </button>
            </div>

            {savedPapers.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400">
                No bookmarked papers yet.
              </div>
            ) : (
              <div className="space-y-2">
                {savedPapers.slice(0, 2).map(paper => (
                  <div
                    key={paper.id}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {paper.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {paper.examName} · Year {paper.year}
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartPaperPractice(paper)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded hover:bg-indigo-100 transition-colors shrink-0"
                    >
                      Practice
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <PaperPreviewModal
        paper={previewPaper}
        onClose={() => setPreviewPaper(null)}
        onStartPractice={handleStartPaperPractice}
      />
    </div>
  );
};
