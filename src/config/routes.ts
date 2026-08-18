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
  favorites: "/favorites",
  routine: "/routines",
  syllabus: "/syllabus",
  syllabusDetail: (syllabusSlug: string) =>
    `/syllabus/${syllabusSlug}` as const,
  jobCircular: "/job-circular",
  jobAlerts: "#",
  blogPosts: "#",
  question: (slug: string) => `/${slug}` as const,
  images: "/images",
  imagesPreview: (questionSetId: string) =>
    `/images/preview/${questionSetId}` as const,
  docs: "/docs",
  docsPreview: (documentId: string) =>
    `/docs/preview/${documentId}` as const,
  videos: "/videos",
  videoDetail: (id: string) => `/videos/${id}` as const,
  pdf: "/pdf-library",
  pdfDetail: (id: string) => `/pdf-library/${id}` as const,

  // Admin
  admin: "/admin",
  adminCategories: "/admin/categories",
  adminSubCategories: "/admin/sub-categories",
  adminRoutines: "/admin/routines",
  adminSyllabus: "/admin/syllabus",
  adminJobCircular: "/admin/job-circular",
  adminVideos: "/admin/videos",
  adminNotifications: "/admin/notifications",
  adminQuestions: "/admin/questions",
  adminQuestionSets: "/admin/question-sets",
  adminQuestionSetsAutomotion: "/admin/question-sets-automotion",
  adminPdfManagement: "/admin/pdf-management",
  adminSubscriptions: "/admin/subscriptions",
  adminPackages: "/admin/packages",
  adminTransactions: "/admin/transactions",
  adminSettings: "/admin/settings",
  adminBroadcastCenter: "/admin/broadcast-center",
  adminBroadcastIntegrations: "/admin/broadcast-center/integrations",
  adminBroadcastHistory: "/admin/broadcast-center/history",
  adminBroadcastRules: "/admin/broadcast-center/rules",
} as const;
