import React from 'react';
import { 
  Cpu, 
  Building2, 
  Scale, 
  Atom, 
  Shield, 
  Landmark, 
  BookOpen, 
  FileText, 
  Play, 
  Download, 
  Bookmark, 
  ArrowRight 
} from 'lucide-react';
import { Exam } from '../../types';
import { useApp } from '../../context/AppContext';

interface ExamCardProps {
  exam: Exam;
  onSelect: (exam: Exam) => void;
  onPractice: (exam: Exam) => void;
  onViewPapers: (exam: Exam) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  onSelect,
  onPractice,
  onViewPapers,
}) => {
  const { isBookmarked, toggleBookmark, showToast } = useApp();
  const bookmarked = isBookmarked('exam', exam.id);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Atom':
        return <Atom className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'Landmark':
        return <Landmark className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {renderIcon(exam.logoIcon)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {exam.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-normal">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{exam.category}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {exam.conductingBody}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleBookmark('exam', exam.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              bookmarked
                ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title={bookmarked ? 'Saved to bookmarks' : 'Bookmark this exam'}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {exam.description}
        </p>

        {/* Exam Metrics Row: Unboxed text with typographic separators */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          {exam.paperCount > 0 ? (
            <>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{exam.paperCount}</span>
              <span>{exam.paperCount === 1 ? 'Paper' : 'Papers'}</span>
            </>
          ) : (
            <span>Practice Module</span>
          )}
          <span aria-hidden="true">·</span>
          {exam.questionCount > 0 ? (
            <>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{exam.questionCount}</span>
              <span>Questions</span>
            </>
          ) : (
            <span>Question Bank</span>
          )}
          <span aria-hidden="true">·</span>
          <span className="capitalize">{exam.difficulty}</span>
        </div>

        {/* Subjects list */}
        <div className="mb-4">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Key Subjects
          </span>
          <div className="flex flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            {exam.subjects.slice(0, 3).map((sub, i) => (
              <span key={i} className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                {sub}
              </span>
            ))}
            {exam.subjects.length > 3 && (
              <span className="text-[11px] text-slate-400 px-1 py-0.5">
                +{exam.subjects.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Years available */}
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          <span>Available Years: </span>
          <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
            {exam.availableYears && exam.availableYears.length > 0
              ? exam.availableYears.join(', ')
              : 'Current Syllabus Edition'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => onPractice(exam)}
          className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Practice</span>
        </button>

        <button
          onClick={() => onViewPapers(exam)}
          className="py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          title="Browse Previous Year Papers"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Papers</span>
        </button>

        <button
          onClick={() => {
            showToast(`Generating ${exam.name} comprehensive syllabus outline...`);
          }}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Download Exam Syllabus & Scheme"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
