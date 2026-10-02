import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, Target, Award, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LeaderboardEntry } from '../types';
import { examService } from '../services/examService';

interface LeaderboardPageProps {
  onNavigate: (path: string) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onNavigate }) => {
  const { exams } = useApp();
  const [timeframe, setTimeframe] = useState<'global' | 'weekly' | 'monthly'>('global');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    examService.getLeaderboard(timeframe, selectedExam).then(res => {
      setEntries(res);
      setLoading(false);
    });
  }, [timeframe, selectedExam]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          National Candidate Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time percentile rankings based on verified speed, score volume, and accuracy.
        </p>
      </div>

      {/* Filter and Period Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        {/* Timeframe Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-full sm:w-auto">
          {(['global', 'monthly', 'weekly'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                timeframe === tf
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tf === 'global' ? 'All-Time' : tf === 'monthly' ? 'This Month' : 'This Week'}
            </button>
          ))}
        </div>

        {/* Exam Specific Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Exam Filter:</span>
          <select
            value={selectedExam}
            onChange={e => setSelectedExam(e.target.value)}
            className="w-full sm:w-auto py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
          >
            <option value="all">All Examinations</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.name}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
          {/* Rank 2 (Silver) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center order-2 md:order-1 relative shadow-xs">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center mx-auto mb-3 border border-slate-300 dark:border-slate-700">
              #2
            </div>
            <img
              src={top3[1].avatarUrl}
              alt={top3[1].userName}
              className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-slate-300 dark:border-slate-600"
            />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {top3[1].userName}
            </h3>
            <span className="text-[11px] text-slate-400 block mb-2">{top3[1].examCategory} Specialization</span>
            <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
              {top3[1].score.toLocaleString()} pts
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="tabular-nums">{top3[1].accuracy}% acc</span>
              <span>·</span>
              <span className="tabular-nums">{top3[1].questionsSolved} solved</span>
            </div>
          </div>

          {/* Rank 1 (Gold - Taller) */}
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-500/80 rounded-2xl p-6 sm:p-8 text-center order-1 md:order-2 relative shadow-lg">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <img
              src={top3[0].avatarUrl}
              alt={top3[0].userName}
              className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-amber-400"
            />
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {top3[0].userName}
            </h3>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block mb-2">
              {top3[0].badge || 'AIR 1 Practice'}
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {top3[0].score.toLocaleString()} pts
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {top3[0].accuracy}% acc
              </span>
              <span>·</span>
              <span className="tabular-nums">{top3[0].questionsSolved} solved</span>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-orange-500 tabular-nums font-semibold">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {top3[0].streak}d
              </span>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center order-3 relative shadow-xs">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center mx-auto mb-3 border border-amber-300 dark:border-amber-800">
              #3
            </div>
            <img
              src={top3[2].avatarUrl}
              alt={top3[2].userName}
              className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-amber-300 dark:border-amber-700"
            />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {top3[2].userName}
            </h3>
            <span className="text-[11px] text-slate-400 block mb-2">{top3[2].examCategory} Specialization</span>
            <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
              {top3[2].score.toLocaleString()} pts
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="tabular-nums">{top3[2].accuracy}% acc</span>
              <span>·</span>
              <span className="tabular-nums">{top3[2].questionsSolved} solved</span>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Target Exam</th>
                <th className="py-3 px-4 text-right">Score</th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4 text-right">Solved</th>
                <th className="py-3 px-4 text-right">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {entries.map(entry => {
                const isUser = entry.userName.includes('(You)');
                return (
                  <tr
                    key={entry.userId}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                      #{entry.rank}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={entry.avatarUrl}
                          alt={entry.userName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="truncate max-w-xs">
                          <span className="text-slate-900 dark:text-white block font-medium truncate">
                            {entry.userName}
                          </span>
                          {entry.badge && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                              {entry.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {entry.examCategory}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {entry.score.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {entry.accuracy}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                      {entry.questionsSolved}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-orange-500 tabular-nums font-semibold">
                      {entry.streak}d
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
