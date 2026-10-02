import React, { useState } from 'react';
import { User, Mail, Target, Award, Flame, Clock, Save, Settings, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AchievementsGrid } from '../components/dashboard/AchievementsGrid';
import { EmptyState } from '../components/common/EmptyState';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateUserProfile, openAuthModal, showToast } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [targetExam, setTargetExam] = useState(user?.targetExam || 'GATE (Computer Science)');
  const [dailyGoal, setDailyGoal] = useState<number>(user?.dailyGoal || 15);
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <EmptyState
          title="Sign in to View Your Candidate Profile"
          description="Manage your competitive examination goals, achievement badges, and personal settings."
          actionText="Sign In"
          onAction={() => openAuthModal('login')}
        />
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      name,
      email,
      targetExam,
      dailyGoal,
    });
    setIsEditing(false);
    showToast('Profile updated successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Candidate Profile & Aspirations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal credentials, examination target preferences, and unlocked achievements.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {user.name}
                </h2>
                {user.role === 'admin' ? (
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                    Aspirant
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Target Focus:</span>
                <span>{user.targetExam}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile & Goals'}
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 pt-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Update Candidate Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Primary Target Examination
                </label>
                <select
                  value={targetExam}
                  onChange={e => setTargetExam(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
                >
                  <option value="GATE (Computer Science)">GATE (Computer Science)</option>
                  <option value="GATE (Mechanical Engineering)">GATE (Mechanical Engineering)</option>
                  <option value="SSC (Combined Graduate Level)">SSC (Combined Graduate Level)</option>
                  <option value="RAS (Rajasthan Administrative Services)">RAS (Rajasthan Administrative Services)</option>
                  <option value="JEE (Main & Advanced)">JEE (Main & Advanced)</option>
                  <option value="UPSC Civil Services">UPSC Civil Services</option>
                  <option value="IBPS PO Banking">IBPS PO Banking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Daily Question Practice Goal
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={dailyGoal}
                  onChange={e => setDailyGoal(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* Lifetime Statistics Row */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Current Streak</span>
            <span className="text-xl font-bold text-orange-500 tabular-nums">
              {user.currentStreak} Days
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Questions Solved</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {user.totalQuestionsSolved}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Average Accuracy</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {user.averageAccuracy}%
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Simulated Quizzes</span>
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {user.totalQuizzesTaken}
            </span>
          </div>
        </div>
      </div>

      {/* Achievements Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Badges & Milestone Honors</span>
          </h2>
          <span className="text-xs text-slate-500">
            Earn points and advance your candidate profile
          </span>
        </div>

        <AchievementsGrid achievements={user.achievements} />
      </div>
    </div>
  );
};
