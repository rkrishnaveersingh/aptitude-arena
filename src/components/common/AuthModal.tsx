import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthOpen, 
    setIsAuthOpen, 
    authInitialTab, 
    loginStudent, 
    registerStudent, 
    loginAdmin, 
    executePendingAction,
    exams 
  } = useApp();

  // Role Tab: 'student' or 'admin'
  const [activeRoleTab, setActiveRoleTab] = useState<'student' | 'admin'>('student');
  const [studentMode, setStudentMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (authInitialTab === 'admin') {
      setActiveRoleTab('admin');
      setStudentMode('login');
    } else if (authInitialTab === 'register') {
      setActiveRoleTab('student');
      setStudentMode('register');
    } else {
      setActiveRoleTab('student');
      setStudentMode('login');
    }
    setError(null);
    setSuccess(null);
  }, [authInitialTab, isAuthOpen]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetExam, setTargetExam] = useState('GATE (Engineering)');

  // Admin Form states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthOpen) return null;

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
        setSuccess('Registration successful!');
        setTimeout(() => {
          setIsAuthOpen(false);
          executePendingAction();
        }, 300);
      } else {
        setError(res.error || 'Registration failed.');
      }
    } else {
      const res = loginStudent(email, password);
      setIsLoading(false);
      if (res.success) {
        setSuccess('Welcome back!');
        setTimeout(() => {
          setIsAuthOpen(false);
          executePendingAction();
        }, 300);
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
      setSuccess('Admin credentials verified!');
      setTimeout(() => {
        setIsAuthOpen(false);
      }, 300);
    } else {
      setError(res.error || 'Invalid administrator credentials. Incorrect password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Two Tabs: Student vs Admin */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('student');
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRoleTab === 'student'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student Aspirant</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('admin');
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRoleTab === 'admin'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator</span>
          </button>
        </div>

        {/* Title */}
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {activeRoleTab === 'student'
              ? studentMode === 'login'
                ? 'Student Sign In'
                : 'Register Student Account'
              : 'Admin Portal Login'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeRoleTab === 'student'
              ? studentMode === 'login'
                ? 'Sign in to access your test dashboard, streak, and papers.'
                : 'Create your account to start tracked competitive preparation.'
              : 'Authorized coordinator credentials required (Password: krishna@123).'}
          </p>
        </div>

        {/* Feedback Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* STUDENT FLOW */}
        {activeRoleTab === 'student' && (
          <div>
            {/* Student Mode Switcher */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {studentMode === 'login' ? "New candidate?" : 'Already registered?'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStudentMode(studentMode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {studentMode === 'login' ? 'Create Free Account →' : 'Sign In Instead →'}
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-3.5">
              {studentMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Target Exam
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <select
                        value={targetExam}
                        onChange={e => setTargetExam(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
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
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-indigo-500"
                    required
                  />
                </div>
              </div>

              {studentMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-indigo-500"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>{studentMode === 'login' ? 'Sign In as Student' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ADMIN FLOW */}
        {activeRoleTab === 'admin' && (
          <div>
            <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
              <span className="font-semibold block mb-0.5">Admin Management Console</span>
              <span>Administrator access is strictly restricted. Only the authorized administrator email and password can access this console.</span>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Administrator Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="Enter admin email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Administrator Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Sign In as Admin</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
