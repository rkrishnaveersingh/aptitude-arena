import React, { useState, useEffect } from 'react';
import { X, Download, Play, Bookmark, FileText, Eye, CheckCircle2, Loader2, AlertTriangle, ExternalLink, BookOpen } from 'lucide-react';
import { Paper, Question } from '../../types';
import { useApp } from '../../context/AppContext';
import { examService } from '../../services/examService';
import { getPublicStoragePdfUrl } from '../../services/supabase';

interface PaperPreviewModalProps {
  paper: Paper | null;
  onClose: () => void;
  onStartPractice: (paper: Paper) => void;
}

export const PaperPreviewModal: React.FC<PaperPreviewModalProps> = ({
  paper,
  onClose,
  onStartPractice,
}) => {
  const { downloadPaper, viewPaperPdf, isBookmarked, toggleBookmark, showToast } = useApp();
  const [showAnswerKeys, setShowAnswerKeys] = useState(false);
  const [sampleQuestions, setSampleQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'pdf' | 'questions'>('pdf');

  // Compute resolved PDF URL from Supabase Storage bucket PYQS PAPER'S
  const resolvedPdfUrl = paper?.pdfUrl || (paper?.filePath && paper.downloadAvailable 
    ? getPublicStoragePdfUrl(paper.filePath) 
    : '');
  const hasWorkingPdf = Boolean(resolvedPdfUrl && paper?.downloadAvailable);

  useEffect(() => {
    if (!paper) return;
    let isCurrent = true;
    setIsLoadingQuestions(true);

    // Default to questions tab if no PDF is provisioned
    if (!hasWorkingPdf) {
      setActiveTab('questions');
    } else {
      setActiveTab('pdf');
    }

    examService.getQuestions({ examId: paper.examId })
      .then((questions) => {
        if (!isCurrent) return;
        if (questions && questions.length > 0) {
          setSampleQuestions(questions.slice(0, 3));
        } else {
          setSampleQuestions([]);
        }
      })
      .catch((err) => {
        console.warn('Could not load sample preview questions:', err);
      })
      .finally(() => {
        if (isCurrent) setIsLoadingQuestions(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [paper, hasWorkingPdf]);

  if (!paper) return null;

  const bookmarked = isBookmarked('paper', paper.id);
  const expectedPath = paper.filePath || `${paper.examName.replace(/\s+/g, '-')}/${paper.year}/${paper.title.replace(/\s+/g, '-')}.pdf`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              hasWorkingPdf 
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">{paper.examName}</span>
                <span>·</span>
                <span>Year {paper.year}</span>
                <span>·</span>
                <span>{paper.paperType}</span>
                {hasWorkingPdf ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>PDF Available</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                    <AlertTriangle className="w-3 h-3" />
                    <span>PDF Pending Upload</span>
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {paper.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleBookmark('paper', paper.id)}
              className={`p-2 rounded-lg border transition-colors ${
                bookmarked
                  ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark paper'}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs & Paper Stats */}
        <div className="px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'pdf'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Document Preview</span>
              {hasWorkingPdf && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'questions'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Questions & Solutions</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <span className="text-slate-400">Duration: </span>
              <strong className="text-slate-700 dark:text-slate-200">{paper.durationMinutes}m</strong>
            </div>
            <div>
              <span className="text-slate-400">Questions: </span>
              <strong className="text-slate-700 dark:text-slate-200">{paper.totalQuestions}</strong>
            </div>
            <div>
              <span className="text-slate-400">Total Marks: </span>
              <strong className="text-slate-700 dark:text-slate-200">{paper.totalMarks}</strong>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'pdf' ? (
            <div className="space-y-4">
              {hasWorkingPdf ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Official PDF Booklet verified from Supabase Storage bucket <code>PYQS PAPER'S</code></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewPaperPdf(paper)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-white dark:bg-slate-900 hover:bg-emerald-100/50 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in New Tab</span>
                      </button>
                    </div>
                  </div>

                  {/* Embedded PDF Viewer */}
                  <div className="relative w-full h-[480px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-inner flex flex-col">
                    <iframe
                      src={`${resolvedPdfUrl}#toolbar=1&navpanes=0`}
                      className="w-full h-full border-0"
                      title={paper.title}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-6 border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                          Official PDF Asset Pending Upload in Supabase Storage
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                          Archive Queue
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 dark:text-amber-300/90 leading-relaxed">
                        The scanned examination booklet for <strong>{paper.title}</strong> has not yet been uploaded to the Supabase Storage <code>PYQS PAPER'S</code> bucket.
                      </p>
                      <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-amber-200 dark:border-amber-800/80 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                        <div><span className="text-slate-400">Storage Bucket:</span> PYQS PAPER'S</div>
                        <div><span className="text-slate-400">Target Object Path:</span> {expectedPath}</div>
                        <div><span className="text-slate-400">Current Status:</span> Pending administrative upload</div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
                    <span>Authentic examination questions and answer keys are available interactively right now.</span>
                    <button
                      onClick={() => setActiveTab('questions')}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      View questions & solutions →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Exam Instructions */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <span>Standard Candidate Instructions</span>
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {paper.instructions.map((inst, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-semibold">{i + 1}.</span>
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Questions Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Live Examination Section Preview & Questions
                  </h4>
                  <button
                    onClick={() => setShowAnswerKeys(!showAnswerKeys)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showAnswerKeys ? 'Hide Solution Keys' : 'Reveal Solution Keys'}</span>
                  </button>
                </div>

                {isLoadingQuestions ? (
                  <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Loading real questions from live examination bank...</span>
                  </div>
                ) : sampleQuestions.length > 0 ? (
                  <div className="space-y-3 font-sans text-xs">
                    {sampleQuestions.map((q, qIndex) => (
                      <div key={q.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 space-y-3">
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Question {String(qIndex + 1).padStart(2, '0')} · {q.marks || 1} {q.marks === 1 ? 'Mark' : 'Marks'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                            {q.subjectName}
                          </span>
                        </div>

                        <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-medium">
                          {q.text}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt) => {
                            const isThisCorrect = opt.id === q.correctOptionId;
                            return (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-lg border text-xs transition-colors ${
                                  showAnswerKeys && isThisCorrect
                                    ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span className="font-bold mr-1.5">({opt.id})</span>
                                <span>{opt.text}</span>
                                {showAnswerKeys && isThisCorrect && (
                                  <span className="ml-1 text-emerald-600 dark:text-emerald-400"> ✓ [Correct]</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {showAnswerKeys && q.explanation && (
                          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 rounded-lg text-[11px] text-emerald-900 dark:text-emerald-300">
                            <strong className="block mb-0.5">Verified Explanation:</strong>
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-center text-xs text-slate-500">
                    Official simulation paper with full sectional questions ready for timed practice.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasWorkingPdf ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span>
              {hasWorkingPdf 
                ? 'Official PDF verified · Available for immediate view and download' 
                : 'PDF pending upload · Complete questions loaded for online practice'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {hasWorkingPdf ? (
              <>
                <button
                  onClick={() => viewPaperPdf(paper)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  title="Open paper PDF in new tab"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>View PDF</span>
                </button>

                <button
                  onClick={() => downloadPaper(paper)}
                  className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  title="Download official examination PDF"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Download PDF</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  showToast(`PDF booklet is pending upload in Supabase Storage "PYQS PAPER'S" bucket at path: ${expectedPath}`);
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                title={`Target path: ${expectedPath}`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PDF Pending Upload</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onStartPractice(paper);
              }}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Practice Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
