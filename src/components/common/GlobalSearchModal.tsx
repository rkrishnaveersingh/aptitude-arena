import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, FileText, HelpCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GlobalSearchModalProps {
  onNavigate: (route: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onNavigate }) => {
  const { isSearchOpen, setIsSearchOpen, exams, papers, questions } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchedExams = trimmed
    ? exams.filter(
        e =>
          e.name.toLowerCase().includes(trimmed) ||
          e.fullName.toLowerCase().includes(trimmed) ||
          e.subjects.some(s => s.toLowerCase().includes(trimmed))
      )
    : [];

  const matchedPapers = trimmed
    ? papers.filter(
        p =>
          p.title.toLowerCase().includes(trimmed) ||
          p.examName.toLowerCase().includes(trimmed) ||
          p.subjectName.toLowerCase().includes(trimmed) ||
          p.year.toString().includes(trimmed)
      )
    : [];

  const matchedQuestions = trimmed
    ? questions.filter(
        q =>
          q.text.toLowerCase().includes(trimmed) ||
          q.subjectName.toLowerCase().includes(trimmed) ||
          q.examName.toLowerCase().includes(trimmed)
      )
    : [];

  const hasResults =
    matchedExams.length > 0 || matchedPapers.length > 0 || matchedQuestions.length > 0;

  const handleSelect = (path: string) => {
    setIsSearchOpen(false);
    onNavigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search competitive exams, subjects, papers, or questions... (e.g. GATE CS, Calculus)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!trimmed && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type keywords to search across all exams, subjects, papers, and aptitude problems.
            </div>
          )}

          {trimmed && !hasResults && (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching records found for "{query}". Try searching for GATE, SSC, RAS, JEE, or specific subject terms.
            </div>
          )}

          {/* Matched Exams */}
          {matchedExams.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Examinations ({matchedExams.length})
              </div>
              <div className="space-y-1">
                {matchedExams.map(exam => (
                  <button
                    key={exam.id}
                    onClick={() => handleSelect(`/exams/${exam.slug}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{exam.name}</span>
                          <span className="text-slate-400 font-normal">·</span>
                          <span className="text-slate-500 text-[11px]">{exam.category}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md">
                          {exam.fullName}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Papers */}
          {matchedPapers.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Previous Year Papers ({matchedPapers.length})
              </div>
              <div className="space-y-1">
                {matchedPapers.map(paper => (
                  <button
                    key={paper.id}
                    onClick={() => handleSelect(`/papers?exam=${paper.examId}&year=${paper.year}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {paper.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {paper.examName} · Year {paper.year} · {paper.subjectName} · {paper.totalQuestions} Questions
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Questions */}
          {matchedQuestions.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Questions ({matchedQuestions.length})
              </div>
              <div className="space-y-1">
                {matchedQuestions.map(question => (
                  <button
                    key={question.id}
                    onClick={() => handleSelect(`/practice?exam=${question.examId}&subject=${encodeURIComponent(question.subjectName)}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div className="truncate max-w-lg">
                        <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
                          {question.text}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {question.examName} · {question.subjectName} · {question.difficulty.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px]">ESC</kbd>
            <span>to close</span>
          </div>
          <span className="text-slate-400">Aptitude Arena Catalog</span>
        </div>
      </div>
    </div>
  );
};
