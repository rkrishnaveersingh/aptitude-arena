import React from 'react';
import { Bookmark, Flag, Check, X, HelpCircle } from 'lucide-react';
import { Question } from '../../types';
import { useApp } from '../../context/AppContext';

interface QuestionCardProps {
  question: Question;
  questionNumber?: number;
  selectedOption?: 'A' | 'B' | 'C' | 'D';
  onSelectOption?: (optionId: 'A' | 'B' | 'C' | 'D') => void;
  isMarkedForReview?: boolean;
  onToggleReview?: () => void;
  showExplanation?: boolean;
  mode?: 'interactive' | 'review' | 'browse';
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  selectedOption,
  onSelectOption,
  isMarkedForReview,
  onToggleReview,
  showExplanation = false,
  mode = 'interactive',
}) => {
  const { isBookmarked, toggleBookmark } = useApp();
  const bookmarked = isBookmarked('question', question.id);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {questionNumber !== undefined && (
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              Question {questionNumber}
            </span>
          )}
          <span>·</span>
          <span>{question.examName}</span>
          <span>·</span>
          <span>{question.subjectName}</span>
          <span>·</span>
          <span className="capitalize">{question.difficulty}</span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleReview && (
            <button
              onClick={onToggleReview}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                isMarkedForReview
                  ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Review</span>
            </button>
          )}

          <button
            onClick={() => toggleBookmark('question', question.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              bookmarked
                ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title={bookmarked ? 'Saved to bookmarks' : 'Bookmark question'}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-5 text-sm sm:text-base text-slate-900 dark:text-white font-medium leading-relaxed">
        {question.text}
      </div>

      {/* Formula or Code Snippet */}
      {question.formula && (
        <div className="mb-5 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 font-mono text-xs text-indigo-900 dark:text-indigo-300">
          <span className="font-semibold block text-[10px] uppercase tracking-wider mb-1 text-indigo-500">
            Formula / Working Identity
          </span>
          {question.formula}
        </div>
      )}

      {/* Options List */}
      <div className="space-y-2.5 mb-6">
        {question.options.map(option => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === question.correctOptionId;

          let optionStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600';

          if (mode === 'review') {
            if (isCorrect) {
              optionStyle = 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
            }
          } else if (isSelected) {
            optionStyle = 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-xs';
          }

          return (
            <div
              key={option.id}
              onClick={() => mode === 'interactive' && onSelectOption && onSelectOption(option.id)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${optionStyle}`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-semibold text-xs transition-colors ${
                  mode === 'review'
                    ? isCorrect
                      ? 'bg-emerald-600 text-white'
                      : isSelected
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    : isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {mode === 'review' && isCorrect ? (
                  <Check className="w-3.5 h-3.5" />
                ) : mode === 'review' && isSelected && !isCorrect ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  option.id
                )}
              </div>
              <div className="flex-1 pt-0.5 leading-snug">
                {option.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation Box */}
      {showExplanation && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Detailed Examination Solution</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {question.explanation}
          </p>
          {question.topic && (
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500">
              <span>Topic: </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{question.topic}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
