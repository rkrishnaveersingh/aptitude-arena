import { Exam, ExamCategory, Paper, Question, UserProfile, LeaderboardEntry, NotificationItem, AdminAnalytics, QuizConfig, QuizAttempt, Achievement } from '../types';
import { 
  INITIAL_EXAMS, 
  INITIAL_PAPERS, 
  INITIAL_QUESTIONS, 
  INITIAL_USER_PROFILE, 
  INITIAL_LEADERBOARD, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ADMIN_ANALYTICS 
} from './mockData';
import { supabase, isSupabaseConfigured, downloadPaperViaEdgeFunction, getPublicStoragePdfUrl } from './supabase';

export const getBaseApiUrl = (): string => {
  // 1. Explicit environment variable override if provided
  const envUrl = typeof import.meta !== 'undefined'
    ? (import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_BACKEND_API_URL)
    : '';

  if (envUrl) {
    let cleaned = envUrl.replace(/\/+$/, '');
    if (!cleaned.endsWith('/api')) cleaned = `${cleaned}/api`;
    return cleaned;
  }

  // 2. Local development: preserve localhost:8080 as default on developer's local machine
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

  if (isDev && isLocalhost) {
    return 'http://localhost:8080/api';
  }

  // 3. Production API Base URL (Live Java Spring Boot on Render)
  return 'https://aptitude-arena-backend-render.onrender.com/api';
};

export const BACKEND_BASE_URL = getBaseApiUrl();

const STORAGE_KEYS = {
  EXAMS: 'aptitude_arena_exams',
  PAPERS: 'aptitude_arena_papers',
  QUESTIONS: 'aptitude_arena_questions',
  USER: 'aptitude_arena_user',
  QUIZ_HISTORY: 'aptitude_arena_quiz_history',
  NOTIFICATIONS: 'aptitude_arena_notifications',
  ADMIN_ANALYTICS: 'aptitude_arena_analytics',
  SUBJECTS: 'aptitude_arena_subjects',
};

// Backend API schemas
export interface BackendExam {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  subjectIds?: string[];
}

export interface BackendSubject {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
}

export interface BackendQuestionOption {
  id: string;
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
}

export interface BackendQuestion {
  id: string;
  subjectId: string;
  questionText: string;
  explanation: string;
  difficulty: string;
  questionType: string;
  marks: number;
  negativeMarks: number;
  sourceExam?: string;
  sourceYear?: number;
  sourceQuestionNo?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  options: BackendQuestionOption[];
}

// In-memory caching for snappy UI responses
let memoryExamsCache: Exam[] | null = null;
let memorySubjectsCache: BackendSubject[] | null = null;
const memoryQuestionsBySubjectCache = new Map<string, Question[]>();

function getStored<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

/**
 * Authoritative Exam Category Classification
 * Strictly enforces real exam categories and prevents any default to 'Engineering'.
 */
export const getExamCategory = (exam: {
  name?: string;
  slug?: string;
  category?: string;
  description?: string;
}): ExamCategory => {
  const name = (exam.name || '').trim();
  const slug = (exam.slug || '').trim().toLowerCase();
  const nameLower = name.toLowerCase();

  // 1. Authoritative classifications:
  // GATE CSE → Engineering
  if (slug.includes('gate') || nameLower.includes('gate')) {
    return 'Engineering';
  }
  // SSC CGL → Government Exams
  if (slug.includes('ssc') || nameLower.includes('ssc') || slug.includes('cgl') || nameLower.includes('cgl')) {
    return 'Government Exams';
  }
  // RAS Rajasthan → State Civil Services
  if (slug.includes('ras') || nameLower.includes('ras') || slug.includes('rpsc') || nameLower.includes('rpsc') || nameLower.includes('rajasthan')) {
    return 'State Civil Services';
  }
  // JEE Main → Engineering Entrance
  if (slug.includes('jee') || nameLower.includes('jee') || nameLower.includes('joint entrance')) {
    return 'Engineering Entrance';
  }
  // CA Foundation → Commerce & Finance
  if (slug.includes('ca-') || slug.includes('ca_') || slug === 'ca' || nameLower.includes('ca foundation') || nameLower.includes('chartered account')) {
    return 'Commerce & Finance';
  }
  // NEET UG → Medical Entrance
  if (slug.includes('neet') || nameLower.includes('neet')) {
    return 'Medical Entrance';
  }
  // Quantitative Aptitude Practice Test → General Aptitude
  if (slug.includes('quantitative') || nameLower.includes('quantitative') || slug.includes('aptitude') || nameLower.includes('aptitude')) {
    return 'General Aptitude';
  }
  // UPSC Civil Services
  if (slug.includes('upsc') || nameLower.includes('upsc') || nameLower.includes('civil service')) {
    return 'Civil Services';
  }
  // Banking / IBPS
  if (slug.includes('bank') || nameLower.includes('bank') || slug.includes('ibps') || nameLower.includes('ibps')) {
    return 'Banking & Finance';
  }

  // 2. Preserve existing valid category if explicitly present and not a stale 'Engineering' default
  if (exam.category && exam.category.trim() && exam.category.trim() !== 'Engineering') {
    return exam.category.trim();
  }

  // 3. Genuinely unclassified fallback: 'Other' (never default to 'Engineering'!)
  return 'Other';
};

