import React from 'react';
import { Flame, Target, Award, Trophy, CheckCircle2 } from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementsGridProps {
  achievements: Achievement[];
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({ achievements }) => {
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'Target':
        return <Target className="w-5 h-5 text-indigo-500" />;
      case 'Award':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'Trophy':
      default:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {achievements.map(ach => {
        const isUnlocked = ach.progress >= ach.maxProgress;
        const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

        return (
          <div
            key={ach.id}
            className={`border rounded-xl p-4 transition-all flex flex-col justify-between ${
              isUnlocked
                ? 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/40 shadow-xs'
                : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {renderIcon(ach.icon)}
                </div>
                {isUnlocked ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                    {percent}%
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                {ach.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mb-4">
                {ach.description}
              </p>
            </div>

            <div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    isUnlocked ? 'bg-amber-500' : 'bg-slate-400 dark:bg-slate-600'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 tabular-nums">
                <span>
                  {ach.progress} / {ach.maxProgress}
                </span>
                <span>+{ach.rewardPoints} pts</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
