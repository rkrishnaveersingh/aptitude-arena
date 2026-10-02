export type ExamCategory = 
  | 'Engineering' 
  | 'Civil Services' 
  | 'Staff Selection' 
  | 'Undergraduate Science' 
  | 'Banking & Finance' 
  | 'Medical' 
  | 'Law & Management';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';

export interface Subject {
  id: string;
  examId: string;
  name: string;
  code: string;
  questionCount: number;
  iconName?: string;
  topics?: string[];
}

export interface Exam {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  category: ExamCategory;
  description: string;
  logoIcon: string;
  bannerImage?: string;
  subjects: string[]; // Subject names
  subjectDetails?: Subject[];
  availableYears: number[];
  paperCount: number;
  questionCount: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Competitive';
  examPattern: {
    durationMinutes: number;
    totalMarks: number;
    negativeMarking: string;
    sectionsCount: number;
  };
  conductingBody: string;
  active: boolean;
  featured?: boolean;
}

export interface Paper {
  id: string;
  examId: string;
  examName: string;
  year: number;
  subjectName: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty: DifficultyLevel;
  pdfUrl?: string;
  filePath?: string;
  subjectId?: string;
  fileSizeBytes: number;
  downloadAvailable: boolean;
  downloadCount: number;
  instructions: string[];
  paperType: 'Full Length' | 'Subject Wise' | 'Mock Test';
  createdAt: string;
}

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  paperId?: string;
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  year: number;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  codeSnippet?: string;
  formula?: string;
  options: QuestionOption[];
  correctOptionId: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topic?: string;
  marks?: number;
  negativeMarks?: number;
}

export interface QuizConfig {
  examId: string;
  examName: string;
  subjectId?: string; // 'all' or specific subject
  subjectName?: string;
  year?: number | 'all';
  questionCount: number;
  difficulty: DifficultyLevel;
  timeLimitMinutes: number;
  paperId?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizConfig: QuizConfig;
  startTime: string;
  endTime: string;
  timeSpentSeconds: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  reviewMarked: Record<string, boolean>;
  score: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  questions: Question[];
  submittedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'accuracy' | 'volume' | 'mastery';
  icon: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rewardPoints: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  count: number;
  accuracy: number;
  minutesSpent: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'student' | 'admin';
  targetExam: string;
  currentStreak: number;
  longestStreak: number;
  dailyGoal: number; // e.g. 15 questions
  todaySolved: number;
  totalQuestionsSolved: number;
  totalQuizzesTaken: number;
  averageAccuracy: number;
  totalStudyMinutes: number;
  bookmarks: {
    examIds: string[];
    paperIds: string[];
    questionIds: string[];
  };
  downloadedPapers: {
    paperId: string;
    downloadedAt: string;
  }[];
  achievements: Achievement[];
  activityHistory: DailyActivity[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string;
  score: number;
  accuracy: number;
  questionsSolved: number;
  streak: number;
  examCategory: string;
  badge?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'paper' | 'exam' | 'reminder' | 'streak' | 'achievement';
  read: boolean;
  actionUrl?: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  activeUsersToday: number;
  totalExams: number;
  totalPapers: number;
  totalQuestions: number;
  totalQuizzesTaken: number;
  mostPracticedExam: string;
  mostDownloadedPaper: string;
  dailyAttempts: { date: string; attempts: number }[];
  examDistribution: { name: string; count: number; percentage: number }[];
}
