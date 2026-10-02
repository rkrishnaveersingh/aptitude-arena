import { Exam, Paper, Question, UserProfile, LeaderboardEntry, NotificationItem, AdminAnalytics, QuizConfig, QuizAttempt, Achievement } from '../types';
import { 
  INITIAL_EXAMS, 
  INITIAL_PAPERS, 
  INITIAL_QUESTIONS, 
  INITIAL_USER_PROFILE, 
  INITIAL_LEADERBOARD, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ADMIN_ANALYTICS 
} from './mockData';
import { supabase, isSupabaseConfigured, downloadPaperViaEdgeFunction } from './supabase';

const STORAGE_KEYS = {
  EXAMS: 'aptitude_arena_exams',
  PAPERS: 'aptitude_arena_papers',
  QUESTIONS: 'aptitude_arena_questions',
  USER: 'aptitude_arena_user',
  QUIZ_HISTORY: 'aptitude_arena_quiz_history',
  NOTIFICATIONS: 'aptitude_arena_notifications',
  ADMIN_ANALYTICS: 'aptitude_arena_analytics'
};

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

export const examService = {
  // EXAMS
  getExams: async (): Promise<Exam[]> => {
    let supabaseExams: Exam[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data: dbExams, error: examErr } = await supabase
          .from('exams')
          .select('*')
          .order('name');

        const { data: dbSubjects } = await supabase
          .from('subjects')
          .select('*')
          .eq('is_active', true);

        if (!examErr && dbExams && dbExams.length > 0) {
          supabaseExams = dbExams.map((dbEx: any) => {
            // Find existing template for visual details if matched
            const template = INITIAL_EXAMS.find(
              e => e.name.toLowerCase() === dbEx.name.toLowerCase() ||
                   e.slug.toLowerCase() === dbEx.code?.toLowerCase() ||
                   e.id === dbEx.id
            );

            // Group subjects from database for this exam
            const examSubjects = dbSubjects
              ?.filter((s: any) => s.exam_id === dbEx.id)
              .map((s: any) => s.name) || [];

            const combinedSubjects = examSubjects.length > 0 
              ? Array.from(new Set([...examSubjects, ...(template?.subjects || [])]))
              : (template?.subjects || ['General Aptitude']);

            const slug = (dbEx.code || dbEx.name || 'exam').toLowerCase().replace(/[^a-z0-9]/g, '-');

            return {
              id: dbEx.id,
              slug: template?.slug || slug,
              name: dbEx.name,
              fullName: template?.fullName || dbEx.description || dbEx.name,
              category: (dbEx.category || template?.category || 'Engineering') as Exam['category'],
              description: dbEx.description || template?.description || 'Competitive examination preparation module.',
              logoIcon: template?.logoIcon || (dbEx.name === 'GATE' ? 'Cpu' : dbEx.name === 'SSC' ? 'Building2' : dbEx.name === 'RAS' ? 'Scale' : 'Atom'),
              bannerImage: template?.bannerImage,
              conductingBody: dbEx.organization || template?.conductingBody || 'National Examination Authority',
              subjects: combinedSubjects,
              availableYears: template?.availableYears || [2025, 2024, 2023, 2022],
              paperCount: Math.max(1, template?.paperCount || 10),
              questionCount: Math.max(50, template?.questionCount || 1200),
              difficulty: (template?.difficulty || 'Moderate') as Exam['difficulty'],
              examPattern: template?.examPattern || {
                durationMinutes: 180,
                totalMarks: 100,
                negativeMarking: '0.33 mark penalty for wrong response',
                sectionsCount: 3,
              },
              active: dbEx.is_active ?? true,
              featured: template?.featured ?? true,
            };
          });
        }
      } catch (err) {
        console.warn('Supabase getExams error, falling back to cached/mock:', err);
      }
    }

    if (supabaseExams.length > 0) {
      setStored(STORAGE_KEYS.EXAMS, supabaseExams);
      return supabaseExams;
    }

    return getStored<Exam[]>(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  },

  getExamBySlug: async (slug: string): Promise<Exam | undefined> => {
    const exams = await examService.getExams();
    return exams.find(e => e.slug === slug || e.id === slug || e.name.toLowerCase() === slug.toLowerCase());
  },

  saveExam: async (exam: Exam): Promise<Exam> => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('exams').upsert({
          id: exam.id.includes('-') && exam.id.length > 20 ? exam.id : undefined,
          name: exam.name,
          code: exam.name,
          description: exam.description || exam.fullName,
          category: exam.category,
          organization: exam.conductingBody,
          is_active: exam.active,
        });
      } catch (err) {
        console.warn('Failed to upsert exam in Supabase:', err);
      }
    }

    const exams = await examService.getExams();
    const index = exams.findIndex(e => e.id === exam.id);
    let updated: Exam[];
    if (index >= 0) {
      updated = [...exams];
      updated[index] = exam;
    } else {
      updated = [exam, ...exams];
    }
    setStored(STORAGE_KEYS.EXAMS, updated);
    return exam;
  },

  deleteExam: async (examId: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('exams').delete().eq('id', examId);
      } catch (err) {
        console.warn('Failed to delete exam from Supabase:', err);
      }
    }

    const exams = await examService.getExams();
    const updated = exams.filter(e => e.id !== examId);
    setStored(STORAGE_KEYS.EXAMS, updated);
    return true;
  },

  // PAPERS
  getPapers: async (filters?: {
    examId?: string;
    year?: number;
    subject?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Paper[]> => {
    let allPapers: Paper[] = [];

    if (isSupabaseConfigured) {
      try {
        // Fetch Supabase papers, exams, and subjects
        const [papersRes, examsRes, subjectsRes] = await Promise.all([
          supabase.from('papers').select('*').order('created_at', { ascending: false }),
          supabase.from('exams').select('id, name, code'),
          supabase.from('subjects').select('id, name, exam_id')
        ]);

        const dbPapers = papersRes.data || [];
        const dbExams = examsRes.data || [];
        const dbSubjects = subjectsRes.data || [];

        const examMap = new Map<string, string>();
        dbExams.forEach((e: any) => examMap.set(e.id, e.name));

        const subjectMap = new Map<string, string>();
        dbSubjects.forEach((s: any) => subjectMap.set(s.id, s.name));

        const mappedDbPapers: Paper[] = dbPapers.map((p: any) => {
          const examName = examMap.get(p.exam_id) || 'GATE';
          const subjectName = subjectMap.get(p.subject_id) || p.description || 'Core Subject';

          return {
            id: p.id, // Actual database UUID like '43200f2d-b7df-41fd-a903-fc9c620a193f'
            examId: p.exam_id,
            examName,
            year: p.year || 2025,
            subjectId: p.subject_id,
            subjectName,
            title: p.title,
            durationMinutes: p.duration_minutes || 180,
            totalMarks: p.total_marks || 100,
            totalQuestions: p.total_questions || 65,
            difficulty: (p.difficulty || 'hard') as Paper['difficulty'],
            pdfUrl: undefined,
            filePath: p.file_path,
            fileSizeBytes: p.file_size_bytes || 4200000,
            downloadAvailable: p.is_downloadable ?? true,
            downloadCount: p.download_count || 0,
            instructions: [
              'Official examination booklet from database archive.',
              'Verified with final answer keys.',
              'Calculator allowed per exam rules.'
            ],
            paperType: (p.paper_type === 'subject_wise' ? 'Subject Wise' : 'Full Length') as Paper['paperType'],
            createdAt: p.created_at || new Date().toISOString(),
          };
        });

        // Merge mapped database papers with template papers for complete library coverage
        const dbPaperIds = new Set(mappedDbPapers.map(p => p.id));
        const mergedTemplates = INITIAL_PAPERS.filter(p => !dbPaperIds.has(p.id));

        allPapers = [...mappedDbPapers, ...mergedTemplates];
        setStored(STORAGE_KEYS.PAPERS, allPapers);
      } catch (err) {
        console.warn('Supabase getPapers error, falling back:', err);
        allPapers = getStored<Paper[]>(STORAGE_KEYS.PAPERS, INITIAL_PAPERS);
      }
    } else {
      allPapers = getStored<Paper[]>(STORAGE_KEYS.PAPERS, INITIAL_PAPERS);
    }

    // Apply filters
    return allPapers.filter(p => {
      if (filters?.examId && filters.examId !== 'all') {
        // match either database UUID or slug/name
        const examMatch = p.examId === filters.examId || 
                          p.examName.toLowerCase() === filters.examId.toLowerCase() ||
                          (filters.examId.startsWith('exam-') && p.examName.toLowerCase() === filters.examId.replace('exam-', '').toLowerCase());
        if (!examMatch) return false;
      }
      if (filters?.year && p.year !== filters.year) return false;
      if (filters?.subject && filters.subject !== 'all' && p.subjectName.toLowerCase() !== filters.subject.toLowerCase()) return false;
      if (filters?.difficulty && filters.difficulty !== 'all' && p.difficulty !== filters.difficulty) return false;
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
    if (isSupabaseConfigured) {
      try {
        await supabase.from('papers').upsert({
          id: paper.id.includes('-') && paper.id.length > 20 ? paper.id : undefined,
          exam_id: paper.examId.includes('-') && paper.examId.length > 20 ? paper.examId : undefined,
          title: paper.title,
          year: paper.year,
          paper_type: paper.paperType === 'Subject Wise' ? 'subject_wise' : 'full_length',
          difficulty: paper.difficulty,
          total_questions: paper.totalQuestions,
          duration_minutes: paper.durationMinutes,
          total_marks: paper.totalMarks,
          is_downloadable: paper.downloadAvailable,
          is_active: true,
        });
      } catch (err) {
        console.warn('Failed to upsert paper in Supabase:', err);
      }
    }

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
    if (isSupabaseConfigured) {
      try {
        await supabase.from('papers').delete().eq('id', paperId);
      } catch (err) {
        console.warn('Failed to delete paper in Supabase:', err);
      }
    }

    const papers = await examService.getPapers();
    const updated = papers.filter(p => p.id !== paperId);
    setStored(STORAGE_KEYS.PAPERS, updated);
    return true;
  },

  // QUESTIONS
  getQuestions: async (filters?: {
    examId?: string;
    subjectId?: string;
    subjectName?: string;
    year?: number | 'all';
    difficulty?: string;
    paperId?: string;
  }): Promise<Question[]> => {
    let allQuestions: Question[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data: dbQuestions } = await supabase.from('questions').select('*');
        const { data: dbOptions } = await supabase.from('question_options').select('*');

        if (dbQuestions && dbQuestions.length > 0) {
          const mappedDbQuestions: Question[] = dbQuestions.map((q: any) => {
            const opts = (dbOptions || [])
              .filter((o: any) => o.question_id === q.id)
              .map((o: any) => ({
                id: (o.option_label || 'A') as 'A' | 'B' | 'C' | 'D',
                text: o.option_text || '',
              }))
              .sort((a, b) => a.id.localeCompare(b.id));

            return {
              id: q.id,
              paperId: q.paper_id,
              examId: q.exam_id,
              examName: 'GATE',
              subjectId: q.subject_id,
              subjectName: 'Core Subject',
              year: 2025,
              difficulty: (q.difficulty || 'medium') as Question['difficulty'],
              text: q.question_text || '',
              options: opts.length > 0 ? opts : [
                { id: 'A', text: 'Option A' },
                { id: 'B', text: 'Option B' },
                { id: 'C', text: 'Option C' },
                { id: 'D', text: 'Option D' }
              ],
              correctOptionId: 'A',
              explanation: q.explanation || 'Verified official answer.',
              marks: q.marks || 2,
              negativeMarks: q.negative_marks || 0.66,
            };
          });

          allQuestions = [...mappedDbQuestions, ...INITIAL_QUESTIONS];
        } else {
          allQuestions = INITIAL_QUESTIONS;
        }
      } catch (err) {
        allQuestions = INITIAL_QUESTIONS;
      }
    } else {
      allQuestions = getStored<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    }

    return allQuestions.filter(q => {
      if (filters?.examId && filters.examId !== 'all') {
        const matches = q.examId === filters.examId || 
                        q.examName.toLowerCase() === filters.examId.toLowerCase() ||
                        (filters.examId.startsWith('exam-') && q.examName.toLowerCase() === filters.examId.replace('exam-', '').toLowerCase());
        if (!matches) return false;
      }
      if (filters?.paperId && q.paperId !== filters.paperId) return false;
      if (filters?.subjectName && filters.subjectName !== 'all' && q.subjectName.toLowerCase() !== filters.subjectName.toLowerCase()) return false;
      if (filters?.year && filters.year !== 'all' && q.year !== filters.year) return false;
      if (filters?.difficulty && filters.difficulty !== 'all' && filters.difficulty !== 'mixed' && q.difficulty !== filters.difficulty) return false;
      return true;
    });
  },

  saveQuestion: async (question: Question): Promise<Question> => {
    if (isSupabaseConfigured) {
      try {
        const { data: qRes } = await supabase.from('questions').insert({
          exam_id: question.examId.includes('-') && question.examId.length > 20 ? question.examId : undefined,
          paper_id: question.paperId?.includes('-') && question.paperId.length > 20 ? question.paperId : undefined,
          question_text: question.text,
          explanation: question.explanation,
          marks: question.marks || 2,
          negative_marks: question.negativeMarks || 0.66,
          difficulty: question.difficulty,
          is_active: true,
          question_type: 'single_choice'
        }).select().single();

        if (qRes && qRes.id) {
          const optRows = question.options.map(opt => ({
            question_id: qRes.id,
            option_label: opt.id,
            option_text: opt.text
          }));
          await supabase.from('question_options').insert(optRows);
        }
      } catch (err) {
        console.warn('Failed to save question to Supabase:', err);
      }
    }

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
    if (isSupabaseConfigured) {
      try {
        await supabase.from('questions').delete().eq('id', questionId);
      } catch (err) {
        console.warn('Failed to delete question from Supabase:', err);
      }
    }

    const questions = await examService.getQuestions();
    const updated = questions.filter(q => q.id !== questionId);
    setStored(STORAGE_KEYS.QUESTIONS, updated);
    return true;
  },

  // ACHIEVEMENTS
  getAchievements: async (): Promise<Achievement[]> => {
    if (isSupabaseConfigured) {
      try {
        const { data: dbAchievements } = await supabase.from('achievements').select('*');
        if (dbAchievements && dbAchievements.length > 0) {
          return dbAchievements.map((a: any) => ({
            id: a.id,
            title: a.name,
            description: a.description,
            category: a.requirement_type === 'streak_days' ? 'streak' : 'volume',
            icon: a.icon === 'trophy' ? 'Trophy' : a.icon === 'award' ? 'Award' : a.icon === 'flame' ? 'Flame' : 'Target',
            progress: Math.min(a.requirement_value, 5),
            maxProgress: a.requirement_value,
            rewardPoints: a.requirement_value * 25,
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch achievements from Supabase:', err);
      }
    }
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
    // If Supabase is configured and valid UUID exists
    if (isSupabaseConfigured && attempt.quizConfig.examId) {
      try {
        const examId = attempt.quizConfig.examId.includes('-') && attempt.quizConfig.examId.length > 20 
          ? attempt.quizConfig.examId 
          : '8bb30f85-3edc-4c88-adfc-a3768761ffba';

        await supabase.from('quiz_attempts').insert({
          exam_id: examId,
          score: attempt.score,
          total_questions: attempt.questions.length,
          accuracy: attempt.accuracy,
        });
      } catch (err) {
        console.warn('Could not record quiz_attempt to Supabase:', err);
      }
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
    if (isSupabaseConfigured) {
      try {
        const [examsRes, papersRes, questionsRes] = await Promise.all([
          supabase.from('exams').select('id', { count: 'exact', head: true }),
          supabase.from('papers').select('id', { count: 'exact', head: true }),
          supabase.from('questions').select('id', { count: 'exact', head: true }),
        ]);

        return {
          ...INITIAL_ADMIN_ANALYTICS,
          totalExams: examsRes.count || INITIAL_ADMIN_ANALYTICS.totalExams,
          totalPapers: Math.max(papersRes.count || 0, INITIAL_ADMIN_ANALYTICS.totalPapers),
          totalQuestions: Math.max(questionsRes.count || 0, INITIAL_ADMIN_ANALYTICS.totalQuestions),
        };
      } catch (err) {
        return getStored<AdminAnalytics>(STORAGE_KEYS.ADMIN_ANALYTICS, INITIAL_ADMIN_ANALYTICS);
      }
    }
    return getStored<AdminAnalytics>(STORAGE_KEYS.ADMIN_ANALYTICS, INITIAL_ADMIN_ANALYTICS);
  }
};