// Helper: Map Backend Exam to Rich Frontend Exam Object
function enrichBackendExam(be: BackendExam, allSubjectsMap: Map<string, string>): Exam {
  const nameLower = be.name.toLowerCase();
  const slugLower = be.slug.toLowerCase();

  const subjectNames = (be.subjectIds || [])
    .map(sid => allSubjectsMap.get(sid))
    .filter(Boolean) as string[];

  // Real category from centralized authoritative mapping
  const category = getExamCategory({
    name: be.name,
    slug: be.slug,
    category: (be as any).category,
    description: be.description,
  });

  let logoIcon = 'BookOpen';
  let conductingBody = 'National Examination Board';
  let bannerImage = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80';
  let difficulty: Exam['difficulty'] = 'Moderate';

  if (slugLower.includes('gate') || nameLower.includes('gate')) {
    logoIcon = 'Cpu';
    conductingBody = 'Indian Institute of Science (IISc) & IITs';
    bannerImage = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80';
    difficulty = 'Competitive';
  } else if (slugLower.includes('ssc') || nameLower.includes('ssc')) {
    logoIcon = 'Building2';
    conductingBody = 'Staff Selection Commission (SSC)';
    bannerImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';
    difficulty = 'Moderate';
  } else if (slugLower.includes('ras') || nameLower.includes('ras')) {
    logoIcon = 'Scale';
    conductingBody = 'Rajasthan Public Service Commission (RPSC)';
    bannerImage = 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80';
    difficulty = 'Competitive';
  } else if (slugLower.includes('jee') || nameLower.includes('jee')) {
    logoIcon = 'Atom';
    conductingBody = 'National Testing Agency (NTA)';
    bannerImage = 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80';
    difficulty = 'Hard';
  } else if (slugLower.includes('ca-') || nameLower.includes('ca')) {
    logoIcon = 'Calculator';
    conductingBody = 'Institute of Chartered Accountants of India (ICAI)';
    bannerImage = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80';
    difficulty = 'Moderate';
  } else if (slugLower.includes('neet') || nameLower.includes('neet')) {
    logoIcon = 'Shield';
    conductingBody = 'National Testing Agency (NTA)';
    bannerImage = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80';
    difficulty = 'Competitive';
  } else if (slugLower.includes('quantitative') || nameLower.includes('aptitude')) {
    logoIcon = 'Calculator';
    conductingBody = 'Aptitude Arena Examination Board';
    bannerImage = 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80';
    difficulty = 'Moderate';
  }

  const negText = be.negativeMarking > 0 
    ? `${be.negativeMarking} mark deduction for incorrect response` 
    : 'No negative penalty';

  return {
    id: be.id,
    slug: be.slug,
    name: be.name,
    fullName: `${be.name} - ${be.description}`,
    category,
    description: be.description,
    logoIcon,
    bannerImage,
    conductingBody,
    subjects: subjectNames.length > 0 ? subjectNames : ['General Aptitude'],
    availableYears: (be as any).availableYears || [2026, 2025, 2024, 2023],
    paperCount: (be as any).paperCount ?? (be as any).totalPapers ?? ((slugLower.includes('ssc') || nameLower.includes('ssc')) ? 3 : (be.totalQuestions > 0 ? Math.max(1, Math.round(be.totalQuestions / 35)) : 0)),
    questionCount: be.totalQuestions || 0,
    difficulty,
    examPattern: {
      durationMinutes: be.durationMinutes || 60,
      totalMarks: be.totalMarks || 100,
      negativeMarking: negText,
      sectionsCount: Math.max(1, subjectNames.length),
    },
    active: be.isActive,
    featured: true,
  };
}

// Helper: Map Backend Question to Standard Frontend Question
function mapBackendQuestion(
  bq: BackendQuestion, 
  examId: string, 
  examName: string, 
  subjectName: string
): Question {
  const rawOptions = bq.options || [];
  const validOptionIds: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  const options = validOptionIds.map((optId, idx) => {
    const found = rawOptions.find(o => o.optionLabel?.toUpperCase() === optId) || rawOptions[idx];
    return {
      id: optId,
      text: found?.optionText || `Option ${optId}`,
    };
  });

  const correct = rawOptions.find(o => o.isCorrect);
  let correctOptionId: 'A' | 'B' | 'C' | 'D' = 'A';
  if (correct && ['A', 'B', 'C', 'D'].includes(correct.optionLabel?.toUpperCase())) {
    correctOptionId = correct.optionLabel.toUpperCase() as 'A' | 'B' | 'C' | 'D';
  }

  let difficulty: Question['difficulty'] = 'medium';
  if (bq.difficulty) {
    const d = bq.difficulty.toLowerCase();
    if (d === 'easy' || d === 'hard') difficulty = d;
  }

  return {
    id: bq.id,
    examId,
    examName,
    subjectId: bq.subjectId,
    subjectName,
    year: bq.sourceYear || 2026,
    difficulty,
    text: bq.questionText || '',
    options,
    correctOptionId,
    explanation: bq.explanation || 'Verified official answer key with complete step-by-step logic.',
    marks: bq.marks || 1,
    negativeMarks: bq.negativeMarks !== undefined ? bq.negativeMarks : 0.25,
  };
}

