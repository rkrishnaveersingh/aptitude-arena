import React, { useEffect, useState } from 'react';
import { Clock, Pause, Play, AlertTriangle } from 'lucide-react';

interface QuizTimerProps {
  totalSeconds: number;
  onTimeUp: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onSecondsChange?: (secondsRemaining: number) => void;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({
  totalSeconds,
  onTimeUp,
  isPaused,
  onTogglePause,
  onSecondsChange,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1;
        if (onSecondsChange) onSecondsChange(next);
        if (next <= 0) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, secondsLeft, onTimeUp, onSecondsChange]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 180; // under 3 minutes

  const formatTime = (val: number) => (val < 10 ? `0${val}` : `${val}`);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold tabular-nums transition-colors ${
        isUrgent
          ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400 animate-pulse'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-slate-400" />
      )}
      <span>
        {formatTime(minutes)}:{formatTime(seconds)}
      </span>

      <button
        onClick={onTogglePause}
        className="ml-1 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
        title={isPaused ? 'Resume Timer' : 'Pause Timer'}
      >
        {isPaused ? <Play className="w-3 h-3 text-emerald-500" /> : <Pause className="w-3 h-3" />}
      </button>
    </div>
  );
};
