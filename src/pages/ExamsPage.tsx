import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExamCard } from '../components/cards/ExamCard';
import { EmptyState } from '../components/common/EmptyState';
import { Exam } from '../types';

interface ExamsPageProps {
  onNavigate: (path: string) => void;
}

export const ExamsPage: React.FC<ExamsPageProps> = ({ onNavigate }) => {
  const { exams, setActiveQuizConfig } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'questions' | 'name'>('popular');
  const [visibleCount, setVisibleCount] = useState(6);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    exams.forEach(e => set.add(e.category));
    return ['all', ...Array.from(set)];
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter(e => {
      if (!e.active) return false;
      if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && e.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = e.name.toLowerCase().includes(q);
        const matchesFull = e.fullName.toLowerCase().includes(q);
        const matchesSubject = e.subjects.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesFull && !matchesSubject) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'questions') return b.questionCount - a.questionCount;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.paperCount - a.paperCount; // popular default
    });
  }, [exams, selectedCategory, selectedDifficulty, search, sortBy]);

  const displayedExams = filteredExams.slice(0, visibleCount);
  const hasMore = visibleCount < filteredExams.length;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Competitive Exam Explorer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore structured preparation modules, official syllabus domains, and past year question banks.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by exam name, syllabus subject, or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
              <option value="competitive">Competitive</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-indigo-500"
            >
              <option value="popular">Most Popular</option>
              <option value="questions">Question Volume</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Clear Bar */}
        {(search || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>
              Showing {filteredExams.length} matching examinations
            </span>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {filteredExams.length === 0 ? (
        <EmptyState
          title="No examinations match your filter"
          description="Try relaxing your search terms or selecting a different category to see available examination papers."
          actionText="Clear All Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('all');
            setSelectedDifficulty('all');
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedExams.map(exam => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onSelect={e => onNavigate(`/exams/${e.slug}`)}
                onPractice={handleStartPractice}
                onViewPapers={e => onNavigate(`/papers?exam=${e.id}`)}
              />
            ))}
          </div>

          {/* Load More Pagination */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="px-6 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
              >
                Load More Examinations ({filteredExams.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
