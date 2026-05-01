export const ROUTES = {
  // Public
  home: "/",
  login: "/login",
  register: "/register",

  // Member
  dashboard: "/dashboard",
  exams: "/exams",
  examCategory: (slug: string) => `/exams/${slug}` as const,
  subExamDashboard: (slug: string, subSlug: string) =>
    `/exams/${slug}/${subSlug}` as const,
  subExamRoutine: (slug: string, subSlug: string) =>
    `/exams/${slug}/${subSlug}/routine` as const,
  subExamResults: (slug: string, subSlug: string) =>
    `/exams/${slug}/${subSlug}/results` as const,
  subExamArchive: (slug: string, subSlug: string) =>
    `/exams/${slug}/${subSlug}/archive` as const,
  subExamFavorites: (slug: string, subSlug: string) =>
    `/exams/${slug}/${subSlug}/favorites` as const,
  subExamSyllabus: (slug: string, subSlug: string) =>
    `/exams/${slug}/${subSlug}/syllabus` as const,
  subExamSyllabusDetail: (
    slug: string,
    subSlug: string,
    syllabusSlug: string,
  ) => `/exams/${slug}/${subSlug}/syllabus/${syllabusSlug}` as const,
  subExamMeritList: (slug: string, subSlug: string) =>
    `/exams/${slug}/${subSlug}/merit-list` as const,
  marksheet: (attemptId: string) => `/marksheet/${attemptId}` as const,
  exam: (questionSetId: string) => `/exam/${questionSetId}` as const,
  examReview: (attemptId: string) => `/exam/review/${attemptId}` as const,
  examAnswers: (questionSetId: string) =>
    `/exam/answers/${questionSetId}` as const,
  notifications: "/notifications",
  profile: "/profile",
  subscriptions: "/subscriptions",
  favorites: "#",
  routine: "#",
  syllabus: "#",
  jobAlerts: "#",
  blogPosts: "#",
  question: (slug: string) => `/${slug}` as const,

  // Admin
  admin: "/admin",
  adminCategories: "/admin/categories",
  adminSubCategories: "/admin/sub-categories",
  adminRoutines: "/admin/routines",
  adminSyllabus: "/admin/syllabus",
  adminNotifications: "/admin/notifications",
  adminQuestions: "/admin/questions",
  adminQuestionSets: "/admin/question-sets",
  adminSubscriptions: "/admin/subscriptions",
  adminPackages: "/admin/packages",
  adminTransactions: "/admin/transactions",
  adminSettings: "#",
} as const;
