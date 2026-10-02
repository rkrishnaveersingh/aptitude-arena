import React from 'react';
import { Flag, CheckCircle2, Circle } from 'lucide-react';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  answers: Record<string, string>;
  reviewMarked: Record<string, boolean>;
  questionIds: string[];
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  totalQuestions,
  currentIndex,
  onSelectIndex,
  answers,
  reviewMarked,
  questionIds,
}) => {
  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(reviewMarked).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Question Palette
        </h4>
        <span className="text-xs text-slate-500 tabular-nums">
          {currentIndex + 1} of {totalQuestions}
        </span>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-[11px] mb-4 text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-600 shrink-0" />
          <span className="tabular-nums">{answeredCount} Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-purple-600 shrink-0" />
          <span className="tabular-nums">{reviewCount} Review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700 shrink-0" />
          <span className="tabular-nums">{unansweredCount} Left</span>
        </div>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
        {questionIds.map((qId, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = !!answers[qId];
          const isReview = !!reviewMarked[qId];

          let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';

          if (isAnswered && isReview) {
            btnClass = 'bg-purple-600 text-white border-2 border-emerald-400';
          } else if (isAnswered) {
            btnClass = 'bg-emerald-600 text-white';
          } else if (isReview) {
            btnClass = 'bg-purple-600 text-white';
          }

          if (isCurrent) {
            btnClass += ' ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 font-bold';
          }

          return (
            <button
              key={qId}
              onClick={() => onSelectIndex(idx)}
              className={`h-8 rounded-lg text-xs font-medium tabular-nums transition-all flex items-center justify-center ${btnClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
