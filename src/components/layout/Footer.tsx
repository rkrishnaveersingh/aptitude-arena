import React from 'react';
import { BookOpen, Shield, Award, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [showCreatedBy, setShowCreatedBy] = React.useState(false);

  const teamMembers = [
    'KRISHNA VEER SINGH',
    'MUDIT SHARMA',
    'KUSHAGRA GARG',
    'KARTIK',
    'PIYUSH',
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('/')}
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Aptitude Arena
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              The modern competitive examination practice platform. Master previous-year papers, simulate real test conditions, track your daily streak, and conquer GATE, SSC, RAS, JEE, and national exams.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                <span>Verified Official Keys</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>Detailed Solutions</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Examinations
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/exams/gate')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  GATE Engineering
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/exams/ssc')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  SSC CGL & CHSL
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/exams/ras')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  RPSC RAS Prelims
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/exams/jee')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  JEE Main & Advanced
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/exams')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Explore All Exams →
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Practice Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/papers')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Previous Year Papers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/practice')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Timed Quiz Simulation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/leaderboard')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  National Leaderboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/downloads')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Paper Downloads
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/bookmarks')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Saved Problems
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Support */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Aptitude Arena
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  About Platform
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Student Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/profile')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Profile & Daily Goals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/admin')}
                  className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Admin Management
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Aptitude Arena. Built for competitive exam excellence.
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>Clean Examination Architecture</span>
            <span>·</span>
            {/* Created By Blue Text Link */}
            <div className="relative inline-block">
              <span
                role="button"
                tabIndex={0}
                onClick={() => setShowCreatedBy(prev => !prev)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowCreatedBy(prev => !prev);
                  }
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold cursor-pointer underline underline-offset-2 transition-colors select-none"
              >
                Created By
              </span>

              {showCreatedBy && (
                <div className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white text-xs tracking-wide">
                      Development Team
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowCreatedBy(false)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                    >
                      Close
                    </span>
                  </div>
                  <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {teamMembers.map((member, idx) => (
                      <li key={member} className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white tracking-tight">
                          {member}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
            <span>·</span>
            <span>Zero Slop Interface</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
