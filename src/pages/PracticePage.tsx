import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Clock, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  XCircle,
  HelpCircle,
  Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QuestionNavigator } from '../components/quiz/QuestionNavigator';
import { QuizTimer } from '../components/quiz/QuizTimer';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { QuestionCard } from '../components/cards/QuestionCard';
import { EmptyState } from '../components/common/EmptyState';
import { Question, QuizAttempt, QuizConfig } from '../types';
import { examService } from '../services/examService';

interface PracticePageProps {
  onNavigate: (path: string) => void;
  initialExamId?: string;
  initialSubject?: string;
}

export const PracticePage: React.FC<PracticePageProps> = ({ 
  onNavigate, 
  initialExamId, 
  initialSubject 
}) => {
  const { 
    exams, 
    questions, 
    activeQuizConfig, 
    setActiveQuizConfig, 
    setLastQuizResult, 
    user,
    requireAuth,
    showToast 
  } = useApp();

  // Mode: 'setup' or 'taking'
  const [quizMode, setQuizMode] = useState<'setup' | 'taking'>('setup');

  // Setup Form State
  const [selectedExamId, setSelectedExamId] = useState<string>(
    activeQuizConfig?.examId || initialExamId || exams[0]?.id || 'exam-gate'
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    activeQuizConfig?.subjectName || initialSubject || 'all'
  );
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [questionCountType, setQuestionCountType] = useState<'10' | '20' | 'custom'>('10');
  const [customQuestionCount, setCustomQuestionCount] = useState<number>(15);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>(
    activeQuizConfig?.difficulty || 'mixed'
  );

  // Active Quiz State
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [reviewMarked, setReviewMarked] = useState<Record<string, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [totalQuizSeconds, setTotalQuizSeconds] = useState<number>(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const selectedExam = exams.find(e => e.id === selectedExamId);

  // If activeQuizConfig was passed from another page (like clicking "Start Timed Practice" on a paper), auto-launch
  useEffect(() => {
    if (activeQuizConfig && quizMode === 'setup') {
      if (!user) {
        requireAuth(() => launchQuizFromConfig(activeQuizConfig), 'Please sign in or register to take this exam simulation.');
      } else {
        launchQuizFromConfig(activeQuizConfig);
      }
    }
  }, [activeQuizConfig, user]);

  const launchQuizFromConfig = async (config: QuizConfig) => {
    if (!user) {
      requireAuth(() => launchQuizFromConfig(config), 'Please sign in or register to take this exam simulation.');
      return;
    }
    // Fetch matching questions
    const matching = await examService.getQuestions({
      examId: config.examId,
      subjectName: config.subjectName !== 'all' ? config.subjectName : undefined,
      difficulty: config.difficulty !== 'mixed' ? config.difficulty : undefined,
      paperId: config.paperId,
    });

    let pool = [...matching];
    if (pool.length === 0) {
      // Fallback: take questions from any subject in this exam
      pool = await examService.getQuestions({ examId: config.examId });
    }
    if (pool.length === 0) {
      // Fallback: all questions
      pool = await examService.getQuestions();
    }

    // Shuffle and pick
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const count = Math.min(config.questionCount, shuffled.length > 0 ? shuffled.length : 10);
    const chosen = shuffled.slice(0, count);

    setQuizQuestions(chosen);
    setCurrentIndex(0);
    setAnswers({});
    setReviewMarked({});
    setStartTime(new Date().toISOString());
    const totalSecs = config.timeLimitMinutes * 60;
    setTotalQuizSeconds(totalSecs);
    setSecondsRemaining(totalSecs);
    setIsPaused(false);
    setQuizMode('taking');
  };

  const handleStartSetupQuiz = () => {
    requireAuth(() => {
      const finalCount = questionCountType === '10' ? 10 : questionCountType === '20' ? 20 : customQuestionCount;
      const timeLimit = Math.max(5, Math.round(finalCount * 1.5));

      const config: QuizConfig = {
        examId: selectedExamId,
        examName: selectedExam?.name || 'GATE',
        subjectName: selectedSubject,
        difficulty,
        questionCount: finalCount,
        timeLimitMinutes: timeLimit,
      };

      setActiveQuizConfig(config);
      launchQuizFromConfig(config);
    }, 'Please sign in or register to launch your practice session.');
  };

  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    const currentQ = quizQuestions[currentIndex];
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleClearAnswer = () => {
    const currentQ = quizQuestions[currentIndex];
    if (!currentQ) return;
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleReview = () => {
    const currentQ = quizQuestions[currentIndex];
    if (!currentQ) return;
    setReviewMarked(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleSubmitQuiz = async () => {
    const endTime = new Date().toISOString();
    const timeSpent = totalQuizSeconds - secondsRemaining;

    // Calculate score
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    quizQuestions.forEach(q => {
      const ans = answers[q.id];
      if (!ans) {
        unanswered++;
      } else if (ans === q.correctOptionId) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const totalQuestions = quizQuestions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correct / Math.max(1, correct + incorrect)) * 100) : 0;
    const marksPerQuestion = 2;
    const penaltyPerQuestion = 0.66;
    const score = Math.max(0, Math.round((correct * marksPerQuestion - incorrect * penaltyPerQuestion) * 10) / 10);
    const maxScore = totalQuestions * marksPerQuestion;

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      userId: user?.id || 'guest',
      quizConfig: activeQuizConfig || {
        examId: selectedExamId,
        examName: selectedExam?.name || 'Exam',
        difficulty,
        questionCount: totalQuestions,
        timeLimitMinutes: Math.round(totalQuizSeconds / 60),
      },
      startTime,
      endTime,
      timeSpentSeconds: timeSpent,
      answers,
      reviewMarked,
      score,
      maxScore,
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      accuracy,
      questions: quizQuestions,
      submittedAt: new Date().toISOString(),
    };

    await examService.saveQuizAttempt(attempt);
    setLastQuizResult(attempt);
    setActiveQuizConfig(null);
    setQuizMode('setup');
    onNavigate(`/practice/results/${attempt.id}`);
  };

  // RENDER SETUP SCREEN
  if (quizMode === 'setup') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Custom Practice Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure your target examination, syllabus modules, question count, and test parameters.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Step 1: Select Examination */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              1. Target Examination
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {exams.map(exam => (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => {
                    setSelectedExamId(exam.id);
                    setSelectedSubject('all');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedExamId === exam.id
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold block">{exam.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                    {exam.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Subject */}
          {selectedExam && (
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                2. Subject / Category
              </label>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full py-2.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-500"
              >
                <option value="all">All Subjects (Comprehensive Mock)</option>
                {selectedExam.subjects.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3: Choose Number of Questions */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              3. Question Volume
            </label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setQuestionCountType('10')}
                className={`py-3 px-4 rounded-xl border text-center font-bold text-xs transition-all ${
                  questionCountType === '10'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                10 Questions
                <span className="block text-[10px] font-normal text-slate-500">~15 Minutes</span>
              </button>

              <button
                type="button"
                onClick={() => setQuestionCountType('20')}
                className={`py-3 px-4 rounded-xl border text-center font-bold text-xs transition-all ${
                  questionCountType === '20'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                20 Questions
                <span className="block text-[10px] font-normal text-slate-500">~30 Minutes</span>
              </button>

              <button
                type="button"
                onClick={() => setQuestionCountType('custom')}
                className={`py-3 px-4 rounded-xl border text-center font-bold text-xs transition-all ${
                  questionCountType === 'custom'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Custom
                <span className="block text-[10px] font-normal text-slate-500">Specific Count</span>
              </button>
            </div>

            {questionCountType === 'custom' && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-xs text-slate-600 dark:text-slate-300">Set question count:</span>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={customQuestionCount}
                  onChange={e => setCustomQuestionCount(Math.max(5, Math.min(50, Number(e.target.value))))}
                  className="w-20 px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-center font-mono font-bold"
                />
                <span className="text-xs text-slate-400">questions</span>
              </div>
            )}
          </div>

          {/* Step 4: Select Difficulty */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              4. Difficulty Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['easy', 'medium', 'hard', 'mixed'] as const).map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2.5 px-3 rounded-xl border text-center text-xs font-semibold capitalize transition-all ${
                    difficulty === diff
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleStartSetupQuiz}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Competitive Simulation</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER LIVE QUIZ TAKING SCREEN
  const currentQuestion = quizQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / quizQuestions.length) * 100);

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <EmptyState
          title="No questions in this test session"
          description="We could not assemble questions matching this exact filter combination."
          actionText="Configure Another Test"
          onAction={() => setQuizMode('setup')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar for Quiz */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Leave / Submit Test"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{activeQuizConfig?.examName || 'Practice'}</span>
              <span>·</span>
              <span className="font-normal text-slate-500">{activeQuizConfig?.subjectName || 'All Topics'}</span>
            </div>
            <div className="text-[11px] text-slate-400 tabular-nums">
              Question {currentIndex + 1} of {quizQuestions.length} ({answeredCount} answered)
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3">
          <QuizTimer
            totalSeconds={totalQuizSeconds}
            onTimeUp={handleSubmitQuiz}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            onSecondsChange={sec => setSecondsRemaining(sec)}
          />

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Two-Zone Layout: Question Area (Left) + Question Navigator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Question Card */}
        <div className="lg:col-span-8 space-y-4">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedOption={answers[currentQuestion.id]}
            onSelectOption={handleSelectOption}
            isMarkedForReview={!!reviewMarked[currentQuestion.id]}
            onToggleReview={handleToggleReview}
            mode="interactive"
          />

          {/* Navigation Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleClearAnswer}
                disabled={!answers[currentQuestion.id]}
                className="px-3 py-2 text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 transition-colors"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleReview}
                className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                  reviewMarked[currentQuestion.id]
                    ? 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{reviewMarked[currentQuestion.id] ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>

              {currentIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(quizQuestions.length - 1, prev + 1))}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Finish Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Palette & Navigator */}
        <div className="lg:col-span-4 space-y-4">
          <QuestionNavigator
            totalQuestions={quizQuestions.length}
            currentIndex={currentIndex}
            onSelectIndex={idx => setCurrentIndex(idx)}
            answers={answers}
            reviewMarked={reviewMarked}
            questionIds={quizQuestions.map(q => q.id)}
          />

          {/* Quick Shortcuts Box */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Test Guidelines:
            </span>
            <ul className="space-y-1 text-slate-500 dark:text-slate-400 text-[11px] list-disc list-inside">
              <li>Each correct response awards +2.0 marks.</li>
              <li>Incorrect responses incur -0.66 negative marking.</li>
              <li>Questions marked for review can still be scored if answered.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Warning Modal Before Submitting */}
      <ConfirmationModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmitQuiz}
        title="Submit Examination Session?"
        message={`You have answered ${answeredCount} of ${quizQuestions.length} questions. ${
          quizQuestions.length - answeredCount > 0
            ? `${quizQuestions.length - answeredCount} questions remain unanswered.`
            : 'All questions have been attempted.'
        } Are you ready to finalize your test and evaluate your score?`}
        confirmLabel="Yes, Submit Test"
        cancelLabel="Continue Practicing"
      />
    </div>
  );
};
