import React from 'react';
import { ShieldCheck, Target, Award, BookOpen, Clock, Users, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          About Aptitude Arena
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          The Competitive Examination Engine Built for Accuracy & Rigor
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Founded to eradicate guesswork from competitive exam preparation. We organize authentic previous-year question papers, simulate real timed examination conditions, and deliver step-by-step mathematical proofs.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            100% Authentic Official Papers
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All previous-year booklets are sourced directly from conducting agencies (IITs, SSC, RPSC, NTA) and verified against official final master keys.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            Exact Examination Simulation
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            From negative marking algorithms to question palettes with review flags, practice under conditions that replicate actual hall stress.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            Habit & Streak Engineering
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Consistency determines cutoffs. Our visual 12-week activity heatmap helps candidates build unbroken daily problem-solving rhythms.
          </p>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Frequently Answered Inquiries
        </h2>
        <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="pt-3">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
              Are these questions and solutions free to practice?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Yes, Aptitude Arena provides free open access to previous-year question sets, mock simulators, and detailed step-by-step explanations.
            </p>
          </div>

          <div className="pt-4">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
              Can additional examinations like UPSC, Banking, and State PSCs be supported?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Absolutely. Our architecture dynamically supports adding unlimited examinations, subject trees, and question archives through the administrative management interface.
            </p>
          </div>

          <div className="pt-4">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
              Can I download papers to study without an internet connection?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Yes, click "Download Paper" on any previous-year booklet in the library to save a formatted offline text/PDF document containing all problems, keys, and candidate instructions.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Bottom */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('/practice')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-sm"
        >
          <span>Start Practicing Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
