import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Play, 
  FileText, 
  Download, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Award,
  Layers,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaperCard } from '../components/cards/PaperCard';
import { PaperPreviewModal } from '../components/common/PaperPreviewModal';
import { EmptyState } from '../components/common/EmptyState';
import { Paper } from '../types';

interface ExamDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ExamDetailPage: React.FC<ExamDetailPageProps> = ({ slug, onNavigate }) => {
  const { exams, papers, setActiveQuizConfig, isBookmarked, toggleBookmark, showToast, requireAuth } = useApp();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [previewPaper, setPreviewPaper] = useState<Paper | null>(null);

  const exam = exams.find(e => e.slug === slug || e.id === slug);

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Examination Not Found"
          description="The examination you requested could not be located in our directory."
          actionText="Back to All Exams"
          onAction={() => onNavigate('/exams')}
        />
      </div>
    );
  }

  const bookmarked = isBookmarked('exam', exam.id);

  // Papers belonging to this exam
  const examPapers = papers.filter(p => {
    const examMatches = p.examId === exam.id || p.examName.toLowerCase() === exam.name.toLowerCase();
    if (!examMatches) return false;
    if (selectedSubject !== 'all' && p.subjectName.toLowerCase() !== selectedSubject.toLowerCase()) return false;
    if (selectedYear !== 'all' && p.year !== selectedYear) return false;
    return true;
  });

  const handleStartFullPractice = () => {
    requireAuth(() => {
      setActiveQuizConfig({
        examId: exam.id,
        examName: exam.name,
        questionCount: 15,
        difficulty: 'mixed',
        timeLimitMinutes: 20,
      });
      onNavigate('/practice');
    }, `Please sign in or register to launch ${exam.name} comprehensive practice.`);
  };

  const handleStartPaperPractice = (paper: Paper) => {
    requireAuth(() => {
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
    }, `Please sign in or register to practice this official paper.`);
  };

  const handlePreviewPaper = (paper: Paper) => {
    requireAuth(() => {
      setPreviewPaper(paper);
    }, 'Please sign in or register to preview official question papers.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/exams')}
        className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Exams</span>
      </button>

      {/* Hero Exam Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{exam.category}</span>
              <span>·</span>
              <span>Conducted by {exam.conductingBody}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {exam.name}: {exam.fullName}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {exam.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => toggleBookmark('exam', exam.id)}
              className={`p-2.5 rounded-xl border transition-colors ${
                bookmarked
                  ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={bookmarked ? 'Saved to bookmarks' : 'Bookmark exam'}
            >
              <Bookmark className="w-5 h-5" />
            </button>

            <button
              onClick={handleStartFullPractice}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Mock Test</span>
            </button>
          </div>
        </div>

        {/* Exam Pattern Specifications Banner */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Exam Duration</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {exam.examPattern.durationMinutes} Minutes
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Total Marks</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {exam.examPattern.totalMarks} Marks
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Marking Scheme</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {exam.examPattern.negativeMarking}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Paper Archive</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {exam.paperCount} Papers Available
            </span>
          </div>
        </div>
      </div>

      {/* Subjects & Available Years Exploration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Syllabus Subjects */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Syllabus Subjects</span>
          </div>
          <div className="space-y-1.5">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`w-full py-2 px-3 text-xs rounded-lg text-left font-medium transition-colors flex items-center justify-between ${
                selectedSubject === 'all'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>All Subjects</span>
              <span className="text-[11px] text-slate-400 tabular-nums">({exam.subjects.length})</span>
            </button>
            {exam.subjects.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`w-full py-2 px-3 text-xs rounded-lg text-left font-medium transition-colors flex items-center justify-between ${
                  selectedSubject === sub
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{sub}</span>
                <span className="text-[10px] text-indigo-500">Practice</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 cols: Papers Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Official Papers ({examPapers.length})
            </h3>

            {/* Year selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Year:</span>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="py-1 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              >
                <option value="all">All Available Years</option>
                {exam.availableYears.map(yr => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {examPapers.length === 0 ? (
            <EmptyState
              title="No papers found for this combination"
              description="Adjust the subject or year selection to view other available previous-year examination papers."
              actionText="Reset Subject & Year"
              onAction={() => {
                setSelectedSubject('all');
                setSelectedYear('all');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {examPapers.map(paper => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onPreview={handlePreviewPaper}
                  onStartPractice={handleStartPaperPractice}
                />
              ))}
            </div>
          )}
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
