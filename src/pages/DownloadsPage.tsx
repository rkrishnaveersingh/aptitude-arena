import React from 'react';
import { Download, FileText, Play, Eye, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/common/EmptyState';
import { Paper } from '../types';

interface DownloadsPageProps {
  onNavigate: (path: string) => void;
}

export const DownloadsPage: React.FC<DownloadsPageProps> = ({ onNavigate }) => {
  const { user, papers, downloadPaper, setActiveQuizConfig, openAuthModal } = useApp();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <EmptyState
          title="Sign in to View Offline Downloads"
          description="Keep track of your downloaded examination question papers and answer keys."
          actionText="Sign In"
          onAction={() => openAuthModal('login')}
        />
      </div>
    );
  }

  // Match downloaded papers from profile
  const downloadedList = user.downloadedPapers
    .map(entry => {
      const p = papers.find(paper => paper.id === entry.paperId);
      return p ? { paper: p, downloadedAt: entry.downloadedAt } : null;
    })
    .filter(Boolean) as { paper: Paper; downloadedAt: string }[];

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleStartPractice = (paper: Paper) => {
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
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Downloaded Paper Archive
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Access your saved offline examination papers, test booklets, and official answer keys.
        </p>
      </div>

      {downloadedList.length === 0 ? (
        <EmptyState
          title="No Papers Downloaded"
          description="You haven't downloaded any examination question papers yet. Explore the paper library to download official papers for offline practice."
          actionText="Browse Previous Year Papers"
          onAction={() => onNavigate('/papers')}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">File / Title</th>
                  <th className="py-3 px-4">Exam</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Format & Size</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {downloadedList.map(({ paper, downloadedAt }) => (
                  <tr key={paper.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block max-w-sm truncate">
                            {paper.title}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Saved on {new Date(downloadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {paper.examName}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {paper.year}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {paper.subjectName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      PDF ({formatFileSize(paper.fileSizeBytes)})
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => downloadPaper(paper)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Re-download paper"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Re-download</span>
                        </button>

                        <button
                          onClick={() => handleStartPractice(paper)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Practice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
