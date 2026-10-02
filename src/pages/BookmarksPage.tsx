import React, { useState } from 'react';
import { Bookmark, FileText, HelpCircle, BookOpen, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExamCard } from '../components/cards/ExamCard';
import { PaperCard } from '../components/cards/PaperCard';
import { QuestionCard } from '../components/cards/QuestionCard';
import { PaperPreviewModal } from '../components/common/PaperPreviewModal';
import { EmptyState } from '../components/common/EmptyState';
import { Paper } from '../types';

interface BookmarksPageProps {
  onNavigate: (path: string) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ onNavigate }) => {
  const { user, exams, papers, questions, setActiveQuizConfig, toggleBookmark, openAuthModal } = useApp();
  const [tab, setTab] = useState<'all' | 'questions' | 'papers' | 'exams'>('all');
  const [previewPaper, setPreviewPaper] = useState<Paper | null>(null);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <EmptyState
          title="Sign in to View Your Bookmarks"
          description="Save difficult questions, essential examination papers, and target exams to your personal revision library."
          actionText="Sign In"
          onAction={() => openAuthModal('login')}
        />
      </div>
    );
  }

  const bookmarkedExams = exams.filter(e => user.bookmarks.examIds.includes(e.id));
  const bookmarkedPapers = papers.filter(p => user.bookmarks.paperIds.includes(p.id));
  const bookmarkedQuestions = questions.filter(q => user.bookmarks.questionIds.includes(q.id));

  const totalCount =
    bookmarkedExams.length + bookmarkedPapers.length + bookmarkedQuestions.length;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Saved Bookmarks & Revision Vault
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review pinned previous-year questions, past booklets, and target examinations.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            tab === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Items ({totalCount})
        </button>
        <button
          onClick={() => setTab('questions')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            tab === 'questions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Questions ({bookmarkedQuestions.length})
        </button>
        <button
          onClick={() => setTab('papers')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            tab === 'papers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Papers ({bookmarkedPapers.length})
        </button>
        <button
          onClick={() => setTab('exams')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            tab === 'exams'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Exams ({bookmarkedExams.length})
        </button>
      </div>

      {/* Empty State */}
      {totalCount === 0 ? (
        <EmptyState
          title="No Bookmarks Saved Yet"
          description="While browsing exams, papers, or practicing questions, click the bookmark icon to save items here for fast revision."
          actionText="Browse Previous Year Papers"
          onAction={() => onNavigate('/papers')}
        />
      ) : (
        <div className="space-y-8">
          {/* Questions Section */}
          {(tab === 'all' || tab === 'questions') && bookmarkedQuestions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Saved Questions ({bookmarkedQuestions.length})</span>
              </h2>
              <div className="space-y-4">
                {bookmarkedQuestions.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    questionNumber={idx + 1}
                    showExplanation={true}
                    mode="browse"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Papers Section */}
          {(tab === 'all' || tab === 'papers') && bookmarkedPapers.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Saved Papers ({bookmarkedPapers.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedPapers.map(paper => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    onPreview={p => setPreviewPaper(p)}
                    onStartPractice={handleStartPaperPractice}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Exams Section */}
          {(tab === 'all' || tab === 'exams') && bookmarkedExams.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Saved Examinations ({bookmarkedExams.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedExams.map(exam => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onSelect={e => onNavigate(`/exams/${e.slug}`)}
                    onPractice={() => {
                      setActiveQuizConfig({
                        examId: exam.id,
                        examName: exam.name,
                        questionCount: 10,
                        difficulty: 'mixed',
                        timeLimitMinutes: 15,
                      });
                      onNavigate('/practice');
                    }}
                    onViewPapers={e => onNavigate(`/papers?exam=${e.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <PaperPreviewModal
        paper={previewPaper}
        onClose={() => setPreviewPaper(null)}
        onStartPractice={handleStartPaperPractice}
      />
    </div>
  );
};
