import { UserProfile, AuthSession } from '../types';
import { INITIAL_USER_PROFILE } from './mockData';

export interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
  password: string;
  targetExam?: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  STUDENTS: 'aptitude_arena_registered_students',
  SESSION: 'aptitude_arena_auth_session',
  PROFILES: 'aptitude_arena_user_profiles',
};

// Admin credentials strictly restricted to the authorized administrator
export const ADMIN_CREDENTIALS = {
  email: 'rkrishnaveersingh@gmail.com',
  password: 'krishna@123', // strictly required admin password
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

class AuthService {
  constructor() {
    // No hardcoded student seeded so users only see their own accounts
  }

  public getRegisteredStudents(): RegisteredStudent[] {
    return getStored<RegisteredStudent[]>(STORAGE_KEYS.STUDENTS, []);
  }

  public getCurrentSession(): AuthSession | null {
    return getStored<AuthSession | null>(STORAGE_KEYS.SESSION, null);
  }

  public registerStudent(params: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    targetExam?: string;
  }): { success: boolean; error?: string; user?: UserProfile } {
    const name = params.name.trim();
    const email = params.email.trim().toLowerCase();
    const password = params.password;
    const confirmPassword = params.confirmPassword;
    const targetExam = params.targetExam?.trim() || 'GATE (Engineering)';

    // Validation
    if (!name) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!email) {
      return { success: false, error: 'Email address is required.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { success: false, error: 'Password is required.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    const students = this.getRegisteredStudents();
    const existing = students.find(s => s.email.toLowerCase() === email);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in instead.',
      };
    }

    const newStudent: RegisteredStudent = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      email,
      password,
      targetExam,
      createdAt: new Date().toISOString(),
    };

    const updatedStudents = [...students, newStudent];
    setStored(STORAGE_KEYS.STUDENTS, updatedStudents);

    // Create session
    const session: AuthSession = {
      role: 'student',
      userId: newStudent.id,
      email: newStudent.email,
      name: newStudent.name,
    };
    setStored(STORAGE_KEYS.SESSION, session);

    // Build fresh profile
    const profile = this.buildStudentProfile(newStudent);
    this.saveUserProfile(profile);

    return { success: true, user: profile };
  }

  public loginStudent(emailInput: string, passwordInput: string): { success: boolean; error?: string; user?: UserProfile } {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;

    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    // Do NOT allow admin email to log in as a student
    if (email === ADMIN_CREDENTIALS.email.toLowerCase()) {
      return { success: false, error: 'This is an administrator account. Please use Admin Portal Login.' };
    }

    const students = this.getRegisteredStudents();
    const student = students.find(s => s.email.toLowerCase() === email);

    if (!student || student.password !== password) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const session: AuthSession = {
      role: 'student',
      userId: student.id,
      email: student.email,
      name: student.name,
    };
    setStored(STORAGE_KEYS.SESSION, session);

    const profile = this.buildStudentProfile(student);
    this.saveUserProfile(profile);

    return { success: true, user: profile };
  }

  public loginAdmin(emailInput: string, passwordInput: string): { success: boolean; error?: string; user?: UserProfile } {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;

    if (!email) {
      return { success: false, error: 'Please enter your administrator email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your administrator password.' };
    }

    // Strictly validate: ONLY the single predefined admin email + password can log in
    if (email !== ADMIN_CREDENTIALS.email.toLowerCase() || password !== ADMIN_CREDENTIALS.password) {
      return { success: false, error: 'Invalid administrator credentials. Access restricted.' };
    }

    const session: AuthSession = {
      role: 'admin',
      userId: 'usr-admin-master',
      email: ADMIN_CREDENTIALS.email,
      name: 'Administrator (Krishna Veer Singh)',
    };
    setStored(STORAGE_KEYS.SESSION, session);

    const adminProfile: UserProfile = {
      id: 'usr-admin-master',
      name: 'Administrator (Krishna Veer Singh)',
      email: ADMIN_CREDENTIALS.email,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      role: 'admin',
      targetExam: 'Master Administration Console',
      currentStreak: 45,
      longestStreak: 90,
      dailyGoal: 50,
      todaySolved: 0,
      totalQuestionsSolved: 1250,
      totalQuizzesTaken: 12,
      averageAccuracy: 98.5,
      totalStudyMinutes: 4800,
      bookmarks: { examIds: [], paperIds: [], questionIds: [] },
      downloadedPapers: [],
      achievements: INITIAL_USER_PROFILE.achievements,
      activityHistory: INITIAL_USER_PROFILE.activityHistory,
    };

    return { success: true, user: adminProfile };
  }

  public logout(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch {
      // ignore
    }
  }

  public getCurrentUser(): UserProfile | null {
    const session = this.getCurrentSession();
    if (!session) return null;

    if (session.role === 'admin') {
      return {
        id: session.userId || 'usr-admin-master',
        name: session.name || 'Administrator (Krishna Veer Singh)',
        email: session.email || ADMIN_CREDENTIALS.email,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        role: 'admin',
        targetExam: 'Master Administration Console',
        currentStreak: 45,
        longestStreak: 90,
        dailyGoal: 50,
        todaySolved: 0,
        totalQuestionsSolved: 1250,
        totalQuizzesTaken: 12,
        averageAccuracy: 98.5,
        totalStudyMinutes: 4800,
        bookmarks: { examIds: [], paperIds: [], questionIds: [] },
        downloadedPapers: [],
        achievements: INITIAL_USER_PROFILE.achievements,
        activityHistory: INITIAL_USER_PROFILE.activityHistory,
      };
    }

    // Student session
    const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, {});
    if (profiles[session.userId]) {
      return profiles[session.userId];
    }

    const students = this.getRegisteredStudents();
    const found = students.find(s => s.id === session.userId);
    if (found) {
      const created = this.buildStudentProfile(found);
      this.saveUserProfile(created);
      return created;
    }

    // Dynamic student profile matching current active session
    return {
      ...INITIAL_USER_PROFILE,
      id: session.userId,
      name: session.name,
      email: session.email,
      role: 'student',
    };
  }

  private buildStudentProfile(student: RegisteredStudent): UserProfile {
    const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, {});
    if (profiles[student.id]) {
      return {
        ...profiles[student.id],
        name: student.name,
        email: student.email,
      };
    }

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      role: 'student',
      targetExam: student.targetExam || 'GATE (Computer Science)',
      currentStreak: 1,
      longestStreak: 1,
      dailyGoal: 15,
      todaySolved: 0,
      totalQuestionsSolved: 0,
      totalQuizzesTaken: 0,
      averageAccuracy: 0,
      totalStudyMinutes: 0,
      bookmarks: {
        examIds: [],
        paperIds: [],
        questionIds: [],
      },
      downloadedPapers: [],
      achievements: INITIAL_USER_PROFILE.achievements,
      activityHistory: INITIAL_USER_PROFILE.activityHistory,
    };
  }

  public saveUserProfile(profile: UserProfile): void {
    const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, {});
    profiles[profile.id] = profile;
    setStored(STORAGE_KEYS.PROFILES, profiles);
  }
}

export const authService = new AuthService();
