import React, { useState, useMemo } from 'react';
import { Search, Filter, FileText, Download, Calendar, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaperCard } from '../components/cards/PaperCard';
import { PaperPreviewModal } from '../components/common/PaperPreviewModal';
import { EmptyState } from '../components/common/EmptyState';
import { Paper } from '../types';

interface PapersPageProps {
  onNavigate: (path: string) => void;
  initialExamId?: string;
  initialYear?: number;
}

export const PapersPage: React.FC<PapersPageProps> = ({ 
  onNavigate, 
  initialExamId, 
  initialYear 
}) => {
  const { papers, exams, isBackendConnecting, setActiveQuizConfig, requireAuth } = useApp();

  const [search, setSearch] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId || 'all');
  const [selectedYear, setSelectedYear] = useState<string>(initialYear ? String(initialYear) : 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPaperType, setSelectedPaperType] = useState<string>('all');
  const [previewPaper, setPreviewPaper] = useState<Paper | null>(null);

  // Available unique years
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    papers.forEach(p => set.add(p.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [papers]);

  const filteredPapers = useMemo(() => {
    return papers.filter(p => {
      if (selectedExamId !== 'all') {
        const selectedExamObj = exams.find(e => e.id === selectedExamId || e.slug === selectedExamId);
        const targetSlug = selectedExamObj?.slug || selectedExamId.toLowerCase();
        const targetName = selectedExamObj?.name?.toLowerCase() || '';

        const matchesExam = p.examId === selectedExamId || 
                            p.examName.toLowerCase() === selectedExamId.toLowerCase() ||
                            (targetName && (
                              p.examName.toLowerCase().includes(targetName) || 
                              targetName.includes(p.examName.toLowerCase()) ||
                              p.examName.toLowerCase().replace(/\s+/g, '-').includes(targetSlug) ||
                              targetSlug.includes(p.examName.toLowerCase().replace(/\s+/g, '-'))
                            )) ||
                            (selectedExamId.startsWith('exam-') && p.examName.toLowerCase().includes(selectedExamId.replace('exam-', '').toLowerCase()));
        if (!matchesExam) return false;
      }
      if (selectedYear !== 'all' && p.year !== Number(selectedYear)) return false;
      if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) return false;
      if (selectedPaperType !== 'all' && p.paperType !== selectedPaperType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesExam = p.examName.toLowerCase().includes(q);
        const matchesSubject = p.subjectName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesExam && !matchesSubject) return false;
      }
      return true;
    });
  }, [papers, exams, selectedExamId, selectedYear, selectedDifficulty, selectedPaperType, search]);

  const handleStartPractice = (paper: Paper) => {
    requireAuth(() => {
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
    }, `Please sign in or register to practice ${paper.title}.`);
  };

  const handlePreviewPaper = (paper: Paper) => {
    setPreviewPaper(paper);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Previous Year Question Papers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore our verified library of official examination booklets with complete answer keys and solutions.
        </p>
      </div>

      {/* Filter Matrix */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="lg:col-span-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search papers by title or topic..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-indigo-500"
            />
          </div>

          {/* Select Exam */}
          <div className="lg:col-span-3">
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
            >
              <option value="all">All Examinations</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.fullName})
                </option>
              ))}
            </select>
          </div>

          {/* Select Year */}
          <div className="lg:col-span-2">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
            >
              <option value="all">All Years</option>
              {availableYears.map(yr => (
                <option key={yr} value={String(yr)}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Select Paper Type */}
          <div className="lg:col-span-2">
            <select
              value={selectedPaperType}
              onChange={e => setSelectedPaperType(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="Full Length">Full Length</option>
              <option value="Subject Wise">Subject Wise</option>
              <option value="Sectional">Sectional</option>
            </select>
          </div>

          {/* Select Difficulty */}
          <div className="lg:col-span-2">
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span>Found {filteredPapers.length} previous-year paper booklets</span>
          {(search || selectedExamId !== 'all' || selectedYear !== 'all' || selectedDifficulty !== 'all' || selectedPaperType !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedExamId('all');
                setSelectedYear('all');
                setSelectedDifficulty('all');
                setSelectedPaperType('all');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Papers Grid, Loading, or Empty State */}
      {isBackendConnecting && papers.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Loading previous-year question papers...
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Retrieving official question booklets and answer keys from backend.
          </p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <EmptyState
          title="No papers found matching your criteria"
          description="Try broadening your exam or year selection to view other official previous-year papers."
          actionText="View All Papers"
          onAction={() => {
            setSearch('');
            setSelectedExamId('all');
            setSelectedYear('all');
            setSelectedDifficulty('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map(paper => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onPreview={handlePreviewPaper}
              onStartPractice={handleStartPractice}
            />
          ))}
        </div>
      )}

      {/* Paper Preview Modal */}
      <PaperPreviewModal
        paper={previewPaper}
        onClose={() => setPreviewPaper(null)}
        onStartPractice={handleStartPractice}
      />
    </div>
  );
};
