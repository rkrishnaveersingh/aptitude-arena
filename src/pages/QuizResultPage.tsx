import React, { useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  RotateCcw, 
  Play, 
  Share2, 
  LayoutDashboard, 
  ArrowLeft,
  Award,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { QuestionCard } from '../components/cards/QuestionCard';
import { EmptyState } from '../components/common/EmptyState';
import { QuizAttempt } from '../types';
import { examService } from '../services/examService';

interface QuizResultPageProps {
  onNavigate: (path: string) => void;
  attemptId?: string;
}

export const QuizResultPage: React.FC<QuizResultPageProps> = ({ onNavigate, attemptId }) => {
  const { lastQuizResult, setActiveQuizConfig, showToast } = useApp();
  const [attempt, setAttempt] = React.useState<QuizAttempt | null>(lastQuizResult);

  useEffect(() => {
    if (lastQuizResult) {
      setAttempt(lastQuizResult);
    } else if (attemptId) {
      examService.getQuizHistory().then(history => {
        const found = history.find(a => a.id === attemptId);
        if (found) setAttempt(found);
      });
    }
  }, [lastQuizResult, attemptId]);

  useEffect(() => {
    if (attempt && attempt.accuracy >= 70) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // fallback
      }
    }
  }, [attempt]);

  if (!attempt) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <EmptyState
          title="No Result Available"
          description="We could not find the examination attempt you are looking for."
          actionText="Take a New Practice Quiz"
          onAction={() => onNavigate('/practice')}
        />
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  const handleRetryQuiz = () => {
    setActiveQuizConfig(attempt.quizConfig);
    onNavigate('/practice');
  };

  const handleNewQuiz = () => {
    setActiveQuizConfig(null);
    onNavigate('/practice');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `I scored ${attempt.score} marks (${attempt.accuracy}% accuracy) in ${attempt.quizConfig.examName} on Aptitude Arena!`
    );
    showToast('Result summary copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top action back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Score</span>
          </button>
        </div>
      </div>

      {/* Hero Scorecard Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Performance Assessment
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {attempt.quizConfig.examName} · {attempt.quizConfig.subjectName || 'All Topics'} · Completed in{' '}
            {formatTime(attempt.timeSpentSeconds)}
          </p>
        </div>

        {/* Core KPIs Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[11px] text-slate-400 block mb-0.5">Net Score</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {attempt.score}
            </span>
            <span className="text-[10px] text-slate-400 block">/ {attempt.maxScore} marks</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[11px] text-slate-400 block mb-0.5">Accuracy</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
              {attempt.accuracy}%
            </span>
            <span className="text-[10px] text-slate-400 block">Target &gt; 80%</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[11px] text-slate-400 block mb-0.5">Correct Answers</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {attempt.correctCount}
            </span>
            <span className="text-[10px] text-slate-400 block">+{attempt.correctCount * 2} marks</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[11px] text-slate-400 block mb-0.5">Incorrect / Skipped</span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
              {attempt.incorrectCount} / {attempt.unansweredCount}
            </span>
            <span className="text-[10px] text-slate-400 block">Negative penalty applied</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleRetryQuiz}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Same Test</span>
          </button>

          <button
            onClick={handleNewQuiz}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>New Practice Quiz</span>
          </button>

          <button
            onClick={() => onNavigate('/dashboard')}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Question-wise Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Question-by-Question Solution Analysis ({attempt.questions.length})
          </h2>
          <span className="text-xs text-slate-500">
            Green denotes correct key; Red denotes chosen mistake
          </span>
        </div>

        <div className="space-y-4">
          {attempt.questions.map((question, i) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionNumber={i + 1}
              selectedOption={attempt.answers[question.id]}
              isMarkedForReview={!!attempt.reviewMarked[question.id]}
              showExplanation={true}
              mode="review"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
