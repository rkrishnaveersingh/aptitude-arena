import React, { useState } from 'react';
import { 
  ArrowRight, 
  Play, 
  FileText, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  TrendingUp,
  Brain,
  Timer,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExamCard } from '../components/cards/ExamCard';
import { PaperCard } from '../components/cards/PaperCard';
import { PaperPreviewModal } from '../components/common/PaperPreviewModal';
import { Exam, Paper } from '../types';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { exams, papers, setActiveQuizConfig, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewPaper, setPreviewPaper] = useState<Paper | null>(null);

  const categories = ['All', 'Engineering', 'Civil Services', 'Staff Selection', 'Undergraduate Science'];

  const filteredExams = selectedCategory === 'All'
    ? exams.filter(e => e.active)
    : exams.filter(e => e.active && e.category === selectedCategory);

  const handleStartPractice = (exam: Exam) => {
    setActiveQuizConfig({
      examId: exam.id,
      examName: exam.name,
      questionCount: 10,
      difficulty: 'mixed',
      timeLimitMinutes: 15,
    });
    onNavigate('/practice');
  };

  const handleStartPaperPractice = (paper: Paper) => {
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
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Domain kicker: clean text without static pill capsules */}
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>All-India Competitive Examination Suite</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500">Official PYQ Practice</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] text-balance">
                Master Competitive Aptitude with Real Previous-Year Papers.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Prepare systematically for GATE, SSC, RAS, JEE, and national exams. Practice authentic past papers under exact timed conditions with instant answer analysis and verified solutions.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('/practice')}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Practice Quiz</span>
                </button>

                <button
                  onClick={() => onNavigate('/papers')}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Browse Previous Papers</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="block text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    12,500+
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Verified Questions
                  </span>
                </div>
                <div>
                  <span className="block text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    150+
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Past Official Papers
                  </span>
                </div>
                <div>
                  <span className="block text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    99.4%
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Key Accuracy Rate
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop"
                  alt="Aptitude Arena study and exam preparation workspace"
                  className="w-full h-80 sm:h-96 object-cover"
                  loading="eager"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 block mb-1">
                      Adaptive Test Simulator
                    </span>
                    <p className="text-xs text-slate-200 leading-snug">
                      Realistic virtual examination interface matching official GATE & NTA testing patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Examinations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Target Examinations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your competitive goal to access subject-wise question banks and authentic papers.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg overflow-x-auto max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map(exam => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onSelect={e => onNavigate(`/exams/${e.slug}`)}
              onPractice={handleStartPractice}
              onViewPapers={e => onNavigate(`/papers?exam=${e.id}`)}
            />
          ))}
        </div>
      </section>

      {/* Why Choose Aptitude Arena & Core Features */}
      <section className="bg-slate-100/60 dark:bg-slate-900/40 py-16 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Engineered for High-Percentile Results
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Every feature is built around the cognitive demands of real competitive examination halls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Timer className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Authentic Timed Simulator
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Practice with real countdown timers, negative marking penalties, and palette review flags.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                In-Depth Explanations
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Detailed step-by-step mathematical proofs, working formulas, and conceptual reasoning.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Daily Study Heatmap
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Build unbroken daily preparation habits with our visual 12-week activity heatmap.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Offline Document Archive
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Download original examination question booklets and answer keys for flexible offline study.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Previous Year Papers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recent Previous Year Papers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Freshly uploaded papers with verified solutions and answer keys.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/papers')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Papers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {papers.slice(0, 3).map(paper => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onPreview={p => setPreviewPaper(p)}
              onStartPractice={handleStartPaperPractice}
            />
          ))}
        </div>
      </section>

      {/* Call to action card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-600 dark:bg-indigo-700 rounded-2xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Ready to Test Your Speed and Accuracy?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
              Create a custom 10-question practice sprint or take a full-length 60-minute simulated mock test now.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/practice')}
            className="px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            Launch Practice Arena
          </button>
        </div>
      </section>

      {/* Paper Preview Modal */}
      <PaperPreviewModal
        paper={previewPaper}
        onClose={() => setPreviewPaper(null)}
        onStartPractice={handleStartPaperPractice}
      />
    </div>
  );
};
