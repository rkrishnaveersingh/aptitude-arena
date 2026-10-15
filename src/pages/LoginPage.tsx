import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LoginPageProps {
  onNavigate: (path: string) => void;
  initialTab?: 'student' | 'admin';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, initialTab = 'student' }) => {
  const { loginStudent, registerStudent, loginAdmin, executePendingAction, exams } = useApp();

  // Primary Tab: 'student' or 'admin'
  const [activeRoleTab, setActiveRoleTab] = useState<'student' | 'admin'>(initialTab);

  // Student Sub-mode: 'login' or 'register'
  const [studentMode, setStudentMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetExam, setTargetExam] = useState('GATE (Engineering)');

  // Admin Fields
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setError(null);
    setSuccess(null);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (studentMode === 'register') {
      const res = registerStudent({
        name,
        email,
        password,
        confirmPassword,
        targetExam,
      });

      setIsLoading(false);
      if (res.success) {
        setSuccess('Registration successful! Redirecting to your dashboard...');
        setTimeout(() => {
          executePendingAction();
          onNavigate('/dashboard');
        }, 400);
      } else {
        setError(res.error || 'Failed to create student account.');
      }
    } else {
      const res = loginStudent(email, password);
      setIsLoading(false);
      if (res.success) {
        setSuccess('Login successful! Redirecting to your dashboard...');
        setTimeout(() => {
          executePendingAction();
          onNavigate('/dashboard');
        }, 400);
      } else {
        setError(res.error || 'Invalid email or password.');
      }
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const res = loginAdmin(adminEmail, adminPassword);
    setIsLoading(false);

    if (res.success) {
      setSuccess('Admin authentication verified! Redirecting to Management Console...');
      setTimeout(() => {
        onNavigate('/admin');
      }, 400);
    } else {
      setError(res.error || 'Invalid administrator credentials. Incorrect password.');
    }
  };

  const fillDemoStudent = () => {
    setEmail('aryan.sharma@prep.arena');
    setPassword('student@123');
    setStudentMode('login');
    setError(null);
  };

  const fillDemoAdmin = () => {
    setAdminEmail('admin@aptitudearena.internal');
    setAdminPassword('krishna@123');
    setError(null);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 sm:py-16">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-10 transition-colors">
        {/* Header Wordmark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aptitude Arena Authentication</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {activeRoleTab === 'student'
              ? studentMode === 'login'
                ? 'Student Aspirant Sign In'
                : 'Register Student Account'
              : 'Administrator Portal Login'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {activeRoleTab === 'student'
              ? studentMode === 'login'
                ? 'Sign in to access your practice history, active streaks, and revision bookmarks.'
                : 'Create your personalized revision profile across all national competitive exams.'
              : 'Secure access for exam coordinators and platform administrators.'}
          </p>
        </div>

        {/* TWO CLEARLY SEPARATED LOGIN OPTIONS / TABS */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('student');
              resetForm();
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeRoleTab === 'student'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student / Aspirant</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('admin');
              resetForm();
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeRoleTab === 'admin'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* SECTION A: STUDENT AUTHENTICATION */}
        {activeRoleTab === 'student' && (
          <div>
            {/* Sub-toggle: Sign In vs Create Account */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {studentMode === 'login' ? "Don't have an account yet?" : 'Already registered?'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStudentMode(studentMode === 'login' ? 'register' : 'login');
                  resetForm();
                }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {studentMode === 'login' ? 'Create Student Account →' : 'Sign In Instead →'}
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              {studentMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Examination
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <select
                        value={targetExam}
                        onChange={e => setTargetExam(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {exams.map(ex => (
                          <option key={ex.id} value={`${ex.name} (${ex.category})`}>
                            {ex.name} - {ex.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Student Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {studentMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{studentMode === 'login' ? 'Sign In as Student' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* SECTION B: ADMIN AUTHENTICATION */}
        {activeRoleTab === 'admin' && (
          <div>
            <div className="mb-6 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold block mb-0.5">Admin Management Console</span>
              <span>Administrator access is strictly restricted. Only the designated administrator email and password can access this console.</span>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Administrator Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="Enter admin email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Administrator Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Admin Credentials & Sign In</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
