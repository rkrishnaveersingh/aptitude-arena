import { Exam, Paper, Question, UserProfile, LeaderboardEntry, NotificationItem, AdminAnalytics } from '../types';

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-gate',
    slug: 'gate',
    name: 'GATE',
    fullName: 'Graduate Aptitude Test in Engineering',
    category: 'Engineering',
    description: 'Premier national competitive examination for admissions to Master\'s programs and recruitment in prestigious Public Sector Undertakings (PSUs).',
    logoIcon: 'Cpu',
    bannerImage: '/src/assets/images/exam_gate_engineering_1790873210365.jpg',
    conductingBody: 'Indian Institute of Science & IITs',
    subjects: ['Computer Science', 'Mechanical Engg', 'Electrical Engg', 'Engineering Mathematics', 'General Aptitude'],
    availableYears: [2024, 2023, 2022, 2021, 2020],
    paperCount: 28,
    questionCount: 1820,
    difficulty: 'Hard',
    examPattern: {
      durationMinutes: 180,
      totalMarks: 100,
      negativeMarking: '1/3 mark for 1-mark MCQs; 2/3 for 2-mark MCQs',
      sectionsCount: 3,
    },
    active: true,
    featured: true,
  },
  {
    id: 'exam-ssc',
    slug: 'ssc',
    name: 'SSC',
    fullName: 'Staff Selection Commission - Combined Graduate Level',
    category: 'Staff Selection',
    description: 'Premier gateway examination for recruitment into Group "B" and "C" gazetted and non-gazetted posts in Ministries and Departments of Government of India.',
    logoIcon: 'Building2',
    conductingBody: 'Staff Selection Commission (SSC)',
    subjects: ['Quantitative Aptitude', 'Reasoning & Intelligence', 'English Comprehension', 'General Awareness'],
    availableYears: [2024, 2023, 2022, 2021, 2020],
    paperCount: 34,
    questionCount: 3400,
    difficulty: 'Moderate',
    examPattern: {
      durationMinutes: 60,
      totalMarks: 200,
      negativeMarking: '0.50 marks deducted for each wrong answer',
      sectionsCount: 4,
    },
    active: true,
    featured: true,
  },
  {
    id: 'exam-ras',
    slug: 'ras',
    name: 'RAS',
    fullName: 'Rajasthan Administrative Services (RPSC)',
    category: 'Civil Services',
    description: 'State civil services examination conducted by RPSC to recruit administrative, police, and accounts officers across Rajasthan State Service.',
    logoIcon: 'Scale',
    bannerImage: '/src/assets/images/exam_ras_civil_services_1790873222566.jpg',
    conductingBody: 'Rajasthan Public Service Commission (RPSC)',
    subjects: ['Rajasthan History & Culture', 'Indian Polity & Constitution', 'General Science & Tech', 'Reasoning & Mental Ability'],
    availableYears: [2023, 2021, 2018, 2016],
    paperCount: 16,
    questionCount: 2400,
    difficulty: 'Competitive',
    examPattern: {
      durationMinutes: 180,
      totalMarks: 200,
      negativeMarking: '1/3 mark deducted for each incorrect answer',
      sectionsCount: 1,
    },
    active: true,
    featured: true,
  },
  {
    id: 'exam-jee',
    slug: 'jee',
    name: 'JEE',
    fullName: 'Joint Entrance Examination (Main & Advanced)',
    category: 'Undergraduate Science',
    description: 'Highly competitive undergraduate entrance examination for admission into premier engineering colleges including IITs, NITs, and IIITs.',
    logoIcon: 'Atom',
    conductingBody: 'National Testing Agency (NTA)',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    availableYears: [2024, 2023, 2022, 2021, 2020],
    paperCount: 42,
    questionCount: 3150,
    difficulty: 'Hard',
    examPattern: {
      durationMinutes: 180,
      totalMarks: 300,
      negativeMarking: '-1 mark for incorrect MCQ; +4 for correct',
      sectionsCount: 3,
    },
    active: true,
    featured: true,
  },
  {
    id: 'exam-upsc',
    slug: 'upsc',
    name: 'UPSC CSE',
    fullName: 'Civil Services Examination (IAS / IPS / IFS)',
    category: 'Civil Services',
    description: 'India\'s premier administrative civil service examination conducted by the Union Public Service Commission.',
    logoIcon: 'Shield',
    conductingBody: 'Union Public Service Commission',
    subjects: ['General Studies Paper 1', 'CSAT Paper 2', 'History & Geography', 'Ethics & Aptitude'],
    availableYears: [2024, 2023, 2022, 2021],
    paperCount: 18,
    questionCount: 1800,
    difficulty: 'Competitive',
    examPattern: {
      durationMinutes: 120,
      totalMarks: 200,
      negativeMarking: '1/3 mark deduction per wrong answer',
      sectionsCount: 2,
    },
    active: true,
    featured: false,
  },
  {
    id: 'exam-bank',
    slug: 'bank-po',
    name: 'IBPS PO',
    fullName: 'Probationary Officer & Management Trainee',
    category: 'Banking & Finance',
    description: 'National banking recruitment exam for Probationary Officers in 11 participating public sector banks across India.',
    logoIcon: 'Landmark',
    conductingBody: 'Institute of Banking Personnel Selection',
    subjects: ['Data Analysis & Interpretation', 'Reasoning & Computer', 'English Language', 'General Banking Economy'],
    availableYears: [2024, 2023, 2022],
    paperCount: 14,
    questionCount: 1400,
    difficulty: 'Moderate',
    examPattern: {
      durationMinutes: 60,
      totalMarks: 100,
      negativeMarking: '0.25 mark per wrong answer',
      sectionsCount: 3,
    },
    active: true,
    featured: false,
  }
];

