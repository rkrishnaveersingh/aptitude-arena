import React, { useState } from 'react';
import { X, Download, Play, Bookmark, FileText, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import { Paper } from '../../types';
import { useApp } from '../../context/AppContext';

interface PaperPreviewModalProps {
  paper: Paper | null;
  onClose: () => void;
  onStartPractice: (paper: Paper) => void;
}

export const PaperPreviewModal: React.FC<PaperPreviewModalProps> = ({
  paper,
  onClose,
  onStartPractice,
}) => {
  const { downloadPaper, isBookmarked, toggleBookmark } = useApp();
  const [showAnswerKeys, setShowAnswerKeys] = useState(false);

  if (!paper) return null;

  const bookmarked = isBookmarked('paper', paper.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">{paper.examName}</span>
                <span>·</span>
                <span>Year {paper.year}</span>
                <span>·</span>
                <span>{paper.paperType}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-lg">
                {paper.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmark('paper', paper.id)}
              className={`p-2 rounded-lg border transition-colors ${
                bookmarked
                  ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark paper'}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Document Preview Simulator */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Paper Metadata Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div>
              <span className="text-[11px] text-slate-400 block">Duration</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                {paper.durationMinutes} mins
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Total Questions</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                {paper.totalQuestions} Questions
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Maximum Marks</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                {paper.totalMarks} Marks
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Difficulty</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                {paper.difficulty}
              </span>
            </div>
          </div>

          {/* Exam Instructions */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span>Standard Candidate Instructions</span>
            </h4>
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {paper.instructions.map((inst, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-semibold">{i + 1}.</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Questions Preview in Document View */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                Paper Section Overview & Sample Problems
              </h4>
              <button
                onClick={() => setShowAnswerKeys(!showAnswerKeys)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showAnswerKeys ? 'Hide Solution Hints' : 'Reveal Solution Hints'}</span>
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2 font-sans">
                  <span>Question 01 · 1 Mark</span>
                  <span>{paper.subjectName}</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-sans text-xs mb-3">
                  Identify the net percentage change in numerical magnitude if an entity increases by 20% and successively decreases by 20%.
                </p>
                <div className="grid grid-cols-2 gap-2 font-sans text-xs">
                  <div className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50">
                    (A) 0% (Neutral)
                  </div>
                  <div className={`p-2 border rounded ${showAnswerKeys ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'}`}>
                    (B) 4% decrease {showAnswerKeys && '✓ [Correct]'}
                  </div>
                  <div className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50">
                    (C) 4% increase
                  </div>
                  <div className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50">
                    (D) 2.5% decrease
                  </div>
                </div>
                {showAnswerKeys && (
                  <div className="mt-3 p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 rounded text-[11px] font-sans text-emerald-900 dark:text-emerald-300">
                    <strong>Official Note:</strong> Apply formula a + b + ab/100 = 20 - 20 - 4 = -4%.
                  </div>
                )}
              </div>

              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2 font-sans">
                  <span>Question 02 · 2 Marks</span>
                  <span>Core Technical Module</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-sans text-xs mb-3">
                  Under standard paging with TLB hit ratio 90%, memory access 80ns, TLB access 10ns, compute effective memory access latency.
                </p>
                <div className="grid grid-cols-2 gap-2 font-sans text-xs">
                  <div className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50">
                    (A) 89 ns
                  </div>
                  <div className={`p-2 border rounded ${showAnswerKeys ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'}`}>
                    (B) 98 ns {showAnswerKeys && '✓ [Correct]'}
                  </div>
                  <div className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50">
                    (C) 107 ns
                  </div>
                  <div className="p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50">
                    (D) 124 ns
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Verified official original paper with comprehensive answer key</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => downloadPaper(paper)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onStartPractice(paper);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>Start Timed Practice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
