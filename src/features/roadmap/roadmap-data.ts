// Static roadmap data - will be replaced with backend API later

export interface RoadmapTopic {
  id: string;
  title: string;
  serial: number;
  completed: boolean; // UI only for now
}

export interface RoadmapSubject {
  id: string;
  title: string;
  serial: number;
  topics: RoadmapTopic[];
}

export interface JobRole {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  category: string;
  subjects: RoadmapSubject[];
}

export const JOB_CATEGORIES = [
  { id: "bcs", label: "বিসিএস ক্যাডার" },
  { id: "govt-office", label: "সরকারি অফিস" },
  { id: "defense", label: "প্রতিরক্ষা" },
  { id: "education", label: "শিক্ষা" },
  { id: "health", label: "স্বাস্থ্য" },
  { id: "bank", label: "ব্যাংক" },
  { id: "corporation", label: "সংস্থা ও কর্পোরেশন" },
] as const;

export const JOB_ROLES: JobRole[] = [
  {
    id: "administration-cadre",
    slug: "administration-cadre",
    title: "Administration Cadre",
    titleBn: "প্রশাসন ক্যাডার",
    category: "bcs",
    subjects: [
      {
        id: "bangla",
        title: "বাংলা",
        serial: 1,
        topics: [
          { id: "bn-1", title: "ধ্বনি ও ধ্বনির পরিবর্তন", serial: 1, completed: true },
          { id: "bn-2", title: "বানান ও বানানের নিয়ম", serial: 2, completed: true },
          { id: "bn-3", title: "শব্দ ও শব্দ প্রকরণ", serial: 3, completed: true },
          { id: "bn-4", title: "সমার্থক ও প্রতিশব্দ", serial: 4, completed: false },
          { id: "bn-5", title: "বিপরীত শব্দ", serial: 5, completed: false },
          { id: "bn-6", title: "সমাস", serial: 6, completed: false },
          { id: "bn-7", title: "সন্ধি বিচ্ছেদ", serial: 7, completed: false },
          { id: "bn-8", title: "কারক ও বিভক্তি", serial: 8, completed: false },
          { id: "bn-9", title: "বাগধারা ও প্রবাদ", serial: 9, completed: false },
          { id: "bn-10", title: "এক কথায় প্রকাশ", serial: 10, completed: false },
          { id: "bn-11", title: "বাংলা সাহিত্য (প্রাচীন ও মধ্যযুগ)", serial: 11, completed: false },
          { id: "bn-12", title: "বাংলা সাহিত্য (আধুনিক যুগ)", serial: 12, completed: false },
        ],
      },
      {
        id: "english",
        title: "ইংরেজি",
        serial: 2,
        topics: [
          { id: "en-1", title: "Tenses & Subject-Verb Agreement", serial: 1, completed: false },
          { id: "en-2", title: "Parts of Speech", serial: 2, completed: false },
          { id: "en-3", title: "Prepositions", serial: 3, completed: false },
          { id: "en-4", title: "Articles & Determiners", serial: 4, completed: false },
          { id: "en-5", title: "Sentence Correction", serial: 5, completed: false },
          { id: "en-6", title: "Transformation of Sentences", serial: 6, completed: false },
          { id: "en-7", title: "Phrases & Idioms", serial: 7, completed: false },
          { id: "en-8", title: "Synonyms & Antonyms", serial: 8, completed: false },
          { id: "en-9", title: "Vocabulary & Spelling", serial: 9, completed: false },
          { id: "en-10", title: "English Literature", serial: 10, completed: false },
        ],
      },
      {
        id: "math",
        title: "গণিত",
        serial: 3,
        topics: [
          { id: "ma-1", title: "সংখ্যা ও গড়", serial: 1, completed: false },
          { id: "ma-2", title: "লসাগু ও গসাগু", serial: 2, completed: false },
          { id: "ma-3", title: "অনুপাত ও সমানুপাত", serial: 3, completed: false },
          { id: "ma-4", title: "শতকরা ও লাভ-ক্ষতি", serial: 4, completed: false },
          { id: "ma-5", title: "সুদ-কষা", serial: 5, completed: false },
          { id: "ma-6", title: "বীজগণিত", serial: 6, completed: false },
          { id: "ma-7", title: "জ্যামিতি (ত্রিভুজ ও বৃত্ত)", serial: 7, completed: false },
          { id: "ma-8", title: "পরিমিতি", serial: 8, completed: false },
        ],
      },
      {
        id: "general-knowledge",
        title: "সাধারণ জ্ঞান",
        serial: 4,
        topics: [
          { id: "gk-1", title: "বাংলাদেশের ইতিহাস ও মুক্তিযুদ্ধ", serial: 1, completed: false },
          { id: "gk-2", title: "বাংলাদেশের ভূগোল", serial: 2, completed: false },
          { id: "gk-3", title: "বাংলাদেশের সংবিধান", serial: 3, completed: false },
          { id: "gk-4", title: "আন্তর্জাতিক বিষয়াবলী", serial: 4, completed: false },
          { id: "gk-5", title: "বিজ্ঞান ও প্রযুক্তি", serial: 5, completed: false },
          { id: "gk-6", title: "সাম্প্রতিক বিষয়াবলী", serial: 6, completed: false },
        ],
      },
      {
        id: "mental-ability",
        title: "মানসিক দক্ষতা",
        serial: 5,
        topics: [
          { id: "mt-1", title: "Mathematical Reasoning", serial: 1, completed: false },
          { id: "mt-2", title: "Verbal Reasoning", serial: 2, completed: false },
          { id: "mt-3", title: "Analytical Ability", serial: 3, completed: false },
          { id: "mt-4", title: "Space Visualization", serial: 4, completed: false },
        ],
      },
    ],
  },
  {
    id: "foreign-affairs-cadre",
    slug: "foreign-affairs-cadre",
    title: "Foreign Affairs Cadre",
    titleBn: "পররাষ্ট্র ক্যাডার",
    category: "bcs",
    subjects: [
      {
        id: "bangla-fa",
        title: "বাংলা",
        serial: 1,
        topics: [
          { id: "fa-bn-1", title: "ধ্বনি ও ধ্বনির পরিবর্তন", serial: 1, completed: false },
          { id: "fa-bn-2", title: "বানান ও বানানের নিয়ম", serial: 2, completed: false },
          { id: "fa-bn-3", title: "শব্দ ও শব্দ প্রকরণ", serial: 3, completed: false },
          { id: "fa-bn-4", title: "সমাস ও সন্ধি", serial: 4, completed: false },
          { id: "fa-bn-5", title: "বাংলা সাহিত্য", serial: 5, completed: false },
        ],
      },
      {
        id: "english-fa",
        title: "ইংরেজি",
        serial: 2,
        topics: [
          { id: "fa-en-1", title: "Grammar & Usage", serial: 1, completed: false },
          { id: "fa-en-2", title: "Vocabulary", serial: 2, completed: false },
          { id: "fa-en-3", title: "Comprehension", serial: 3, completed: false },
          { id: "fa-en-4", title: "English Literature", serial: 4, completed: false },
        ],
      },
      {
        id: "gk-fa",
        title: "সাধারণ জ্ঞান",
        serial: 3,
        topics: [
          { id: "fa-gk-1", title: "বাংলাদেশ বিষয়াবলী", serial: 1, completed: false },
          { id: "fa-gk-2", title: "আন্তর্জাতিক সম্পর্ক", serial: 2, completed: false },
          { id: "fa-gk-3", title: "ভূ-রাজনীতি", serial: 3, completed: false },
          { id: "fa-gk-4", title: "আন্তর্জাতিক সংস্থা", serial: 4, completed: false },
        ],
      },
      {
        id: "math-fa",
        title: "গণিত ও মানসিক দক্ষতা",
        serial: 4,
        topics: [
          { id: "fa-ma-1", title: "পাটিগণিত", serial: 1, completed: false },
          { id: "fa-ma-2", title: "বীজগণিত", serial: 2, completed: false },
          { id: "fa-ma-3", title: "জ্যামিতি", serial: 3, completed: false },
          { id: "fa-ma-4", title: "মানসিক দক্ষতা", serial: 4, completed: false },
        ],
      },
    ],
  },
  {
    id: "police-cadre",
    slug: "police-cadre",
    title: "Police Cadre",
    titleBn: "পুলিশ ক্যাডার",
    category: "bcs",
    subjects: [
      {
        id: "bangla-pc",
        title: "বাংলা",
        serial: 1,
        topics: [
          { id: "pc-bn-1", title: "ব্যাকরণ", serial: 1, completed: false },
          { id: "pc-bn-2", title: "সাহিত্য", serial: 2, completed: false },
        ],
      },
      {
        id: "english-pc",
        title: "ইংরেজি",
        serial: 2,
        topics: [
          { id: "pc-en-1", title: "Grammar", serial: 1, completed: false },
          { id: "pc-en-2", title: "Vocabulary", serial: 2, completed: false },
          { id: "pc-en-3", title: "Comprehension", serial: 3, completed: false },
        ],
      },
      {
        id: "gk-pc",
        title: "সাধারণ জ্ঞান",
        serial: 3,
        topics: [
          { id: "pc-gk-1", title: "বাংলাদেশ বিষয়াবলী", serial: 1, completed: false },
          { id: "pc-gk-2", title: "আন্তর্জাতিক বিষয়াবলী", serial: 2, completed: false },
          { id: "pc-gk-3", title: "বিজ্ঞান ও প্রযুক্তি", serial: 3, completed: false },
        ],
      },
      {
        id: "math-pc",
        title: "গণিত ও মানসিক দক্ষতা",
        serial: 4,
        topics: [
          { id: "pc-ma-1", title: "গণিত", serial: 1, completed: false },
          { id: "pc-ma-2", title: "মানসিক দক্ষতা", serial: 2, completed: false },
        ],
      },
    ],
  },
  {
    id: "office-assistant",
    slug: "office-assistant",
    title: "Office Assistant",
    titleBn: "অফিস সহকারী",
    category: "govt-office",
    subjects: [
      {
        id: "bangla-oa",
        title: "বাংলা",
        serial: 1,
        topics: [
          { id: "oa-bn-1", title: "ব্যাকরণ", serial: 1, completed: false },
          { id: "oa-bn-2", title: "সাহিত্য", serial: 2, completed: false },
        ],
      },
      {
        id: "english-oa",
        title: "ইংরেজি",
        serial: 2,
        topics: [
          { id: "oa-en-1", title: "Grammar", serial: 1, completed: false },
          { id: "oa-en-2", title: "Vocabulary", serial: 2, completed: false },
        ],
      },
      {
        id: "math-oa",
        title: "গণিত",
        serial: 3,
        topics: [
          { id: "oa-ma-1", title: "পাটিগণিত", serial: 1, completed: false },
          { id: "oa-ma-2", title: "বীজগণিত", serial: 2, completed: false },
        ],
      },
      {
        id: "gk-oa",
        title: "সাধারণ জ্ঞান",
        serial: 4,
        topics: [
          { id: "oa-gk-1", title: "বাংলাদেশ বিষয়াবলী", serial: 1, completed: false },
          { id: "oa-gk-2", title: "আন্তর্জাতিক বিষয়াবলী", serial: 2, completed: false },
          { id: "oa-gk-3", title: "দৈনন্দিন বিজ্ঞান", serial: 3, completed: false },
          { id: "oa-gk-4", title: "কম্পিউটার ও তথ্যপ্রযুক্তি", serial: 4, completed: false },
        ],
      },
    ],
  },
  {
    id: "computer-operator",
    slug: "computer-operator",
    title: "Computer Operator",
    titleBn: "কম্পিউটার অপারেটর",
    category: "govt-office",
    subjects: [
      {
        id: "bangla-co",
        title: "বাংলা",
        serial: 1,
        topics: [
          { id: "co-bn-1", title: "ব্যাকরণ", serial: 1, completed: false },
          { id: "co-bn-2", title: "সাহিত্য", serial: 2, completed: false },
        ],
      },
      {
        id: "english-co",
        title: "ইংরেজি",
        serial: 2,
        topics: [
          { id: "co-en-1", title: "Grammar", serial: 1, completed: false },
          { id: "co-en-2", title: "Vocabulary", serial: 2, completed: false },
        ],
      },
      {
        id: "math-co",
        title: "গণিত",
        serial: 3,
        topics: [
          { id: "co-ma-1", title: "পাটিগণিত", serial: 1, completed: false },
          { id: "co-ma-2", title: "বীজগণিত", serial: 2, completed: false },
        ],
      },
      {
        id: "ict-co",
        title: "কম্পিউটার ও আইসিটি",
        serial: 4,
        topics: [
          { id: "co-ict-1", title: "কম্পিউটার ফান্ডামেন্টালস", serial: 1, completed: false },
          { id: "co-ict-2", title: "অপারেটিং সিস্টেম", serial: 2, completed: false },
          { id: "co-ict-3", title: "MS Office", serial: 3, completed: false },
          { id: "co-ict-4", title: "নেটওয়ার্কিং ও ইন্টারনেট", serial: 4, completed: false },
          { id: "co-ict-5", title: "ডাটাবেস", serial: 5, completed: false },
          { id: "co-ict-6", title: "সাইবার সিকিউরিটি", serial: 6, completed: false },
        ],
      },
      {
        id: "gk-co",
        title: "সাধারণ জ্ঞান",
        serial: 5,
        topics: [
          { id: "co-gk-1", title: "বাংলাদেশ বিষয়াবলী", serial: 1, completed: false },
          { id: "co-gk-2", title: "আন্তর্জাতিক বিষয়াবলী", serial: 2, completed: false },
        ],
      },
    ],
  },
  {
    id: "probationary-officer",
    slug: "probationary-officer",
    title: "Probationary Officer",
    titleBn: "প্রোবেশনারি অফিসার",
    category: "bank",
    subjects: [
      {
        id: "bangla-po",
        title: "বাংলা",
        serial: 1,
        topics: [
          { id: "po-bn-1", title: "ব্যাকরণ", serial: 1, completed: false },
          { id: "po-bn-2", title: "সাহিত্য", serial: 2, completed: false },
        ],
      },
      {
        id: "english-po",
        title: "ইংরেজি",
        serial: 2,
        topics: [
          { id: "po-en-1", title: "Grammar & Usage", serial: 1, completed: false },
          { id: "po-en-2", title: "Vocabulary", serial: 2, completed: false },
          { id: "po-en-3", title: "Reading Comprehension", serial: 3, completed: false },
        ],
      },
      {
        id: "math-po",
        title: "গণিত",
        serial: 3,
        topics: [
          { id: "po-ma-1", title: "Arithmetic", serial: 1, completed: false },
          { id: "po-ma-2", title: "Algebra", serial: 2, completed: false },
          { id: "po-ma-3", title: "Data Interpretation", serial: 3, completed: false },
        ],
      },
      {
        id: "gk-po",
        title: "সাধারণ জ্ঞান ও আইসিটি",
        serial: 4,
        topics: [
          { id: "po-gk-1", title: "বাংলাদেশ বিষয়াবলী", serial: 1, completed: false },
          { id: "po-gk-2", title: "আন্তর্জাতিক বিষয়াবলী", serial: 2, completed: false },
          { id: "po-gk-3", title: "ব্যাংকিং ও অর্থনীতি", serial: 3, completed: false },
          { id: "po-gk-4", title: "কম্পিউটার ও আইসিটি", serial: 4, completed: false },
        ],
      },
      {
        id: "analytical-po",
        title: "বিশ্লেষণমূলক দক্ষতা",
        serial: 5,
        topics: [
          { id: "po-an-1", title: "Analytical Ability", serial: 1, completed: false },
          { id: "po-an-2", title: "Critical Reasoning", serial: 2, completed: false },
          { id: "po-an-3", title: "Puzzles & Seating", serial: 3, completed: false },
        ],
      },
    ],
  },
  {
    id: "primary-teacher",
    slug: "primary-teacher",
    title: "Primary Teacher",
    titleBn: "সরকারি স্কুল শিক্ষক",
    category: "education",
    subjects: [
      {
        id: "bangla-pt",
        title: "বাংলা",
        serial: 1,
        topics: [
          { id: "pt-bn-1", title: "ধ্বনি ও বর্ণ", serial: 1, completed: false },
          { id: "pt-bn-2", title: "শব্দ ও পদ", serial: 2, completed: false },
          { id: "pt-bn-3", title: "সন্ধি ও সমাস", serial: 3, completed: false },
          { id: "pt-bn-4", title: "বাক্য ও বানান", serial: 4, completed: false },
          { id: "pt-bn-5", title: "সাহিত্য", serial: 5, completed: false },
        ],
      },
      {
        id: "english-pt",
        title: "ইংরেজি",
        serial: 2,
        topics: [
          { id: "pt-en-1", title: "Grammar", serial: 1, completed: false },
          { id: "pt-en-2", title: "Vocabulary", serial: 2, completed: false },
          { id: "pt-en-3", title: "Composition", serial: 3, completed: false },
        ],
      },
      {
        id: "math-pt",
        title: "গণিত",
        serial: 3,
        topics: [
          { id: "pt-ma-1", title: "পাটিগণিত", serial: 1, completed: false },
          { id: "pt-ma-2", title: "বীজগণিত", serial: 2, completed: false },
          { id: "pt-ma-3", title: "জ্যামিতি", serial: 3, completed: false },
        ],
      },
      {
        id: "gk-pt",
        title: "সাধারণ জ্ঞান ও বিজ্ঞান",
        serial: 4,
        topics: [
          { id: "pt-gk-1", title: "বাংলাদেশ বিষয়াবলী", serial: 1, completed: false },
          { id: "pt-gk-2", title: "আন্তর্জাতিক বিষয়াবলী", serial: 2, completed: false },
          { id: "pt-gk-3", title: "দৈনন্দিন বিজ্ঞান", serial: 3, completed: false },
          { id: "pt-gk-4", title: "কম্পিউটার", serial: 4, completed: false },
        ],
      },
    ],
  },
  {
    id: "bangladesh-army",
    slug: "bangladesh-army",
    title: "Bangladesh Army",
    titleBn: "সেনাবাহিনী",
    category: "defense",
    subjects: [
      {
        id: "bangla-army",
        title: "বাংলা",
        serial: 1,
        topics: [
          { id: "ar-bn-1", title: "ব্যাকরণ", serial: 1, completed: false },
          { id: "ar-bn-2", title: "সাহিত্য", serial: 2, completed: false },
        ],
      },
      {
        id: "english-army",
        title: "ইংরেজি",
        serial: 2,
        topics: [
          { id: "ar-en-1", title: "Grammar", serial: 1, completed: false },
          { id: "ar-en-2", title: "Vocabulary", serial: 2, completed: false },
        ],
      },
      {
        id: "math-army",
        title: "গণিত",
        serial: 3,
        topics: [
          { id: "ar-ma-1", title: "পাটিগণিত", serial: 1, completed: false },
          { id: "ar-ma-2", title: "বীজগণিত", serial: 2, completed: false },
          { id: "ar-ma-3", title: "জ্যামিতি", serial: 3, completed: false },
        ],
      },
      {
        id: "gk-army",
        title: "সাধারণ জ্ঞান",
        serial: 4,
        topics: [
          { id: "ar-gk-1", title: "বাংলাদেশ", serial: 1, completed: false },
          { id: "ar-gk-2", title: "আন্তর্জাতিক", serial: 2, completed: false },
          { id: "ar-gk-3", title: "বিজ্ঞান", serial: 3, completed: false },
        ],
      },
    ],
  },
  {
    id: "medical-officer",
    slug: "medical-officer",
    title: "Medical Officer",
    titleBn: "মেডিকেল অফিসার",
    category: "health",
    subjects: [
      {
        id: "bangla-mo",
        title: "বাংলা",
        serial: 1,
        topics: [
          { id: "mo-bn-1", title: "ব্যাকরণ", serial: 1, completed: false },
          { id: "mo-bn-2", title: "সাহিত্য", serial: 2, completed: false },
        ],
      },
      {
        id: "english-mo",
        title: "ইংরেজি",
        serial: 2,
        topics: [
          { id: "mo-en-1", title: "Grammar", serial: 1, completed: false },
          { id: "mo-en-2", title: "Medical Terminology", serial: 2, completed: false },
        ],
      },
      {
        id: "gk-mo",
        title: "সাধারণ জ্ঞান",
        serial: 3,
        topics: [
          { id: "mo-gk-1", title: "বাংলাদেশ বিষয়াবলী", serial: 1, completed: false },
          { id: "mo-gk-2", title: "স্বাস্থ্য সম্পর্কিত", serial: 2, completed: false },
          { id: "mo-gk-3", title: "বিজ্ঞান ও প্রযুক্তি", serial: 3, completed: false },
        ],
      },
      {
        id: "professional-mo",
        title: "পেশাগত বিষয়",
        serial: 4,
        topics: [
          { id: "mo-pr-1", title: "Anatomy & Physiology", serial: 1, completed: false },
          { id: "mo-pr-2", title: "Pharmacology", serial: 2, completed: false },
          { id: "mo-pr-3", title: "Community Medicine", serial: 3, completed: false },
          { id: "mo-pr-4", title: "Clinical Medicine", serial: 4, completed: false },
        ],
      },
    ],
  },
  {
    id: "nbr-tax-officer",
    slug: "nbr-tax-officer",
    title: "NBR Tax Officer",
    titleBn: "NBR ট্যাক্স অফিসার",
    category: "corporation",
    subjects: [
      {
        id: "bangla-nbr",
        title: "বাংলা",
        serial: 1,
        topics: [
          { id: "nbr-bn-1", title: "ব্যাকরণ", serial: 1, completed: false },
          { id: "nbr-bn-2", title: "সাহিত্য", serial: 2, completed: false },
        ],
      },
      {
        id: "english-nbr",
        title: "ইংরেজি",
        serial: 2,
        topics: [
          { id: "nbr-en-1", title: "Grammar", serial: 1, completed: false },
          { id: "nbr-en-2", title: "Vocabulary", serial: 2, completed: false },
          { id: "nbr-en-3", title: "Comprehension", serial: 3, completed: false },
        ],
      },
      {
        id: "math-nbr",
        title: "গণিত",
        serial: 3,
        topics: [
          { id: "nbr-ma-1", title: "পাটিগণিত", serial: 1, completed: false },
          { id: "nbr-ma-2", title: "বীজগণিত", serial: 2, completed: false },
        ],
      },
      {
        id: "gk-nbr",
        title: "সাধারণ জ্ঞান ও অর্থনীতি",
        serial: 4,
        topics: [
          { id: "nbr-gk-1", title: "বাংলাদেশ বিষয়াবলী", serial: 1, completed: false },
          { id: "nbr-gk-2", title: "কর ও রাজস্ব নীতি", serial: 2, completed: false },
          { id: "nbr-gk-3", title: "অর্থনীতি ও ব্যাংকিং", serial: 3, completed: false },
          { id: "nbr-gk-4", title: "আন্তর্জাতিক বাণিজ্য", serial: 4, completed: false },
        ],
      },
    ],
  },
];

// Helper to get total topics for a role
export function getTotalTopics(role: JobRole): number {
  return role.subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
}

// Helper to get completed topics for a role
export function getCompletedTopics(role: JobRole): number {
  return role.subjects.reduce(
    (sum, subject) => sum + subject.topics.filter((t) => t.completed).length,
    0
  );
}

// Helper to find the current topic (first incomplete)
export function getCurrentTopicIndex(role: JobRole): { subjectIndex: number; topicIndex: number } | null {
  for (let si = 0; si < role.subjects.length; si++) {
    for (let ti = 0; ti < role.subjects[si].topics.length; ti++) {
      if (!role.subjects[si].topics[ti].completed) {
        return { subjectIndex: si, topicIndex: ti };
      }
    }
  }
  return null;
}
