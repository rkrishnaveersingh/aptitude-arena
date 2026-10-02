import React, { useState } from 'react';
import { Flame, Trophy, Target, Calendar } from 'lucide-react';
import { UserProfile } from '../../types';

interface StreakHeatmapProps {
  user: UserProfile;
}

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ user }) => {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  // Generate last 12 weeks of dates (84 days)
  const days: { date: string; count: number; dayOfWeek: number }[] = [];
  const today = new Date();

  // Map activity history
  const activityMap: Record<string, number> = {};
  user.activityHistory.forEach(item => {
    activityMap[item.date] = item.count;
  });

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      count: activityMap[dateStr] || 0,
      dayOfWeek: d.getDay(),
    });
  }

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (count <= 10) return 'bg-emerald-200 dark:bg-emerald-950/60';
    if (count <= 20) return 'bg-emerald-400 dark:bg-emerald-800/80';
    return 'bg-emerald-600 dark:bg-emerald-500';
  };

  const dailyGoalPercent = Math.min(100, Math.round((user.todaySolved / user.dailyGoal) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
      {/* Top Banner: Streak Metrics & Daily Goal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
        {/* Current Streak */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {user.currentStreak}
              </span>
              <span className="text-xs text-slate-500 font-medium">days active</span>
            </div>
            <span className="text-[11px] text-slate-400 block">Current Daily Streak</span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {user.longestStreak}
              </span>
              <span className="text-xs text-slate-500 font-medium">days record</span>
            </div>
            <span className="text-[11px] text-slate-400 block">Longest Milestone</span>
          </div>
        </div>

        {/* Daily Goal */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              <span>Today's Target</span>
            </span>
            <span className="text-slate-500 tabular-nums">
              {user.todaySolved} / {user.dailyGoal} questions
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${dailyGoalPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
            <span>{dailyGoalPercent}% accomplished</span>
            <span>{Math.max(0, user.dailyGoal - user.todaySolved)} questions to go</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Practice Calendar Heatmap (Last 12 Weeks)</span>
          </div>
          {hoveredDay ? (
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 tabular-nums">
              {hoveredDay.count} questions solved on {hoveredDay.date}
            </span>
          ) : (
            <span className="text-xs text-slate-400">Hover over any day to inspect</span>
          )}
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
            {days.map(d => (
              <div
                key={d.date}
                onMouseEnter={() => setHoveredDay({ date: d.date, count: d.count })}
                onMouseLeave={() => setHoveredDay(null)}
                className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 cursor-pointer ${getHeatmapColor(
                  d.count
                )}`}
                title={`${d.count} questions on ${d.date}`}
              />
            ))}
          </div>
        </div>

        {/* Heatmap scale */}
        <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-slate-400">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-950/60" />
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-800/80" />
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
