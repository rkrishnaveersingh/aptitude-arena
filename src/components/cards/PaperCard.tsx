import React from 'react';
import { FileText, Download, Play, Bookmark, Clock, HelpCircle, Eye } from 'lucide-react';
import { Paper } from '../../types';
import { useApp } from '../../context/AppContext';

interface PaperCardProps {
  paper: Paper;
  onPreview: (paper: Paper) => void;
  onStartPractice: (paper: Paper) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  onPreview,
  onStartPractice,
}) => {
  const { downloadPaper, isBookmarked, toggleBookmark } = useApp();
  const bookmarked = isBookmarked('paper', paper.id);

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white">{paper.examName}</span>
                <span>·</span>
                <span className="tabular-nums">Year {paper.year}</span>
                <span>·</span>
                <span>{paper.paperType}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                {paper.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => toggleBookmark('paper', paper.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              bookmarked
                ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title={bookmarked ? 'Saved to bookmarks' : 'Bookmark paper'}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Subject & Difficulty */}
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
          <span className="font-medium text-slate-900 dark:text-white">{paper.subjectName}</span>
          <span className="text-slate-400">·</span>
          <span className="capitalize text-slate-500">{paper.difficulty} difficulty</span>
        </div>

        {/* Paper Meta Details */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs mb-4">
          <div>
            <span className="text-[10px] text-slate-400 block">Questions</span>
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
              {paper.totalQuestions}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Time</span>
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
              {paper.durationMinutes}m
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Marks</span>
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
              {paper.totalMarks}
            </span>
          </div>
        </div>

        {/* Download metadata */}
        <div className="text-[11px] text-slate-400 mb-4 flex items-center justify-between">
          <span>{formatFileSize(paper.fileSizeBytes)} · PDF Format</span>
          <span className="tabular-nums">{paper.downloadCount.toLocaleString()} downloads</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => onPreview(paper)}
          className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview Paper</span>
        </button>

        <button
          onClick={() => onStartPractice(paper)}
          className="py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          title="Start Timed Practice"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Practice</span>
        </button>

        <button
          onClick={() => downloadPaper(paper)}
          className="p-2 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Download Paper"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