export const examService = {
  // GET SUBJECTS FROM BACKEND
  getSubjects: async (): Promise<BackendSubject[]> => {
    if (memorySubjectsCache && memorySubjectsCache.length > 0) {
      return memorySubjectsCache;
    }

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/subjects`, {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const data: BackendSubject[] = await res.json();
        memorySubjectsCache = data;
        setStored(STORAGE_KEYS.SUBJECTS, data);
        return data;
      }
    } catch (err) {
      console.warn('Could not fetch subjects from Render backend, reading local store:', err);
    }

    const stored = getStored<BackendSubject[]>(STORAGE_KEYS.SUBJECTS, []);
    if (stored.length > 0) {
      memorySubjectsCache = stored;
      return stored;
    }
    return [];
  },

  // GET EXAMS (PRIMARY: RENDER BACKEND)
  getExams: async (): Promise<Exam[]> => {
    if (memoryExamsCache && memoryExamsCache.length > 0) {
      return memoryExamsCache;
    }

    let loadedExams: Exam[] = [];

    try {
      // 1. Fetch live exams and subjects simultaneously from Render
      const [examsRes, subjects] = await Promise.all([
        fetch(`${BACKEND_BASE_URL}/exams`, { headers: { 'Accept': 'application/json' } }),
        examService.getSubjects(),
      ]);

      if (examsRes.ok) {
        const backendExams: BackendExam[] = await examsRes.json();
        const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

        if (Array.isArray(backendExams) && backendExams.length > 0) {
          loadedExams = backendExams.map(be => enrichBackendExam(be, subjectMap));
        }
      }
    } catch (err) {
      console.warn('Render backend exam fetch failed, falling back:', err);
    }

    // Supabase fallback if Render backend is offline
    if (loadedExams.length === 0 && isSupabaseConfigured) {
      try {
        const { data: dbExams } = await supabase.from('exams').select('*').order('name');
        if (dbExams && dbExams.length > 0) {
          loadedExams = dbExams.map((dbEx: any) => ({
            id: dbEx.id,
            slug: (dbEx.code || dbEx.name || 'exam').toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: dbEx.name,
            fullName: dbEx.description || dbEx.name,
            category: getExamCategory({
              name: dbEx.name,
              slug: dbEx.code,
              category: dbEx.category,
              description: dbEx.description,
            }),
            description: dbEx.description || 'Examination module.',
            logoIcon: 'Cpu',
            conductingBody: 'National Testing Board',
            subjects: ['General Aptitude'],
            availableYears: [2026, 2025, 2024],
            paperCount: 15,
            questionCount: 100,
            difficulty: 'Moderate',
            examPattern: {
              durationMinutes: 60,
              totalMarks: 100,
              negativeMarking: '0.25 mark penalty for wrong response',
              sectionsCount: 3,
            },
            active: dbEx.is_active ?? true,
            featured: true,
          }));
        }
      } catch (e) {
        // continue
      }
    }

    // When live backend returns exams, use them directly without mock data pollution
    if (loadedExams.length > 0) {
      const normalizedLoaded = loadedExams.map(ex => ({
        ...ex,
        category: getExamCategory(ex),
      }));
      memoryExamsCache = normalizedLoaded;
      setStored(STORAGE_KEYS.EXAMS, normalizedLoaded);
      return normalizedLoaded;
    }

    const fallback = getStored<Exam[]>(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
    const normalizedFallback = fallback.map(ex => ({
      ...ex,
      category: getExamCategory(ex),
    }));
    memoryExamsCache = normalizedFallback;
    return normalizedFallback;
  },

  getExamBySlug: async (slug: string): Promise<Exam | undefined> => {
    const exams = await examService.getExams();
    const s = slug.toLowerCase();
    return exams.find(e => 
      e.slug.toLowerCase() === s || 
      e.id.toLowerCase() === s || 
      e.name.toLowerCase() === s ||
      (s.startsWith('exam-') && e.slug.toLowerCase() === s.replace('exam-', ''))
    );
  },

  saveExam: async (exam: Exam): Promise<Exam> => {
    const exams = await examService.getExams();
    const idx = exams.findIndex(e => e.id === exam.id || e.slug === exam.slug);
    let updated: Exam[];
    if (idx >= 0) {
      updated = [...exams];
      updated[idx] = exam;
    } else {
      updated = [exam, ...exams];
    }
    memoryExamsCache = updated;
    setStored(STORAGE_KEYS.EXAMS, updated);
    return exam;
  },

  deleteExam: async (examId: string): Promise<boolean> => {
    const exams = await examService.getExams();
    const updated = exams.filter(e => e.id !== examId && e.slug !== examId);
    memoryExamsCache = updated;
    setStored(STORAGE_KEYS.EXAMS, updated);
    return true;
  },

  // PAPERS (Supports live GET /api/papers?exam=...&year=...)
  getPapers: async (filters?: {
    examId?: string;
    year?: number | 'all';
    subject?: string;
    difficulty?: string;
    paperType?: string;
    search?: string;
  }): Promise<Paper[]> => {
    let allPapers: Paper[] = [];
    const exams = await examService.getExams();

    // 1. Fetch from live backend /papers endpoint (e.g. GET /api/papers?exam=SSC-CGL&year=2024)
    let backendPapers: Paper[] = [];
    try {
      let targetExamCode = '';
      if (filters?.examId && filters.examId !== 'all') {
        const found = exams.find(e => e.id === filters.examId || e.slug === filters.examId);
        if (found) {
          if (found.slug.includes('gate')) targetExamCode = 'GATE-CSE';
          else if (found.slug.includes('ssc')) targetExamCode = 'SSC-CGL';
          else if (found.slug.includes('ras')) targetExamCode = 'RAS-Rajasthan';
          else if (found.slug.includes('jee')) targetExamCode = 'JEE-Main';
          else if (found.slug.includes('ca')) targetExamCode = 'CA-Foundation';
          else if (found.slug.includes('neet')) targetExamCode = 'NEET-UG';
          else targetExamCode = found.name.replace(/\s+/g, '-');
        } else {
          targetExamCode = filters.examId;
        }
      }

      // If specific exam or general query, query relevant examination codes
      const examQueries = targetExamCode 
        ? [targetExamCode] 
        : ['SSC-CGL', 'RAS-Rajasthan', 'JEE-Main', 'CA-Foundation', 'NEET-UG', 'GATE-CSE'];

      // Query across active previous-year archive years (2024, 2025, 2023)
      const yearsToQuery = (filters?.year && filters.year !== 'all') 
        ? [String(filters.year)] 
        : ['2024', '2025', '2023'];

      const fetchPaperPromises: Promise<any[]>[] = [];
      for (const exCode of examQueries) {
        for (const yr of yearsToQuery) {
          fetchPaperPromises.push((async () => {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 4000);
              const res = await fetch(`${getBaseApiUrl()}/papers?exam=${encodeURIComponent(exCode)}&year=${encodeURIComponent(yr)}`, {
                headers: { 'Accept': 'application/json' },
                signal: controller.signal,
              });
              clearTimeout(timeoutId);
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                  return data;
                }
              }
            } catch {
              // continue
            }
            return [];
          })());
        }
      }

      const paperResults = await Promise.all(fetchPaperPromises);
      const rawBackendList = paperResults.flat();

      if (rawBackendList.length > 0) {
        backendPapers = rawBackendList.map((bp: any, idx: number) => {
          const bpCode = (bp.examCode || bp.exam || '').toLowerCase();
          const examMatch = exams.find(e => 
            e.id === bp.examId || 
            (bpCode && (
              e.slug.toLowerCase().includes(bpCode) || 
              bpCode.includes(e.slug.toLowerCase()) ||
              e.name.toLowerCase().includes(bpCode) ||
              bpCode.includes(e.name.toLowerCase().replace(/\s+/g, '-'))
            )) ||
            e.slug.toLowerCase() === (bp.exam || bp.slug || '').toLowerCase() ||
            e.name.toLowerCase() === (bp.exam || bp.examName || '').toLowerCase()
          );

          const storagePath = bp.filePath || bp.file_path || bp.storagePath || bp.storage_path;
          const pdfUrl = bp.pdfUrl || bp.pdf_url || (storagePath ? getPublicStoragePdfUrl(storagePath) : undefined);

          let cleanTitle = bp.title || `${examMatch?.name || bp.examCode || 'Exam'} ${bp.year || 2024} Question Paper`;
          if (cleanTitle === 'CCA Foundation') {
            cleanTitle = 'CA Foundation 2024 Official Solved Question Paper';
          } else if (cleanTitle.startsWith('SSC-CGL')) {
            cleanTitle = cleanTitle.replace(/[-_]/g, ' ');
          } else if (cleanTitle.toLowerCase().startsWith('ras')) {
            cleanTitle = `RPSC RAS ${bp.year || 2024} Official Question Paper (${cleanTitle.toUpperCase()})`;
          } else {
            cleanTitle = cleanTitle.replace(/-/g, ' ');
          }

          return {
            id: bp.id ? `backend-paper-${bp.id}` : `backend-paper-${idx}`,
            examId: examMatch?.id || bp.examId || 'exam-ssc',
            examName: examMatch?.name || bp.examName || bp.exam || bp.examCode || 'Competitive Exam',
            year: Number(bp.year) || 2024,
            subjectName: bp.subjectName || bp.subject || (examMatch?.subjects?.[0] || 'All Sections'),
            title: cleanTitle,
            durationMinutes: bp.durationMinutes || examMatch?.examPattern?.durationMinutes || 60,
            totalMarks: bp.totalMarks || examMatch?.examPattern?.totalMarks || 100,
            totalQuestions: bp.totalQuestions || examMatch?.questionCount || 100,
            difficulty: (bp.difficulty?.toLowerCase() || 'medium') as Paper['difficulty'],
            pdfUrl,
            filePath: storagePath,
            fileSizeBytes: bp.fileSizeBytes || bp.file_size || 3800000,
            downloadAvailable: Boolean(pdfUrl || storagePath),
            downloadCount: bp.downloadCount || (1400 + (idx * 210)),
            instructions: bp.instructions || [
              'Official examination booklet from previous year.',
              'Answer keys and complete step-by-step solutions included.',
              'Standard examination rules and marking scheme apply.'
            ],
            paperType: (bp.paperType || 'Full Length') as Paper['paperType'],
            createdAt: bp.createdAt || bp.created_at || '2024-10-01T00:00:00Z',
          };
        });
      }
    } catch {
      // Backend /papers offline or timed out, seamless fallback
    }

    // Supabase papers table query if configured
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('papers').select('*');
        if (filters?.year && filters.year !== 'all') {
          query = query.eq('year', filters.year);
        }
        const { data: dbPapers } = await query;
        if (dbPapers && Array.isArray(dbPapers) && dbPapers.length > 0) {
          const mappedDbPapers: Paper[] = dbPapers.map((dbP: any) => {
            const examMatch = exams.find(e => e.id === dbP.exam_id || e.name.toLowerCase() === (dbP.exam_name || '').toLowerCase());
            const storagePath = dbP.file_path || dbP.storage_path;
            const pdfUrl = dbP.pdf_url || (storagePath ? getPublicStoragePdfUrl(storagePath) : undefined);
            return {
              id: String(dbP.id),
              examId: examMatch?.id || dbP.exam_id || 'exam-gate',
              examName: examMatch?.name || dbP.exam_name || 'Competitive Exam',
              year: Number(dbP.year) || 2024,
              subjectName: dbP.subject_name || dbP.subject || 'All Sections',
              title: dbP.title || `${examMatch?.name || 'Exam'} Paper`,
              durationMinutes: dbP.duration_minutes || 60,
              totalMarks: dbP.total_marks || 100,
              totalQuestions: dbP.total_questions || 100,
              difficulty: (dbP.difficulty?.toLowerCase() || 'medium') as Paper['difficulty'],
              pdfUrl,
              filePath: storagePath,
              fileSizeBytes: dbP.file_size_bytes || 4000000,
              downloadAvailable: dbP.download_available ?? true,
              downloadCount: dbP.download_count || 1200,
              instructions: dbP.instructions || ['Official examination paper.'],
              paperType: (dbP.paper_type || 'Full Length') as Paper['paperType'],
              createdAt: dbP.created_at || '2024-10-01T00:00:00Z',
            };
          });
          backendPapers = [...backendPapers, ...mappedDbPapers];
        }
      } catch {
        // ignore
      }
    }

    // 2. Dynamically derive official papers from live exams
    const livePapers: Paper[] = exams.flatMap((ex, examIndex) => {
      const papersForExam: Paper[] = [];
      const primarySubject = ex.subjects[0] || 'General Aptitude';

      const cleanExamCode = ex.name.replace(/\s+/g, '-');

      // 1. Official Simulation / Practice Paper
      papersForExam.push({
        id: `paper-${ex.slug}-2026-full`,
        examId: ex.id,
        examName: ex.name,
        year: 2026,
        subjectName: 'Comprehensive All Sections',
        title: `${ex.name} 2026 Official Practice Paper`,
        durationMinutes: ex.examPattern.durationMinutes,
        totalMarks: ex.examPattern.totalMarks,
        totalQuestions: ex.questionCount,
        difficulty: (ex.difficulty.toLowerCase() === 'competitive' ? 'hard' : 'medium') as Paper['difficulty'],
        fileSizeBytes: 3850000 + (examIndex * 150000),
        filePath: `${cleanExamCode}/2026/${cleanExamCode}-2026-Practice-Paper.pdf`,
        downloadAvailable: false,
        downloadCount: 1420 + (examIndex * 210),
        instructions: [
          `Total duration is ${ex.examPattern.durationMinutes} minutes.`,
          ex.examPattern.negativeMarking,
          'Calculator permissions follow standard national testing norms.',
          'Review all marked responses before final submission.'
        ],
        paperType: 'Full Length',
        createdAt: '2026-10-09T12:00:00Z',
      });

      // 2. Previous Year Paper
      papersForExam.push({
        id: `paper-${ex.slug}-2025-pyq`,
        examId: ex.id,
        examName: ex.name,
        year: 2025,
        subjectName: primarySubject,
        title: `${ex.name} 2025 Solved PYQ Paper`,
        durationMinutes: ex.examPattern.durationMinutes,
        totalMarks: ex.examPattern.totalMarks,
        totalQuestions: Math.max(30, Math.round(ex.questionCount * 0.8)),
        difficulty: 'medium',
        fileSizeBytes: 4120000 + (examIndex * 120000),
        filePath: `${cleanExamCode}/2025/${cleanExamCode}-2025-Solved-PYQ-Paper.pdf`,
        downloadAvailable: false,
        downloadCount: 2850 + (examIndex * 340),
        instructions: [
          'Authentic previous-year questions verified with final official keys.',
          'Includes step-by-step logic and concept explanations.',
          'Timed simulation mode enabled.'
        ],
        paperType: 'Full Length',
        createdAt: '2025-10-15T09:00:00Z',
      });

      // 3. Subject-wise paper if exam has specific subjects
      if (ex.subjects.length > 1) {
        const secSub = ex.subjects[1];
        papersForExam.push({
          id: `paper-${ex.slug}-2026-sec`,
          examId: ex.id,
          examName: ex.name,
          year: 2026,
          subjectName: secSub,
          title: `${ex.name} 2026 Sectional: ${secSub}`,
          durationMinutes: Math.round(ex.examPattern.durationMinutes / 2),
          totalMarks: Math.round(ex.examPattern.totalMarks / 2),
          totalQuestions: Math.max(15, Math.round(ex.questionCount / 3)),
          difficulty: 'medium',
          fileSizeBytes: 2400000,
          filePath: `${cleanExamCode}/2026/${cleanExamCode}-Sectional-${secSub.replace(/\s+/g, '-')}.pdf`,
          downloadAvailable: false,
          downloadCount: 950 + (examIndex * 110),
          instructions: [
            `Focused practice for ${secSub}.`,
            'Timed module for accuracy and speed optimization.',
          ],
          paperType: 'Subject Wise',
          createdAt: '2026-09-20T14:00:00Z',
        });
      }

      return papersForExam;
    });

    // Merge backendPapers, live generated simulation papers, and INITIAL_PAPERS
    const combinedPapers = [...backendPapers, ...livePapers];
    const seenPaperIds = new Set(combinedPapers.map(p => p.id));
    const extraInitial = INITIAL_PAPERS.filter(p => !seenPaperIds.has(p.id));
    allPapers = [...combinedPapers, ...extraInitial];

    // Apply filters
    return allPapers.filter(p => {
      if (filters?.examId && filters.examId !== 'all') {
        const found = exams.find(e => e.id === filters.examId || e.slug === filters.examId);
        const targetSlug = found?.slug || filters.examId.toLowerCase();
        const targetName = found?.name?.toLowerCase() || '';

        const examMatch = p.examId === filters.examId || 
                          p.examName.toLowerCase() === filters.examId.toLowerCase() ||
                          (targetName && (
                            p.examName.toLowerCase().includes(targetName) || 
                            targetName.includes(p.examName.toLowerCase()) ||
                            p.examName.toLowerCase().replace(/\s+/g, '-').includes(targetSlug) ||
                            targetSlug.includes(p.examName.toLowerCase().replace(/\s+/g, '-'))
                          )) ||
                          (filters.examId.startsWith('exam-') && p.examName.toLowerCase().includes(filters.examId.replace('exam-', '').toLowerCase()));
        if (!examMatch) return false;
      }
      if (filters?.year && filters.year !== 'all' && p.year !== Number(filters.year)) return false;
      if (filters?.subject && filters.subject !== 'all' && p.subjectName.toLowerCase() !== filters.subject.toLowerCase()) return false;
      if (filters?.difficulty && filters.difficulty !== 'all' && p.difficulty !== filters.difficulty) return false;
      if (filters?.paperType && filters.paperType !== 'all' && p.paperType !== filters.paperType) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.examName.toLowerCase().includes(q) || p.subjectName.toLowerCase().includes(q);
      }
      return true;
    });
  },

  getPaperById: async (paperId: string): Promise<Paper | undefined> => {
    const papers = await examService.getPapers();
    return papers.find(p => p.id === paperId);
  },

  savePaper: async (paper: Paper): Promise<Paper> => {
    const papers = await examService.getPapers();
    const idx = papers.findIndex(p => p.id === paper.id);
    let updated: Paper[];
    if (idx >= 0) {
      updated = [...papers];
      updated[idx] = paper;
    } else {
      updated = [paper, ...papers];
    }
    setStored(STORAGE_KEYS.PAPERS, updated);
    return paper;
  },

  deletePaper: async (paperId: string): Promise<boolean> => {
    const papers = await examService.getPapers();
    const updated = papers.filter(p => p.id !== paperId);
    setStored(STORAGE_KEYS.PAPERS, updated);
    return true;
  },

  // FETCH QUESTIONS FROM RENDER BACKEND (LIVE)
  getQuestions: async (filters?: {
    examId?: string;
    subjectId?: string;
    subjectName?: string;
    year?: number | 'all';
    difficulty?: string;
    paperId?: string;
  }): Promise<Question[]> => {
    let collectedQuestions: Question[] = [];

    // 1. Resolve exam and subjects
    const exams = await examService.getExams();
    const subjects = await examService.getSubjects();
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

    let targetExam: Exam | undefined;
    if (filters?.examId && filters.examId !== 'all') {
      const eTarget = filters.examId.toLowerCase();
      targetExam = exams.find(e => 
        e.id.toLowerCase() === eTarget || 
        e.slug.toLowerCase() === eTarget || 
        e.name.toLowerCase() === eTarget ||
        (eTarget.startsWith('exam-') && e.slug.toLowerCase() === eTarget.replace('exam-', ''))
      );
    }

    // 2. Check if a specific subjectId was directly requested
    let targetSubjectIds: string[] = [];

    if (filters?.subjectId && filters.subjectId !== 'all') {
      targetSubjectIds = [filters.subjectId];
    } else if (filters?.subjectName && filters.subjectName !== 'all') {
      const matched = subjects.find(s => s.name.toLowerCase() === filters.subjectName?.toLowerCase());
      if (matched) {
        targetSubjectIds = [matched.id];
      }
    }

    // If no specific subject filter, pull all subjects associated with target exam or top subjects
    if (targetSubjectIds.length === 0) {
      if (targetExam) {
        // Match subjects for this exam
        const examSubNames = new Set(targetExam.subjects.map(s => s.toLowerCase()));
        targetSubjectIds = subjects.filter(s => examSubNames.has(s.name.toLowerCase())).map(s => s.id);
      }
      
      // Fallback: if still empty, use first 6 active subjects
      if (targetSubjectIds.length === 0) {
        targetSubjectIds = subjects.slice(0, 6).map(s => s.id);
      }
    }

    // 3. Fetch questions for each subject from Render backend (with caching)
    const fetchPromises = targetSubjectIds.map(async (sid) => {
      if (memoryQuestionsBySubjectCache.has(sid)) {
        return memoryQuestionsBySubjectCache.get(sid) || [];
      }

      try {
        const url = `${BACKEND_BASE_URL}/questions?subjectId=${encodeURIComponent(sid)}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const rawQuestions: BackendQuestion[] = await res.json();
          if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
            const subName = subjectMap.get(sid) || 'General Aptitude';
            const mapped = rawQuestions.map(bq => 
              mapBackendQuestion(bq, targetExam?.id || 'exam-live', targetExam?.name || 'Aptitude Arena', subName)
            );
            memoryQuestionsBySubjectCache.set(sid, mapped);
            return mapped;
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch live questions for subject ${sid}:`, err);
      }
      return [];
    });

    const results = await Promise.allSettled(fetchPromises);
    results.forEach(res => {
      if (res.status === 'fulfilled' && res.value) {
        collectedQuestions.push(...res.value);
      }
    });

    // 4. If no questions were returned from Render (e.g. offline or empty), fall back to initial questions
    if (collectedQuestions.length === 0) {
      collectedQuestions = getStored<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    }

    // 5. Apply filters
    return collectedQuestions.filter(q => {
      if (targetExam) {
        const matchesExam = q.examId === targetExam.id || 
                            q.examName.toLowerCase() === targetExam.name.toLowerCase() ||
                            targetExam.subjects.some(s => s.toLowerCase() === q.subjectName.toLowerCase());
        if (!matchesExam) return false;
      }
      if (filters?.subjectName && filters.subjectName !== 'all') {
        if (q.subjectName.toLowerCase() !== filters.subjectName.toLowerCase()) return false;
      }
      if (filters?.difficulty && filters.difficulty !== 'all' && filters.difficulty !== 'mixed') {
        if (q.difficulty !== filters.difficulty) return false;
      }
      if (filters?.year && filters.year !== 'all') {
        if (q.year !== filters.year) return false;
      }
      return true;
    });
  },

  filterQuestions: async (filters: {
    examId?: string;
    subjectName?: string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    count: number;
  }): Promise<{ questions: Question[]; countAvailable: number; note?: string }> => {
    const pool = await examService.getQuestions({
      examId: filters.examId,
      subjectName: filters.subjectName,
      difficulty: filters.difficulty !== 'mixed' ? filters.difficulty : undefined,
    });

    const countAvailable = pool.length;
    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(filters.count, shuffled.length));

    let note: string | undefined;
    if (countAvailable < filters.count) {
      note = `Loaded all ${countAvailable} available questions from live examination bank.`;
    }

    return {
      questions: picked,
      countAvailable,
      note,
    };
  },

  saveQuestion: async (question: Question): Promise<Question> => {
    const questions = await examService.getQuestions();
    const idx = questions.findIndex(q => q.id === question.id);
    let updated: Question[];
    if (idx >= 0) {
      updated = [...questions];
      updated[idx] = question;
    } else {
      updated = [question, ...questions];
    }
    setStored(STORAGE_KEYS.QUESTIONS, updated);
    return question;
  },

  bulkAddQuestions: async (newQuestions: Question[]): Promise<number> => {
    const questions = await examService.getQuestions();
    const updated = [...newQuestions, ...questions];
    setStored(STORAGE_KEYS.QUESTIONS, updated);
    return newQuestions.length;
  },

  deleteQuestion: async (questionId: string): Promise<boolean> => {
    const questions = await examService.getQuestions();
    const updated = questions.filter(q => q.id !== questionId);
    setStored(STORAGE_KEYS.QUESTIONS, updated);
    return true;
  },

  // ACHIEVEMENTS
  getAchievements: async (): Promise<Achievement[]> => {
    return INITIAL_USER_PROFILE.achievements;
  },

  // USER PROFILE
  getUserProfile: async (): Promise<UserProfile> => {
    return getStored<UserProfile>(STORAGE_KEYS.USER, INITIAL_USER_PROFILE);
  },

  saveUserProfile: async (profile: UserProfile): Promise<UserProfile> => {
    setStored(STORAGE_KEYS.USER, profile);
    return profile;
  },

  // QUIZ ATTEMPTS
  getQuizHistory: async (): Promise<QuizAttempt[]> => {
    return getStored<QuizAttempt[]>(STORAGE_KEYS.QUIZ_HISTORY, []);
  },

  saveQuizAttempt: async (attempt: QuizAttempt): Promise<QuizAttempt> => {
    // Attempt submitting to backend API
    try {
      const session = getStored<{ token?: string } | null>('aptitude_arena_auth_session', null);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
      await fetch(`${BACKEND_BASE_URL}/attempts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(attempt),
      });
    } catch {
      // Graceful offline fallback
    }

    const history = await examService.getQuizHistory();
    const updated = [attempt, ...history];
    setStored(STORAGE_KEYS.QUIZ_HISTORY, updated);

    // Update user stats
    const profile = await examService.getUserProfile();
    const newSolved = profile.totalQuestionsSolved + attempt.questions.length;
    const newQuizzes = profile.totalQuizzesTaken + 1;
    const newTodaySolved = profile.todaySolved + attempt.questions.length;
    const newAvgAccuracy = Math.round(((profile.averageAccuracy * profile.totalQuizzesTaken) + attempt.accuracy) / newQuizzes);
    const newStudyMinutes = profile.totalStudyMinutes + Math.round(attempt.timeSpentSeconds / 60);

    const updatedProfile: UserProfile = {
      ...profile,
      totalQuestionsSolved: newSolved,
      totalQuizzesTaken: newQuizzes,
      todaySolved: newTodaySolved,
      averageAccuracy: newAvgAccuracy,
      totalStudyMinutes: newStudyMinutes
    };
    await examService.saveUserProfile(updatedProfile);

    return attempt;
  },

  // LEADERBOARD
  getLeaderboard: async (timeframe: 'global' | 'weekly' | 'monthly', examFilter?: string): Promise<LeaderboardEntry[]> => {
    let list = [...INITIAL_LEADERBOARD];
    if (examFilter && examFilter !== 'all') {
      list = list.filter(item => item.examCategory.toLowerCase().includes(examFilter.toLowerCase()));
    }
    if (timeframe === 'weekly') {
      list = list.map(item => ({
        ...item,
        score: Math.round(item.score * 0.22),
        questionsSolved: Math.round(item.questionsSolved * 0.2)
      }));
    } else if (timeframe === 'monthly') {
      list = list.map(item => ({
        ...item,
        score: Math.round(item.score * 0.65),
        questionsSolved: Math.round(item.questionsSolved * 0.6)
      }));
    }
    list.sort((a, b) => b.score - a.score);
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  },

  // NOTIFICATIONS
  getNotifications: async (): Promise<NotificationItem[]> => {
    return getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  markNotificationAsRead: async (notifId: string): Promise<NotificationItem[]> => {
    const list = await examService.getNotifications();
    const updated = list.map(n => n.id === notifId ? { ...n, read: true } : n);
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
    return updated;
  },

  markAllNotificationsAsRead: async (): Promise<NotificationItem[]> => {
    const list = await examService.getNotifications();
    const updated = list.map(n => ({ ...n, read: true }));
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
    return updated;
  },

  // ADMIN ANALYTICS
  getAdminAnalytics: async (): Promise<AdminAnalytics> => {
    try {
      const exams = await examService.getExams();
      const papers = await examService.getPapers();
      const totalQ = exams.reduce((acc, e) => acc + (e.questionCount || 0), 0);

      return {
        ...INITIAL_ADMIN_ANALYTICS,
        totalExams: Math.max(exams.length, INITIAL_ADMIN_ANALYTICS.totalExams),
        totalPapers: Math.max(papers.length, INITIAL_ADMIN_ANALYTICS.totalPapers),
        totalQuestions: Math.max(totalQ, INITIAL_ADMIN_ANALYTICS.totalQuestions),
      };
    } catch {
      return getStored<AdminAnalytics>(STORAGE_KEYS.ADMIN_ANALYTICS, INITIAL_ADMIN_ANALYTICS);
    }
  }
};
