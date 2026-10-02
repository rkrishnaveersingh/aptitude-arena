import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Users, 
  BarChart3, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Upload, 
  Search,
  Download,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatsCard } from '../components/common/StatsCard';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Exam, Paper, Question, AdminAnalytics } from '../types';
import { examService } from '../services/examService';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { exams, refreshExams, papers, refreshPapers, questions, refreshQuestions, showToast, user } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'exams' | 'papers' | 'questions' | 'users'>('analytics');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);

  // Modals state
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'exam' | 'paper' | 'question'; id: string; name: string } | null>(null);

  // Search filter inside tables
  const [tableSearch, setTableSearch] = useState('');

  useEffect(() => {
    examService.getAdminAnalytics().then(setAnalytics);
  }, []);

  // EXAM FORM STATE
  const [examForm, setExamForm] = useState({
    name: '',
    fullName: '',
    category: 'Engineering' as Exam['category'],
    description: '',
    logoIcon: 'BookOpen',
    subjects: 'General Aptitude, Core Technical',
    availableYears: '2024, 2023, 2022',
    difficulty: 'Moderate' as Exam['difficulty'],
    durationMinutes: 180,
    totalMarks: 100,
    negativeMarking: '1/3 mark deducted',
    conductingBody: '',
    active: true,
  });

  const handleOpenExamModal = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      setExamForm({
        name: exam.name,
        fullName: exam.fullName,
        category: exam.category,
        description: exam.description,
        logoIcon: exam.logoIcon,
        subjects: exam.subjects.join(', '),
        availableYears: exam.availableYears.join(', '),
        difficulty: exam.difficulty,
        durationMinutes: exam.examPattern.durationMinutes,
        totalMarks: exam.examPattern.totalMarks,
        negativeMarking: exam.examPattern.negativeMarking,
        conductingBody: exam.conductingBody,
        active: exam.active,
      });
    } else {
      setEditingExam(null);
      setExamForm({
        name: '',
        fullName: '',
        category: 'Engineering',
        description: '',
        logoIcon: 'BookOpen',
        subjects: 'General Aptitude, Technical Concepts',
        availableYears: '2024, 2023',
        difficulty: 'Moderate',
        durationMinutes: 180,
        totalMarks: 100,
        negativeMarking: '0.33 deduction per wrong response',
        conductingBody: '',
        active: true,
      });
    }
    setIsExamModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.name || !examForm.fullName) {
      showToast('Please specify the exam name and full official title.');
      return;
    }

    const subjectsArr = examForm.subjects.split(',').map(s => s.trim()).filter(Boolean);
    const yearsArr = examForm.availableYears.split(',').map(y => Number(y.trim())).filter(y => !isNaN(y));

    const examPayload: Exam = {
      id: editingExam ? editingExam.id : `exam-${examForm.name.toLowerCase().replace(/\s+/g, '-')}`,
      slug: editingExam ? editingExam.slug : examForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: examForm.name,
      fullName: examForm.fullName,
      category: examForm.category,
      description: examForm.description || `Official competitive exam for ${examForm.fullName}.`,
      logoIcon: examForm.logoIcon,
      conductingBody: examForm.conductingBody || 'National Examination Authority',
      subjects: subjectsArr.length > 0 ? subjectsArr : ['General Aptitude'],
      availableYears: yearsArr.length > 0 ? yearsArr : [2024],
      paperCount: editingExam ? editingExam.paperCount : 1,
      questionCount: editingExam ? editingExam.questionCount : 50,
      difficulty: examForm.difficulty,
      examPattern: {
        durationMinutes: examForm.durationMinutes,
        totalMarks: examForm.totalMarks,
        negativeMarking: examForm.negativeMarking,
        sectionsCount: Math.max(1, subjectsArr.length),
      },
      active: examForm.active,
    };

    await examService.saveExam(examPayload);
    await refreshExams();
    setIsExamModalOpen(false);
    showToast(editingExam ? `Exam ${examPayload.name} updated` : `New exam ${examPayload.name} created!`);
  };

  // PAPER FORM STATE
  const [paperForm, setPaperForm] = useState({
    examId: '',
    year: 2024,
    subjectName: '',
    title: '',
    durationMinutes: 180,
    totalMarks: 100,
    totalQuestions: 65,
    difficulty: 'medium' as Paper['difficulty'],
    paperType: 'Full Length' as Paper['paperType'],
    downloadAvailable: true,
  });

  const handleOpenPaperModal = (paper?: Paper) => {
    if (paper) {
      setEditingPaper(paper);
      setPaperForm({
        examId: paper.examId,
        year: paper.year,
        subjectName: paper.subjectName,
        title: paper.title,
        durationMinutes: paper.durationMinutes,
        totalMarks: paper.totalMarks,
        totalQuestions: paper.totalQuestions,
        difficulty: paper.difficulty,
        paperType: paper.paperType,
        downloadAvailable: paper.downloadAvailable,
      });
    } else {
      setEditingPaper(null);
      setPaperForm({
        examId: exams[0]?.id || '',
        year: 2024,
        subjectName: exams[0]?.subjects[0] || 'General Aptitude',
        title: '',
        durationMinutes: 180,
        totalMarks: 100,
        totalQuestions: 65,
        difficulty: 'medium',
        paperType: 'Full Length',
        downloadAvailable: true,
      });
    }
    setIsPaperModalOpen(true);
  };

  const handleSavePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperForm.title) {
      showToast('Please provide a paper title.');
      return;
    }
    const selectedEx = exams.find(e => e.id === paperForm.examId);

    const paperPayload: Paper = {
      id: editingPaper ? editingPaper.id : `paper-${Date.now()}`,
      examId: paperForm.examId,
      examName: selectedEx?.name || 'Exam',
      year: Number(paperForm.year),
      subjectName: paperForm.subjectName || 'Core Subject',
      title: paperForm.title,
      durationMinutes: Number(paperForm.durationMinutes),
      totalMarks: Number(paperForm.totalMarks),
      totalQuestions: Number(paperForm.totalQuestions),
      difficulty: paperForm.difficulty,
      fileSizeBytes: 3500000,
      downloadAvailable: paperForm.downloadAvailable,
      downloadCount: editingPaper ? editingPaper.downloadCount : 0,
      paperType: paperForm.paperType,
      createdAt: new Date().toISOString(),
      instructions: [
        'Time allowed is according to official guidelines.',
        'Negative marking applies for incorrect options.',
        'Calculator permitted per exam rules.'
      ],
    };

    await examService.savePaper(paperPayload);
    await refreshPapers();
    setIsPaperModalOpen(false);
    showToast('Paper saved successfully!');
  };

  // QUESTION FORM STATE
  const [questionForm, setQuestionForm] = useState({
    examId: '',
    subjectName: '',
    year: 2024,
    difficulty: 'medium' as Question['difficulty'],
    text: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctOptionId: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
    topic: '',
    formula: '',
  });

  const handleOpenQuestionModal = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        examId: question.examId,
        subjectName: question.subjectName,
        year: question.year,
        difficulty: question.difficulty,
        text: question.text,
        optA: question.options.find(o => o.id === 'A')?.text || '',
        optB: question.options.find(o => o.id === 'B')?.text || '',
        optC: question.options.find(o => o.id === 'C')?.text || '',
        optD: question.options.find(o => o.id === 'D')?.text || '',
        correctOptionId: question.correctOptionId,
        explanation: question.explanation,
        topic: question.topic || '',
        formula: question.formula || '',
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        examId: exams[0]?.id || '',
        subjectName: exams[0]?.subjects[0] || 'Quantitative Aptitude',
        year: 2024,
        difficulty: 'medium',
        text: '',
        optA: '',
        optB: '',
        optC: '',
        optD: '',
        correctOptionId: 'A',
        explanation: '',
        topic: '',
        formula: '',
      });
    }
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.text || !questionForm.optA || !questionForm.optB) {
      showToast('Please enter question text and at least options A and B.');
      return;
    }
    const selectedEx = exams.find(e => e.id === questionForm.examId);

    const questionPayload: Question = {
      id: editingQuestion ? editingQuestion.id : `q-${Date.now()}`,
      examId: questionForm.examId,
      examName: selectedEx?.name || 'Exam',
      subjectId: `subj-${Date.now()}`,
      subjectName: questionForm.subjectName || 'General',
      year: Number(questionForm.year),
      difficulty: questionForm.difficulty,
      text: questionForm.text,
      formula: questionForm.formula || undefined,
      options: [
        { id: 'A', text: questionForm.optA },
        { id: 'B', text: questionForm.optB },
        { id: 'C', text: questionForm.optC || 'N/A' },
        { id: 'D', text: questionForm.optD || 'N/A' },
      ],
      correctOptionId: questionForm.correctOptionId,
      explanation: questionForm.explanation || 'Verified correct option based on standard conceptual derivation.',
      topic: questionForm.topic || 'General Aptitude',
      marks: 2,
      negativeMarks: 0.66,
    };

    await examService.saveQuestion(questionPayload);
    await refreshQuestions();
    setIsQuestionModalOpen(false);
    showToast('Question saved to database!');
  };

  // BULK IMPORT
  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkInput);
      if (!Array.isArray(parsed)) {
        showToast('JSON input must be an array of question objects.');
        return;
      }
      const added = await examService.bulkAddQuestions(parsed);
      await refreshQuestions();
      setIsBulkModalOpen(false);
      showToast(`Successfully imported ${added} questions!`);
    } catch (err) {
      showToast('Invalid JSON structure. Please verify format.');
    }
  };

  // DELETE HANDLER
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'exam') {
      await examService.deleteExam(deleteTarget.id);
      await refreshExams();
    } else if (deleteTarget.type === 'paper') {
      await examService.deletePaper(deleteTarget.id);
      await refreshPapers();
    } else if (deleteTarget.type === 'question') {
      await examService.deleteQuestion(deleteTarget.id);
      await refreshQuestions();
    }
    showToast(`Deleted ${deleteTarget.name}`);
    setDeleteTarget(null);
  };

  // User list for admin
  const mockUsersList = [
    { id: 'u1', name: 'Aryan Sharma', email: 'aryan.sharma@prep.arena', role: 'student', testsTaken: 26, status: 'Active', joined: 'Aug 2026' },
    { id: 'u2', name: 'Kavita Singhal', email: 'kavita.singhal@prep.arena', role: 'student', testsTaken: 44, status: 'Active', joined: 'Jul 2026' },
    { id: 'u3', name: 'Rohan Deshmukh', email: 'rohan.d@gateprep.io', role: 'student', testsTaken: 38, status: 'Active', joined: 'Aug 2026' },
    { id: 'u4', name: 'Priya Meena', email: 'priya.ras@rpsc.gov.in', role: 'student', testsTaken: 31, status: 'Active', joined: 'Jun 2026' },
    { id: 'u5', name: 'Devansh Verma', email: 'admin@aptitudearena.internal', role: 'admin', testsTaken: 12, status: 'Active', joined: 'May 2026' },
  ];

  const [usersList, setUsersList] = useState(mockUsersList);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.from('profiles').select('*').then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map((p: any) => ({
            id: p.id,
            name: p.full_name || 'Candidate',
            email: p.id.slice(0, 8) + '@candidate.arena',
            role: p.role || 'student',
            testsTaken: 1,
            status: 'Active',
            joined: new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          }));
          setUsersList([...mapped, ...mockUsersList]);
        }
      });
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Platform Management & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic schema architecture: add unlimited examinations, subjects, papers, and questions.
          </p>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'exams'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Examinations ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('papers')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'papers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Previous Year Papers ({papers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'questions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Question Bank ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Candidates</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              label="Registered Aspirants"
              value={analytics.totalUsers.toLocaleString()}
              subtext="Total registered student profiles"
              icon={<Users className="w-4 h-4" />}
            />
            <StatsCard
              label="Active Candidates Today"
              value={analytics.activeUsersToday.toLocaleString()}
              subtext="Real-time daily active users"
              icon={<ShieldCheck className="w-4 h-4" />}
              trend={{ positive: true, label: '+12% vs yesterday' }}
            />
            <StatsCard
              label="Total Quizzes Solved"
              value={analytics.totalQuizzesTaken.toLocaleString()}
              subtext="Timed simulation attempts"
              icon={<BarChart3 className="w-4 h-4" />}
            />
            <StatsCard
              label="Question Bank Repository"
              value={analytics.totalQuestions.toLocaleString()}
              subtext="Across all subjects and years"
              icon={<HelpCircle className="w-4 h-4" />}
            />
          </div>

          {/* Visual Trend Bars and Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Practice Volume Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Daily Test Simulation Volume
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Number of completed practice sessions over the past 7 days.
              </p>
              <div className="flex items-end justify-between gap-3 h-48 pt-6 border-b border-slate-100 dark:border-slate-800">
                {analytics.dailyAttempts.map(item => {
                  const maxAttempts = 3500;
                  const heightPercent = Math.round((item.attempts / maxAttempts) * 100);
                  return (
                    <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {item.attempts}
                      </span>
                      <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800 rounded-t-lg h-36 flex items-end overflow-hidden">
                        <div
                          className="w-full bg-indigo-600 dark:bg-indigo-500 rounded-t-lg transition-all"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exam Share Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Candidate Engagement by Examination
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Relative percentage distribution of student practice attempts.
              </p>
              <div className="space-y-4">
                {analytics.examDistribution.map(item => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.name}
                      </span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {item.percentage}% ({item.count.toLocaleString()} sessions)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
                <span>Most Downloaded: <strong>{analytics.mostDownloadedPaper}</strong></span>
                <span>Top Practiced: <strong>{analytics.mostPracticedExam}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXAMS MANAGEMENT */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Registered Examinations
            </h2>
            <button
              onClick={() => handleOpenExamModal()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Examination</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Exam Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Conducting Body</th>
                  <th className="py-3 px-4">Subjects</th>
                  <th className="py-3 px-4">Years</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {exams.map(exam => (
                  <tr key={exam.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {exam.name}
                      <span className="block text-[11px] font-normal text-slate-400">{exam.fullName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {exam.category}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {exam.conductingBody}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-xs">
                      {exam.subjects.join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-500">
                      {exam.availableYears.join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          exam.active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {exam.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenExamModal(exam)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Exam"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: 'exam',
                              id: exam.id,
                              name: exam.name,
                            })
                          }
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PAPERS MANAGEMENT */}
      {activeTab === 'papers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Previous Year Paper Library
            </h2>
            <button
              onClick={() => handleOpenPaperModal()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Previous-Year Paper</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Exam</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Downloads</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {papers.map(paper => (
                  <tr key={paper.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-sm truncate">
                      {paper.title}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {paper.examName}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {paper.year}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {paper.subjectName}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {paper.totalQuestions}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-500">
                      {paper.downloadCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenPaperModal(paper)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Paper"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: 'paper',
                              id: paper.id,
                              name: paper.title,
                            })
                          }
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete Paper"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: QUESTIONS MANAGEMENT & BULK IMPORT */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Question Bank Management
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Import JSON</span>
              </button>
              <button
                onClick={() => handleOpenQuestionModal()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Single Question</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Question Text</th>
                  <th className="py-3 px-4">Exam</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Correct Key</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {questions.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white max-w-md truncate">
                      {q.text}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {q.examName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {q.subjectName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Option ({q.correctOptionId})
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-500">
                      {q.difficulty}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenQuestionModal(q)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: 'question',
                              id: q.id,
                              name: q.text.slice(0, 30) + '...',
                            })
                          }
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Candidate Aspirants
            </h2>
            <div className="text-xs text-slate-500">
              {usersList.length} Registered Aspirants
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Quizzes Taken</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 capitalize font-medium text-slate-700 dark:text-slate-300">
                      {u.role}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {u.testsTaken} tests
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {u.joined}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXAM ADD/EDIT MODAL */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsExamModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editingExam ? 'Edit Examination' : 'Create New Examination Module'}
            </h3>
            <form onSubmit={handleSaveExam} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Exam Acronym (e.g. GATE, UPSC)
                  </label>
                  <input
                    type="text"
                    value={examForm.name}
                    onChange={e => setExamForm({ ...examForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={examForm.category}
                    onChange={e => setExamForm({ ...examForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Civil Services">Civil Services</option>
                    <option value="Staff Selection">Staff Selection</option>
                    <option value="Undergraduate Science">Undergraduate Science</option>
                    <option value="Banking & Finance">Banking & Finance</option>
                    <option value="Medical">Medical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Official Title
                </label>
                <input
                  type="text"
                  value={examForm.fullName}
                  onChange={e => setExamForm({ ...examForm, fullName: e.target.value })}
                  required
                  placeholder="e.g. Graduate Aptitude Test in Engineering"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Conducting Body
                </label>
                <input
                  type="text"
                  value={examForm.conductingBody}
                  onChange={e => setExamForm({ ...examForm, conductingBody: e.target.value })}
                  placeholder="e.g. IITs & IISc / Staff Selection Commission"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Syllabus Subjects (Comma Separated)
                </label>
                <input
                  type="text"
                  value={examForm.subjects}
                  onChange={e => setExamForm({ ...examForm, subjects: e.target.value })}
                  placeholder="Quantitative Aptitude, General Reasoning, English"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Available Years (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={examForm.availableYears}
                    onChange={e => setExamForm({ ...examForm, availableYears: e.target.value })}
                    placeholder="2024, 2023, 2022"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={examForm.difficulty}
                    onChange={e => setExamForm({ ...examForm, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                    <option value="Competitive">Competitive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={examForm.description}
                  onChange={e => setExamForm({ ...examForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="examActiveToggle"
                  checked={examForm.active}
                  onChange={e => setExamForm({ ...examForm, active: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="examActiveToggle" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Active (Visible to candidates in Exam Explorer)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Save Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAPER ADD/EDIT MODAL */}
      {isPaperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPaperModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editingPaper ? 'Edit Previous Year Paper' : 'Add Official Question Paper'}
            </h3>
            <form onSubmit={handleSavePaper} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Examination
                </label>
                <select
                  value={paperForm.examId}
                  onChange={e => setPaperForm({ ...paperForm, examId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {exams.map(exam => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name} ({exam.fullName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Paper Title
                </label>
                <input
                  type="text"
                  value={paperForm.title}
                  onChange={e => setPaperForm({ ...paperForm, title: e.target.value })}
                  required
                  placeholder="e.g. GATE 2024 CS & IT Shift 1 Official Solved Paper"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={paperForm.year}
                    onChange={e => setPaperForm({ ...paperForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={paperForm.subjectName}
                    onChange={e => setPaperForm({ ...paperForm, subjectName: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={paperForm.durationMinutes}
                    onChange={e => setPaperForm({ ...paperForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={paperForm.totalMarks}
                    onChange={e => setPaperForm({ ...paperForm, totalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    value={paperForm.totalQuestions}
                    onChange={e => setPaperForm({ ...paperForm, totalQuestions: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaperModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Save Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTION ADD/EDIT MODAL */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsQuestionModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editingQuestion ? 'Edit Question Record' : 'Add New Question'}
            </h3>
            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Exam
                  </label>
                  <select
                    value={questionForm.examId}
                    onChange={e => setQuestionForm({ ...questionForm, examId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {exams.map(ex => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={questionForm.subjectName}
                    onChange={e => setQuestionForm({ ...questionForm, subjectName: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={questionForm.difficulty}
                    onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Question Text / Problem Statement
                </label>
                <textarea
                  rows={3}
                  value={questionForm.text}
                  onChange={e => setQuestionForm({ ...questionForm, text: e.target.value })}
                  required
                  placeholder="State the aptitude or core subject problem statement clearly..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Formula / Working Identity (Optional)
                </label>
                <input
                  type="text"
                  value={questionForm.formula}
                  onChange={e => setQuestionForm({ ...questionForm, formula: e.target.value })}
                  placeholder="e.g. lim (x->0) sin(x)/x = 1"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Multiple-Choice Options
                </label>
                {(['A', 'B', 'C', 'D'] as const).map(optKey => (
                  <div key={optKey} className="flex items-center gap-2">
                    <span className="w-6 text-xs font-bold text-slate-700 dark:text-slate-300 text-center">
                      ({optKey})
                    </span>
                    <input
                      type="text"
                      value={(questionForm as any)[`opt${optKey}`]}
                      onChange={e => setQuestionForm({ ...questionForm, [`opt${optKey}`]: e.target.value })}
                      placeholder={`Text for option ${optKey}`}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <input
                      type="radio"
                      name="correctOption"
                      checked={questionForm.correctOptionId === optKey}
                      onChange={() => setQuestionForm({ ...questionForm, correctOptionId: optKey })}
                      className="text-indigo-600"
                      title={`Mark (${optKey}) as correct answer`}
                    />
                    <span className="text-[11px] text-slate-400">Correct?</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Solution & Explanation
                </label>
                <textarea
                  rows={3}
                  value={questionForm.explanation}
                  onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder="Step-by-step mathematical reasoning or conceptual explanation..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <button
              onClick={() => setIsBulkModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Bulk Question Importer
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Paste JSON array of questions to bulk insert into the exam database.
            </p>
            <textarea
              rows={8}
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
              placeholder={`[
  {
    "id": "q-demo-1",
    "examId": "exam-gate",
    "examName": "GATE",
    "subjectId": "gate-cs",
    "subjectName": "Computer Science",
    "year": 2024,
    "difficulty": "medium",
    "text": "What is the result of ...?",
    "options": [
      { "id": "A", "text": "Result 1" },
      { "id": "B", "text": "Result 2" },
      { "id": "C", "text": "Result 3" },
      { "id": "D", "text": "Result 4" }
    ],
    "correctOptionId": "A",
    "explanation": "Derived according to standard theorems."
  }
]`}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Import Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.type.toUpperCase()}?`}
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        isDestructive={true}
      />
    </div>
  );
};