export const INITIAL_PAPERS: Paper[] = [
  {
    id: 'paper-gate-2024-cs',
    examId: 'exam-gate',
    examName: 'GATE',
    year: 2024,
    subjectName: 'Computer Science',
    title: 'GATE 2024 CS & IT Official Question Paper with Keys',
    durationMinutes: 180,
    totalMarks: 100,
    totalQuestions: 65,
    difficulty: 'hard',
    fileSizeBytes: 4200000,
    downloadAvailable: true,
    downloadCount: 14280,
    paperType: 'Full Length',
    createdAt: '2024-03-15',
    instructions: [
      'Total duration is 180 minutes.',
      'Questions 1 to 25 carry 1 mark each; questions 26 to 65 carry 2 marks each.',
      'Standard scientific virtual calculator is permitted.',
      'Unattempted questions receive zero marks.'
    ]
  },
  {
    id: 'paper-gate-2023-cs',
    examId: 'exam-gate',
    examName: 'GATE',
    year: 2023,
    subjectName: 'Computer Science',
    title: 'GATE 2023 CS & IT Shift 1 Original Paper',
    durationMinutes: 180,
    totalMarks: 100,
    totalQuestions: 65,
    difficulty: 'hard',
    fileSizeBytes: 3900000,
    downloadAvailable: true,
    downloadCount: 18450,
    paperType: 'Full Length',
    createdAt: '2023-03-20',
    instructions: [
      'Total duration is 180 minutes.',
      'Check negative marking rules before marking answers.',
      'All calculations must be verified.'
    ]
  },
  {
    id: 'paper-gate-2024-apt',
    examId: 'exam-gate',
    examName: 'GATE',
    year: 2024,
    subjectName: 'General Aptitude',
    title: 'GATE 2024 General Aptitude Section Master Archive',
    durationMinutes: 30,
    totalMarks: 15,
    totalQuestions: 10,
    difficulty: 'medium',
    fileSizeBytes: 1800000,
    downloadAvailable: true,
    downloadCount: 22100,
    paperType: 'Subject Wise',
    createdAt: '2024-03-18',
    instructions: [
      'Contains 5 questions of 1 mark and 5 questions of 2 marks.',
      'Tests verbal ability and numerical reasoning.'
    ]
  },
  {
    id: 'paper-ssc-2024-tier1',
    examId: 'exam-ssc',
    examName: 'SSC',
    year: 2024,
    subjectName: 'Quantitative Aptitude',
    title: 'SSC CGL 2024 Tier-1 Shift 1 Official Solved Paper',
    durationMinutes: 60,
    totalMarks: 200,
    totalQuestions: 100,
    difficulty: 'medium',
    fileSizeBytes: 3400000,
    downloadAvailable: true,
    downloadCount: 31200,
    paperType: 'Full Length',
    createdAt: '2024-09-22',
    instructions: [
      '60 minutes total for 100 questions.',
      '4 sections with 25 questions each.',
      '0.50 negative marking per wrong response.'
    ]
  },
  {
    id: 'paper-ssc-2023-quant',
    examId: 'exam-ssc',
    examName: 'SSC',
    year: 2023,
    subjectName: 'Quantitative Aptitude',
    title: 'SSC CGL 2023 Math & Arithmetic Comprehensive Bank',
    durationMinutes: 25,
    totalMarks: 50,
    totalQuestions: 25,
    difficulty: 'medium',
    fileSizeBytes: 2100000,
    downloadAvailable: true,
    downloadCount: 19800,
    paperType: 'Subject Wise',
    createdAt: '2023-08-14',
    instructions: [
      'Target solving in under 22 minutes.',
      'Speed and calculation shortcuts required.'
    ]
  },
  {
    id: 'paper-ras-2023-prelims',
    examId: 'exam-ras',
    examName: 'RAS',
    year: 2023,
    subjectName: 'Rajasthan History & Culture',
    title: 'RPSC RAS Prelims 2023 General Knowledge & Studies',
    durationMinutes: 180,
    totalMarks: 200,
    totalQuestions: 150,
    difficulty: 'hard',
    fileSizeBytes: 5100000,
    downloadAvailable: true,
    downloadCount: 24700,
    paperType: 'Full Length',
    createdAt: '2023-10-05',
    instructions: [
      '150 questions carrying equal marks.',
      'Covers Rajasthan state history, art, polity and current affairs.',
      '1/3 negative marking.'
    ]
  },
  {
    id: 'paper-ras-2021-prelims',
    examId: 'exam-ras',
    examName: 'RAS',
    year: 2021,
    subjectName: 'Indian Polity & Constitution',
    title: 'RPSC RAS Prelims 2021 Official Question Booklet',
    durationMinutes: 180,
    totalMarks: 200,
    totalQuestions: 150,
    difficulty: 'medium',
    fileSizeBytes: 4800000,
    downloadAvailable: true,
    downloadCount: 16900,
    paperType: 'Full Length',
    createdAt: '2021-11-02',
    instructions: [
      'Standard RPSC Prelims format.',
      'Includes answer key references.'
    ]
  },
  {
    id: 'paper-jee-2024-jan',
    examId: 'exam-jee',
    examName: 'JEE',
    year: 2024,
    subjectName: 'Physics',
    title: 'JEE Main 2024 Session 1 (27 Jan Shift 1) All Subjects',
    durationMinutes: 180,
    totalMarks: 300,
    totalQuestions: 90,
    difficulty: 'hard',
    fileSizeBytes: 6200000,
    downloadAvailable: true,
    downloadCount: 38400,
    paperType: 'Full Length',
    createdAt: '2024-02-05',
    instructions: [
      '90 questions total; 75 to be attempted.',
      '30 questions per section (20 MCQs + 10 Numerical Value questions).',
      '+4 for correct, -1 for incorrect.'
    ]
  },
  {
    id: 'paper-jee-2023-math',
    examId: 'exam-jee',
    examName: 'JEE',
    year: 2023,
    subjectName: 'Mathematics',
    title: 'JEE Main 2023 Calculus & Vectors Deep Practice Paper',
    durationMinutes: 60,
    totalMarks: 100,
    totalQuestions: 25,
    difficulty: 'hard',
    fileSizeBytes: 3100000,
    downloadAvailable: true,
    downloadCount: 27500,
    paperType: 'Subject Wise',
    createdAt: '2023-04-12',
    instructions: [
      'Contains advanced calculus, coordinate geometry and 3D vectors.'
    ]
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  // GATE Questions
  {
    id: 'q-gate-1',
    paperId: 'paper-gate-2024-cs',
    examId: 'exam-gate',
    examName: 'GATE',
    subjectId: 'gate-cs',
    subjectName: 'Computer Science',
    year: 2024,
    difficulty: 'hard',
    text: 'Consider a paging hardware with a Translation Lookaside Buffer (TLB). The TLB access time is 10 ns, and the main memory access time is 80 ns. What is the effective memory access time (EMAT) in ns if the TLB hit ratio is 90%?',
    formula: 'EMAT = Hit_Ratio × (TLB_time + Memory_time) + (1 - Hit_Ratio) × (TLB_time + 2 × Memory_time)',
    options: [
      { id: 'A', text: '89 ns' },
      { id: 'B', text: '98 ns' },
      { id: 'C', text: '107 ns' },
      { id: 'D', text: '124 ns' }
    ],
    correctOptionId: 'B',
    explanation: 'Effective memory access time (EMAT):\nHit: TLB access (10 ns) + 1 memory access for operand (80 ns) = 90 ns.\nMiss: TLB access (10 ns) + Page table access in memory (80 ns) + Target memory access (80 ns) = 170 ns.\nEMAT = 0.90 × 90 + 0.10 × 170 = 81 + 17 = 98 ns.',
    topic: 'Operating Systems - Paging & Virtual Memory',
    marks: 2,
    negativeMarks: 0.66
  },
  {
    id: 'q-gate-2',
    paperId: 'paper-gate-2024-cs',
    examId: 'exam-gate',
    examName: 'GATE',
    subjectId: 'gate-cs',
    subjectName: 'Computer Science',
    year: 2024,
    difficulty: 'medium',
    text: 'What is the worst-case time complexity of inserting n elements into an initially empty Binary Search Tree (BST)?',
    options: [
      { id: 'A', text: 'O(n)' },
      { id: 'B', text: 'O(n log n)' },
      { id: 'C', text: 'O(n²)' },
      { id: 'D', text: 'O(log n)' }
    ],
    correctOptionId: 'C',
    explanation: 'In the worst case (when inputs are already sorted ascending or descending), the BST skews into a linear linked list. Inserting the i-th element takes O(i) comparisons. Total time = 1 + 2 + ... + n = n(n+1)/2 = O(n²).',
    topic: 'Data Structures - Trees',
    marks: 1,
    negativeMarks: 0.33
  },
  {
    id: 'q-gate-3',
    paperId: 'paper-gate-2024-apt',
    examId: 'exam-gate',
    examName: 'GATE',
    subjectId: 'gate-apt',
    subjectName: 'General Aptitude',
    year: 2024,
    difficulty: 'easy',
    text: 'The price of an article increased by 20% and then decreased by 20%. What is the net percentage change in the price of the article?',
    formula: 'Net Change = a + b + (ab / 100)%',
    options: [
      { id: 'A', text: 'No change (0%)' },
      { id: 'B', text: '4% decrease' },
      { id: 'C', text: '4% increase' },
      { id: 'D', text: '2.5% decrease' }
    ],
    correctOptionId: 'B',
    explanation: 'Using standard percentage formula: Net Change = +20 - 20 + ((+20) * (-20) / 100) = -400 / 100 = -4%. Hence, there is a net 4% decrease.',
    topic: 'Quantitative Aptitude - Percentages',
    marks: 1,
    negativeMarks: 0.33
  },
  {
    id: 'q-gate-4',
    paperId: 'paper-gate-2023-cs',
    examId: 'exam-gate',
    examName: 'GATE',
    subjectId: 'gate-cs',
    subjectName: 'Computer Science',
    year: 2023,
    difficulty: 'hard',
    text: 'A relational database relation R(A, B, C, D, E) satisfies the functional dependencies: F = { A → B, BC → D, E → C, D → A }. What is the candidate key of R?',
    options: [
      { id: 'A', text: 'AE' },
      { id: 'B', text: 'BE' },
      { id: 'C', text: 'DE' },
      { id: 'D', text: 'All of the above (AE, BE, DE)' }
    ],
    correctOptionId: 'D',
    explanation: 'Notice attribute E never appears on the right side of any functional dependency, so every candidate key MUST contain E.\n1) (AE)+ = {A, B, E, C, D} using E→C, BC→D. So AE is a key.\n2) (BE)+: with E, we get C (E→C), then BC→D, D→A, A→B. So (BE)+ contains all attributes.\n3) (DE)+: D→A, A→B, E→C. All attributes are covered. Therefore, AE, BE, and DE are all candidate keys.',
    topic: 'Database Management Systems - Normalization',
    marks: 2,
    negativeMarks: 0.66
  },

  // SSC Questions
  {
    id: 'q-ssc-1',
    paperId: 'paper-ssc-2024-tier1',
    examId: 'exam-ssc',
    examName: 'SSC',
    subjectId: 'ssc-quant',
    subjectName: 'Quantitative Aptitude',
    year: 2024,
    difficulty: 'medium',
    text: 'A train 240 m long crosses a platform twice its length in 36 seconds. What is the speed of the train in km/h?',
    options: [
      { id: 'A', text: '64 km/h' },
      { id: 'B', text: '72 km/h' },
      { id: 'C', text: '80 km/h' },
      { id: 'D', text: '54 km/h' }
    ],
    correctOptionId: 'B',
    explanation: 'Length of train = 240 m. Length of platform = 2 × 240 = 480 m.\nTotal distance = 240 + 480 = 720 m.\nSpeed in m/s = 720 / 36 = 20 m/s.\nSpeed in km/h = 20 × (18 / 5) = 72 km/h.',
    topic: 'Time, Speed & Distance',
    marks: 2,
    negativeMarks: 0.50
  },
  {
    id: 'q-ssc-2',
    paperId: 'paper-ssc-2024-tier1',
    examId: 'exam-ssc',
    examName: 'SSC',
    subjectId: 'ssc-reas',
    subjectName: 'Reasoning & Intelligence',
    year: 2024,
    difficulty: 'easy',
    text: 'Select the letter-cluster that can replace the question mark (?) in the following series: BDF, CFI, DHL, ?',
    options: [
      { id: 'A', text: 'EJO' },
      { id: 'B', text: 'EKN' },
      { id: 'C', text: 'EKM' },
      { id: 'D', text: 'FKN' }
    ],
    correctOptionId: 'A',
    explanation: 'First letters: B (+1) → C (+1) → D (+1) → E.\nSecond letters: D (+2) → F (+2) → H (+2) → J.\nThird letters: F (+3) → I (+3) → L (+3) → O.\nHence, the next cluster is EJO.',
    topic: 'Letter & Symbol Series',
    marks: 2,
    negativeMarks: 0.50
  },
  {
    id: 'q-ssc-3',
    paperId: 'paper-ssc-2023-quant',
    examId: 'exam-ssc',
    examName: 'SSC',
    subjectId: 'ssc-quant',
    subjectName: 'Quantitative Aptitude',
    year: 2023,
    difficulty: 'hard',
    text: 'If x + 1/x = 3, then what is the value of x⁵ + 1/x⁵?',
    formula: 'x⁵ + 1/x⁵ = (x² + 1/x²)(x³ + 1/x³) - (x + 1/x)',
    options: [
      { id: 'A', text: '121' },
      { id: 'B', text: '123' },
      { id: 'C', text: '126' },
      { id: 'D', text: '118' }
    ],
    correctOptionId: 'B',
    explanation: '1) x² + 1/x² = 3² - 2 = 7.\n2) x³ + 1/x³ = 3³ - 3(3) = 27 - 9 = 18.\n3) (x² + 1/x²)(x³ + 1/x³) = x⁵ + 1/x⁵ + (x + 1/x)\n7 × 18 = x⁵ + 1/x⁵ + 3\n126 = x⁵ + 1/x⁵ + 3\nx⁵ + 1/x⁵ = 126 - 3 = 123.',
    topic: 'Algebra - Polynomial Identities',
    marks: 2,
    negativeMarks: 0.50
  },

  // RAS Questions
  {
    id: 'q-ras-1',
    paperId: 'paper-ras-2023-prelims',
    examId: 'exam-ras',
    examName: 'RAS',
    subjectId: 'ras-hist',
    subjectName: 'Rajasthan History & Culture',
    year: 2023,
    difficulty: 'medium',
    text: 'In which district of Rajasthan is the famous "Chand Baori" stepwell located?',
    options: [
      { id: 'A', text: 'Bundi' },
      { id: 'B', text: 'Dausa (Abhaneri)' },
      { id: 'C', text: 'Jodhpur' },
      { id: 'D', text: 'Alwar' }
    ],
    correctOptionId: 'B',
    explanation: 'Chand Baori is a famous stepwell built in the 8th and 9th centuries by King Chanda of the Nikumbha dynasty in the village of Abhaneri, situated in the Dausa district of Rajasthan.',
    topic: 'Rajasthan Architectural Heritage & Monuments',
    marks: 1.33,
    negativeMarks: 0.44
  },
  {
    id: 'q-ras-2',
    paperId: 'paper-ras-2023-prelims',
    examId: 'exam-ras',
    examName: 'RAS',
    subjectId: 'ras-polity',
    subjectName: 'Indian Polity & Constitution',
    year: 2023,
    difficulty: 'hard',
    text: 'Which Article of the Constitution of India provides for the appointment of the Advocate General for the State?',
    options: [
      { id: 'A', text: 'Article 165' },
      { id: 'B', text: 'Article 76' },
      { id: 'C', text: 'Article 148' },
      { id: 'D', text: 'Article 214' }
    ],
    correctOptionId: 'A',
    explanation: 'Article 165 of the Indian Constitution states that the Governor of each State shall appoint a person who is qualified to be appointed a Judge of a High Court to be Advocate General for the State. (Note: Article 76 is for the Attorney General of India).',
    topic: 'State Constitutional Machinery',
    marks: 1.33,
    negativeMarks: 0.44
  },

  // JEE Questions
  {
    id: 'q-jee-1',
    paperId: 'paper-jee-2024-jan',
    examId: 'exam-jee',
    examName: 'JEE',
    subjectId: 'jee-phys',
    subjectName: 'Physics',
    year: 2024,
    difficulty: 'hard',
    text: 'A block of mass m is placed on a smooth horizontal surface and connected to a spring of spring constant k. If the block is pulled by a distance x₀ and released, what is the velocity of the block when its displacement is x₀/2 from the equilibrium position?',
    formula: 'Energy conservation: ½ k x₀² = ½ k x² + ½ m v²',
    options: [
      { id: 'A', text: 'x₀ √(k / m)' },
      { id: 'B', text: '(√3 / 2) x₀ √(k / m)' },
      { id: 'C', text: '½ x₀ √(k / m)' },
      { id: 'D', text: '(1 / √2) x₀ √(k / m)' }
    ],
    correctOptionId: 'B',
    explanation: 'By conservation of mechanical energy:\nTotal Energy = ½ k x₀²\nAt x = x₀/2: Potential Energy = ½ k (x₀/2)² = ⅛ k x₀²\nKinetic Energy = Total Energy - Potential Energy = ½ k x₀² - ⅛ k x₀² = ⅜ k x₀²\n½ m v² = ⅜ k x₀²  =>  v² = (3k / 4m) x₀²  =>  v = (√3 / 2) x₀ √(k / m).',
    topic: 'Simple Harmonic Motion & Energy Conservation',
    marks: 4,
    negativeMarks: 1
  },
  {
    id: 'q-jee-2',
    paperId: 'paper-jee-2023-math',
    examId: 'exam-jee',
    examName: 'JEE',
    subjectId: 'jee-math',
    subjectName: 'Mathematics',
    year: 2023,
    difficulty: 'medium',
    text: 'Evaluate the limit: lim (x → 0) [(sin 3x) / (tan 5x)].',
    formula: 'lim (θ → 0) sin(aθ)/aθ = 1 and lim (θ → 0) tan(bθ)/bθ = 1',
    options: [
      { id: 'A', text: '3 / 5' },
      { id: 'B', text: '5 / 3' },
      { id: 'C', text: '0' },
      { id: 'D', text: '1' }
    ],
    correctOptionId: 'A',
    explanation: 'Rewrite expression as: [(sin 3x)/(3x) × 3x] / [(tan 5x)/(5x) × 5x]. As x → 0, (sin 3x)/(3x) → 1 and (tan 5x)/(5x) → 1. The x cancels out, leaving (1 × 3) / (1 × 5) = 3/5.',
    topic: 'Differential Calculus - Limits',
    marks: 4,
    negativeMarks: 1
  },
  {
    id: 'q-jee-3',
    paperId: 'paper-jee-2024-jan',
    examId: 'exam-jee',
    examName: 'JEE',
    subjectId: 'jee-chem',
    subjectName: 'Chemistry',
    year: 2024,
    difficulty: 'easy',
    text: 'Which of the following molecules has a linear geometry according to VSEPR theory?',
    options: [
      { id: 'A', text: 'SO₂' },
      { id: 'B', text: 'CO₂' },
      { id: 'C', text: 'H₂O' },
      { id: 'D', text: 'O₃' }
    ],
    correctOptionId: 'B',
    explanation: 'In CO₂, the central Carbon atom has two double bonds with Oxygen and zero lone pairs (sp hybridization with 180° bond angle), yielding a linear geometry. In contrast, SO₂, H₂O, and O₃ have lone pairs resulting in bent/angular geometries.',
    topic: 'Chemical Bonding & Molecular Structure',
    marks: 4,
    negativeMarks: 1
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr-student-01',
  name: 'Aryan Sharma',
  email: 'aryan.sharma@prep.arena',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  role: 'student',
  targetExam: 'GATE (Computer Science)',
  currentStreak: 12,
  longestStreak: 28,
  dailyGoal: 15,
  todaySolved: 9,
  totalQuestionsSolved: 342,
  totalQuizzesTaken: 26,
  averageAccuracy: 84.6,
  totalStudyMinutes: 1940,
  bookmarks: {
    examIds: ['exam-gate', 'exam-ssc'],
    paperIds: ['paper-gate-2024-cs', 'paper-ssc-2024-tier1'],
    questionIds: ['q-gate-1', 'q-gate-4', 'q-jee-1']
  },
  downloadedPapers: [
    {
      paperId: 'paper-gate-2024-cs',
      downloadedAt: '2026-09-24T14:32:00Z'
    },
    {
      paperId: 'paper-ssc-2024-tier1',
      downloadedAt: '2026-09-28T09:15:00Z'
    }
  ],
  achievements: [
    {
      id: 'ach-1',
      title: '7-Day Warrior',
      description: 'Maintained an unbroken study streak for 7 consecutive days',
      category: 'streak',
      icon: 'Flame',
      unlockedAt: '2026-09-18',
      progress: 7,
      maxProgress: 7,
      rewardPoints: 100
    },
    {
      id: 'ach-2',
      title: 'Accuracy Marksman',
      description: 'Scored 90%+ accuracy on 5 timed exam quizzes',
      category: 'accuracy',
      icon: 'Target',
      unlockedAt: '2026-09-26',
      progress: 5,
      maxProgress: 5,
      rewardPoints: 150
    },
    {
      id: 'ach-3',
      title: 'Centurion Solver',
      description: 'Successfully solve 500 competitive questions',
      category: 'volume',
      icon: 'Award',
      progress: 342,
      maxProgress: 500,
      rewardPoints: 250
    },
    {
      id: 'ach-4',
      title: 'Gatekeeper Master',
      description: 'Complete 10 full GATE previous-year papers with solutions',
      category: 'mastery',
      icon: 'Trophy',
      progress: 4,
      maxProgress: 10,
      rewardPoints: 300
    }
  ],
  activityHistory: [
    // Generate realistic last 80 days
    { date: '2026-07-15', count: 12, accuracy: 80, minutesSpent: 45 },
    { date: '2026-07-16', count: 18, accuracy: 88, minutesSpent: 60 },
    { date: '2026-07-18', count: 14, accuracy: 85, minutesSpent: 50 },
    { date: '2026-07-20', count: 20, accuracy: 90, minutesSpent: 75 },
    { date: '2026-07-22', count: 8, accuracy: 75, minutesSpent: 30 },
    { date: '2026-07-25', count: 25, accuracy: 92, minutesSpent: 90 },
    { date: '2026-08-01', count: 15, accuracy: 86, minutesSpent: 55 },
    { date: '2026-08-02', count: 22, accuracy: 84, minutesSpent: 70 },
    { date: '2026-08-04', count: 16, accuracy: 87, minutesSpent: 60 },
    { date: '2026-08-06', count: 30, accuracy: 93, minutesSpent: 110 },
    { date: '2026-08-10', count: 12, accuracy: 78, minutesSpent: 40 },
    { date: '2026-08-15', count: 18, accuracy: 88, minutesSpent: 65 },
    { date: '2026-08-20', count: 24, accuracy: 91, minutesSpent: 85 },
    { date: '2026-08-25', count: 10, accuracy: 80, minutesSpent: 35 },
    { date: '2026-09-01', count: 14, accuracy: 82, minutesSpent: 50 },
    { date: '2026-09-05', count: 20, accuracy: 89, minutesSpent: 70 },
    { date: '2026-09-10', count: 22, accuracy: 86, minutesSpent: 75 },
    { date: '2026-09-15', count: 16, accuracy: 90, minutesSpent: 60 },
    { date: '2026-09-20', count: 18, accuracy: 85, minutesSpent: 65 },
    { date: '2026-09-21', count: 20, accuracy: 87, minutesSpent: 70 },
    { date: '2026-09-22', count: 15, accuracy: 86, minutesSpent: 55 },
    { date: '2026-09-23', count: 24, accuracy: 92, minutesSpent: 80 },
    { date: '2026-09-24', count: 19, accuracy: 89, minutesSpent: 65 },
    { date: '2026-09-25', count: 25, accuracy: 91, minutesSpent: 90 },
    { date: '2026-09-26', count: 21, accuracy: 88, minutesSpent: 75 },
    { date: '2026-09-27', count: 18, accuracy: 85, minutesSpent: 60 },
    { date: '2026-09-28', count: 22, accuracy: 90, minutesSpent: 75 },
    { date: '2026-09-29', count: 16, accuracy: 87, minutesSpent: 55 },
    { date: '2026-09-30', count: 14, accuracy: 85, minutesSpent: 50 },
    { date: '2026-10-01', count: 9, accuracy: 89, minutesSpent: 35 }
  ]
};

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'usr-lead-1',
    userName: 'Kavita Singhal',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    score: 9840,
    accuracy: 94.2,
    questionsSolved: 1420,
    streak: 44,
    examCategory: 'GATE',
    badge: 'AIR 1 Practice'
  },
  {
    rank: 2,
    userId: 'usr-lead-2',
    userName: 'Rohan Deshmukh',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    score: 9320,
    accuracy: 91.8,
    questionsSolved: 1310,
    streak: 38,
    examCategory: 'GATE',
    badge: 'Formula Ace'
  },
  {
    rank: 3,
    userId: 'usr-lead-3',
    userName: 'Priya Meena',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    score: 8950,
    accuracy: 90.4,
    questionsSolved: 1180,
    streak: 31,
    examCategory: 'RAS',
    badge: 'Heritage Scholar'
  },
  {
    rank: 4,
    userId: 'usr-student-01',
    userName: 'Aryan Sharma (You)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    score: 8420,
    accuracy: 84.6,
    questionsSolved: 342,
    streak: 12,
    examCategory: 'GATE',
    badge: 'Rising Contender'
  },
  {
    rank: 5,
    userId: 'usr-lead-5',
    userName: 'Vikramaditya Roy',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    score: 8110,
    accuracy: 86.5,
    questionsSolved: 980,
    streak: 26,
    examCategory: 'SSC',
    badge: 'Speed Prodigy'
  },
  {
    rank: 6,
    userId: 'usr-lead-6',
    userName: 'Ananya Bansal',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    score: 7920,
    accuracy: 88.0,
    questionsSolved: 920,
    streak: 21,
    examCategory: 'JEE',
    badge: 'Calculus Queen'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Paper Uploaded',
    message: 'GATE 2024 Computer Science Shift 2 solved question paper is now ready to practice.',
    timestamp: '2 hours ago',
    type: 'paper',
    read: false,
    actionUrl: '/papers'
  },
  {
    id: 'notif-2',
    title: 'Streak Preserved!',
    message: 'Awesome work! You solved 9 questions today and your streak reached 12 days.',
    timestamp: '5 hours ago',
    type: 'streak',
    read: false,
    actionUrl: '/dashboard'
  },
  {
    id: 'notif-3',
    title: 'Weekly National Mock Test',
    message: 'SSC CGL All-India Full Length Mock Test is scheduled for Saturday 10:00 AM.',
    timestamp: '1 day ago',
    type: 'reminder',
    read: true,
    actionUrl: '/practice'
  },
  {
    id: 'notif-4',
    title: 'New Exam Syllabus Added',
    message: 'RAS 2024 Scheme and Updated Subject Modules have been added to the Exam Explorer.',
    timestamp: '2 days ago',
    type: 'exam',
    read: true,
    actionUrl: '/exams'
  }
];

export const INITIAL_ADMIN_ANALYTICS: AdminAnalytics = {
  totalUsers: 24890,
  activeUsersToday: 3420,
  totalExams: 6,
  totalPapers: 152,
  totalQuestions: 12570,
  totalQuizzesTaken: 89450,
  mostPracticedExam: 'GATE (CS & IT)',
  mostDownloadedPaper: 'GATE 2024 CS & IT Official Paper',
  dailyAttempts: [
    { date: 'Sep 25', attempts: 1840 },
    { date: 'Sep 26', attempts: 2120 },
    { date: 'Sep 27', attempts: 1980 },
    { date: 'Sep 28', attempts: 2450 },
    { date: 'Sep 29', attempts: 2890 },
    { date: 'Sep 30', attempts: 3120 },
    { date: 'Oct 01', attempts: 3420 }
  ],
  examDistribution: [
    { name: 'GATE', count: 32400, percentage: 36 },
    { name: 'SSC CGL', count: 28900, percentage: 32 },
    { name: 'JEE Main/Adv', count: 18200, percentage: 20 },
    { name: 'RAS', count: 9950, percentage: 12 }
  ]
};
