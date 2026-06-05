// Roadmap data — sourced from official syllabuses (BPSC, DPE, NTRCA, DSS, Bangladesh Bank, etc.)
// Last updated: June 2026

export interface RoadmapTopic {
  id: string;
  title: string;
  serial: number;
  completed: boolean;
}

export interface RoadmapSubject {
  id: string;
  title: string;
  serial: number;
  marks?: number; // actual marks from official syllabus
  topics: RoadmapTopic[];
}

export interface JobRole {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  category: string;
  examType?: string; // e.g. "MCQ", "MCQ + Written", "MCQ + Written + Viva"
  totalMarks?: number;
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
  // ─────────────────────────────────────────────────────────────────
  // BCS PRELIMINARY — all cadres share the same 200-mark preli
  // Source: BPSC official circular (35th BCS onwards)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "bcs-preliminary",
    slug: "bcs-preliminary",
    title: "BCS Preliminary (All Cadres)",
    titleBn: "বিসিএস প্রিলিমিনারি (সকল ক্যাডার)",
    category: "bcs",
    examType: "MCQ",
    totalMarks: 200,
    subjects: [
      {
        id: "bcs-preli-bangla",
        title: "বাংলা ভাষা ও সাহিত্য",
        serial: 1,
        marks: 35,
        topics: [
          {
            id: "bcs-bn-1",
            title: "ধ্বনি ও ধ্বনির পরিবর্তন (সন্ধি, ণ-ত্ব ও ষ-ত্ব বিধান)",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-bn-2",
            title: "শব্দ গঠন — উপসর্গ, অনুসর্গ, প্রত্যয়",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-bn-3",
            title: "পদ প্রকরণ ও পদ পরিবর্তন",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-bn-4",
            title: "বচন, লিঙ্গ ও কারক-বিভক্তি",
            serial: 4,
            completed: false,
          },
          {
            id: "bcs-bn-5",
            title: "সমাস (৬ প্রকার) ও সমাস নির্ণয়",
            serial: 5,
            completed: false,
          },
          {
            id: "bcs-bn-6",
            title: "বাগধারা, প্রবাদ-প্রবচন ও এককথায় প্রকাশ",
            serial: 6,
            completed: false,
          },
          {
            id: "bcs-bn-7",
            title: "সমার্থক ও বিপরীতার্থক শব্দ",
            serial: 7,
            completed: false,
          },
          {
            id: "bcs-bn-8",
            title: "বানান শুদ্ধি ও বিরামচিহ্ন",
            serial: 8,
            completed: false,
          },
          {
            id: "bcs-bn-9",
            title: "বাক্য শুদ্ধি ও বাক্যান্তর",
            serial: 9,
            completed: false,
          },
          {
            id: "bcs-bn-10",
            title: "বাংলা সাহিত্য: প্রাচীন যুগ — চর্যাপদ",
            serial: 10,
            completed: false,
          },
          {
            id: "bcs-bn-11",
            title: "মধ্যযুগ — মঙ্গলকাব্য, বৈষ্ণব পদাবলি, মৈমনসিংহ গীতিকা",
            serial: 11,
            completed: false,
          },
          {
            id: "bcs-bn-12",
            title: "আধুনিক যুগ — রবীন্দ্রনাথ, নজরুল, মাইকেল মধুসূদন",
            serial: 12,
            completed: false,
          },
          {
            id: "bcs-bn-13",
            title: "মুক্তিযুদ্ধ ভিত্তিক সাহিত্য ও ছদ্মনাম",
            serial: 13,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-preli-english",
        title: "English Language & Literature",
        serial: 2,
        marks: 35,
        topics: [
          {
            id: "bcs-en-1",
            title: "Parts of Speech & Their Functions",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-en-2",
            title: "Tenses — all 12 tenses with usage",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-en-3",
            title: "Voice (Active ↔ Passive)",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-en-4",
            title: "Narration (Direct ↔ Indirect)",
            serial: 4,
            completed: false,
          },
          {
            id: "bcs-en-5",
            title: "Subject-Verb Agreement",
            serial: 5,
            completed: false,
          },
          {
            id: "bcs-en-6",
            title: "Articles, Prepositions & Determiners",
            serial: 6,
            completed: false,
          },
          {
            id: "bcs-en-7",
            title: "Sentence Correction & Transformation",
            serial: 7,
            completed: false,
          },
          {
            id: "bcs-en-8",
            title: "Phrases, Idioms & Clauses",
            serial: 8,
            completed: false,
          },
          {
            id: "bcs-en-9",
            title: "Synonyms, Antonyms & Vocabulary",
            serial: 9,
            completed: false,
          },
          {
            id: "bcs-en-10",
            title: "Spelling, Word Formation & One-word Substitution",
            serial: 10,
            completed: false,
          },
          {
            id: "bcs-en-11",
            title: "English Literature: Renaissance to Romantic Age",
            serial: 11,
            completed: false,
          },
          {
            id: "bcs-en-12",
            title: "Victorian & Modern Age — major authors & works",
            serial: 12,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-preli-math",
        title: "গণিত",
        serial: 3,
        marks: 15,
        topics: [
          {
            id: "bcs-ma-1",
            title: "সংখ্যা পদ্ধতি, মৌলিক সংখ্যা ও গড়",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-ma-2",
            title: "লসাগু, গসাগু ও ভগ্নাংশ",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-ma-3",
            title: "শতকরা, লাভ-ক্ষতি ও বাট্টা",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-ma-4",
            title: "সরল ও চক্রবৃদ্ধি সুদ",
            serial: 4,
            completed: false,
          },
          {
            id: "bcs-ma-5",
            title: "অনুপাত, সমানুপাত ও ঐকিক নিয়ম",
            serial: 5,
            completed: false,
          },
          {
            id: "bcs-ma-6",
            title: "কাজ ও সময়, দূরত্ব ও গতি",
            serial: 6,
            completed: false,
          },
          {
            id: "bcs-ma-7",
            title: "বীজগণিত — সূত্র, উৎপাদক, সমীকরণ",
            serial: 7,
            completed: false,
          },
          {
            id: "bcs-ma-8",
            title: "জ্যামিতি — রেখা, কোণ, ত্রিভুজ, বৃত্ত",
            serial: 8,
            completed: false,
          },
          {
            id: "bcs-ma-9",
            title: "পরিমিতি — ক্ষেত্রফল ও আয়তন",
            serial: 9,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-preli-mental",
        title: "মানসিক দক্ষতা",
        serial: 4,
        marks: 15,
        topics: [
          {
            id: "bcs-mt-1",
            title: "সংখ্যা সিরিজ ও নম্বর প্যাটার্ন",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-mt-2",
            title: "বর্ণ সিরিজ ও কোড-ডিকোড",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-mt-3",
            title: "উপমা ও সম্পর্ক নির্ণয় (Analogy)",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-mt-4",
            title: "বিন্যাস ও শ্রেণিবিভাগ (Classification)",
            serial: 4,
            completed: false,
          },
          {
            id: "bcs-mt-5",
            title: "যুক্তি ও অনুমান (Logical Reasoning)",
            serial: 5,
            completed: false,
          },
          {
            id: "bcs-mt-6",
            title: "ধাঁধা, বয়স ও দিক নির্ণয়",
            serial: 6,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-preli-bd-affairs",
        title: "বাংলাদেশ বিষয়াবলি",
        serial: 5,
        marks: 30,
        topics: [
          {
            id: "bcs-bd-1",
            title: "বাংলাদেশের ইতিহাস — প্রাচীন থেকে ব্রিটিশ আমল",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-bd-2",
            title: "ভাষা আন্দোলন ১৯৫২ ও ১৯৬৬-এর ছয় দফা",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-bd-3",
            title: "মুক্তিযুদ্ধ ১৯৭১ — পটভূমি, ঘটনাপ্রবাহ, ফলাফল",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-bd-4",
            title: "বাংলাদেশের সংবিধান — বৈশিষ্ট্য ও সংশোধনী",
            serial: 4,
            completed: false,
          },
          {
            id: "bcs-bd-5",
            title: "সরকার ব্যবস্থা — জাতীয় সংসদ, মন্ত্রিপরিষদ, বিচার বিভাগ",
            serial: 5,
            completed: false,
          },
          {
            id: "bcs-bd-6",
            title: "ভৌগোলিক অবস্থান, নদ-নদী ও প্রাকৃতিক সম্পদ",
            serial: 6,
            completed: false,
          },
          {
            id: "bcs-bd-7",
            title: "অর্থনীতি — জিডিপি, রপ্তানি, কৃষি ও শিল্প",
            serial: 7,
            completed: false,
          },
          {
            id: "bcs-bd-8",
            title: "জনসংখ্যা, জেলা, বিভাগ ও প্রশাসনিক কাঠামো",
            serial: 8,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-preli-intl",
        title: "আন্তর্জাতিক বিষয়াবলি",
        serial: 6,
        marks: 20,
        topics: [
          {
            id: "bcs-in-1",
            title: "বিশ্বের দেশ, রাজধানী, মুদ্রা ও আয়তন",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-in-2",
            title: "জাতিসংঘ ও অঙ্গসংস্থা (UNICEF, WHO, IMF, WB)",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-in-3",
            title: "আঞ্চলিক সংস্থা — SAARC, ASEAN, EU, AU, OIC",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-in-4",
            title: "আন্তর্জাতিক চুক্তি ও পরিবেশ সম্মেলন",
            serial: 4,
            completed: false,
          },
          {
            id: "bcs-in-5",
            title: "সাম্প্রতিক বৈশ্বিক ঘটনাবলি ও ভূ-রাজনীতি",
            serial: 5,
            completed: false,
          },
          {
            id: "bcs-in-6",
            title: "আন্তর্জাতিক পুরস্কার (নোবেল) ও খেলাধুলা",
            serial: 6,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-preli-science",
        title: "সাধারণ বিজ্ঞান",
        serial: 7,
        marks: 15,
        topics: [
          {
            id: "bcs-sc-1",
            title: "পদার্থবিজ্ঞান — তাপ, শব্দ, আলো, বিদ্যুৎ, গতি",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-sc-2",
            title: "রসায়ন — পর্যায় সারণি, অ্যাসিড-ক্ষার, যৌগ",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-sc-3",
            title: "জীববিজ্ঞান — কোষ, উদ্ভিদ ও প্রাণী",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-sc-4",
            title: "মানব শরীর — অঙ্গ, রক্ত, ভিটামিন ও রোগ",
            serial: 4,
            completed: false,
          },
          {
            id: "bcs-sc-5",
            title: "পরিবেশ বিজ্ঞান ও জলবায়ু পরিবর্তন",
            serial: 5,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-preli-ict",
        title: "তথ্য ও যোগাযোগ প্রযুক্তি",
        serial: 8,
        marks: 15,
        topics: [
          {
            id: "bcs-ict-1",
            title: "কম্পিউটার ইতিহাস, প্রকারভেদ ও উপাদান",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-ict-2",
            title: "সফটওয়্যার, অপারেটিং সিস্টেম ও প্রোগ্রামিং",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-ict-3",
            title: "ইন্টারনেট, নেটওয়ার্ক ও যোগাযোগ প্রযুক্তি",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-ict-4",
            title: "ডিজিটাল বাংলাদেশ, e-governance ও সাইবার নিরাপত্তা",
            serial: 4,
            completed: false,
          },
          {
            id: "bcs-ict-5",
            title: "Binary, ASCII ও সংখ্যা পদ্ধতি রূপান্তর",
            serial: 5,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-preli-geo",
        title: "ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা",
        serial: 9,
        marks: 10,
        topics: [
          {
            id: "bcs-ge-1",
            title: "বাংলাদেশের ভূগোল — ভূমিরূপ, মাটি ও জলবায়ু",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-ge-2",
            title: "বিশ্বের মহাদেশ, মহাসাগর ও পর্বত",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-ge-3",
            title: "দুর্যোগ ব্যবস্থাপনা — বন্যা, ঘূর্ণিঝড়, ভূমিকম্প",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-ge-4",
            title: "পরিবেশ দূষণ ও প্রতিকার",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-preli-ethics",
        title: "নৈতিকতা, মূল্যবোধ ও সুশাসন",
        serial: 10,
        marks: 10,
        topics: [
          {
            id: "bcs-et-1",
            title: "নৈতিকতার ধারণা ও সরকারি চাকুরিতে নৈতিক আচরণ",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-et-2",
            title: "সুশাসন — ধারণা, সূচক ও বাংলাদেশ প্রেক্ষাপট",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-et-3",
            title: "মূল্যবোধ, সামাজিক দায়বদ্ধতা ও জবাবদিহিতা",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-et-4",
            title: "দুর্নীতি প্রতিরোধ ও স্বচ্ছতা",
            serial: 4,
            completed: false,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // BCS WRITTEN — General Cadres (900 marks)
  // Source: BPSC official syllabus
  // ─────────────────────────────────────────────────────────────────
  {
    id: "bcs-written-general",
    slug: "bcs-written-general",
    title: "BCS Written — General Cadres",
    titleBn: "বিসিএস লিখিত পরীক্ষা (সাধারণ ক্যাডার)",
    category: "bcs",
    examType: "Written",
    totalMarks: 900,
    subjects: [
      {
        id: "bcs-w-bangla1",
        title: "বাংলা (প্রথম পত্র) — রচনামূলক",
        serial: 1,
        marks: 100,
        topics: [
          {
            id: "bcs-wb1-1",
            title: "প্রবন্ধ রচনা (সমসাময়িক ও দেশীয় বিষয়)",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-wb1-2",
            title: "ভাষা দক্ষতা — সারসংক্ষেপ ও ভাব-সম্প্রসারণ",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-wb1-3",
            title: "পত্র লেখন (দাপ্তরিক ও অ-দাপ্তরিক)",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-wb1-4",
            title: "অনুবাদ (ইংরেজি থেকে বাংলা)",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-w-bangla2",
        title: "বাংলা (দ্বিতীয় পত্র) — ব্যাকরণ ও সাহিত্য",
        serial: 2,
        marks: 100,
        topics: [
          {
            id: "bcs-wb2-1",
            title: "বাংলা ব্যাকরণ — বিস্তারিত (সন্ধি, কারক, সমাস)",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-wb2-2",
            title: "সাহিত্য বিশ্লেষণ — কবি ও লেখক পরিচিতি",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-wb2-3",
            title: "কবিতা ও গদ্য থেকে উদ্ধৃতি ব্যাখ্যা",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-wb2-4",
            title: "বিভিন্ন সাহিত্যকর্মের উৎস ও বৈশিষ্ট্য",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-w-english",
        title: "English (200 Marks)",
        serial: 3,
        marks: 200,
        topics: [
          {
            id: "bcs-we-1",
            title: "Essay Writing (current affairs & analytical)",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-we-2",
            title: "Précis Writing & Comprehension",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-we-3",
            title: "Official & Informal Letter Writing",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-we-4",
            title: "Translation (Bangla to English)",
            serial: 4,
            completed: false,
          },
          {
            id: "bcs-we-5",
            title: "Grammar — Error Correction & Sentence Rewriting",
            serial: 5,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-w-bd",
        title: "বাংলাদেশ বিষয়াবলি (200 নম্বর)",
        serial: 4,
        marks: 200,
        topics: [
          {
            id: "bcs-wbd-1",
            title: "বাংলাদেশের ইতিহাস ও স্বাধীনতা আন্দোলন",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-wbd-2",
            title: "সংবিধান, সরকার ও নির্বাচন ব্যবস্থা",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-wbd-3",
            title: "অর্থনীতি, উন্নয়ন পরিকল্পনা ও বাজেট",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-wbd-4",
            title: "পররাষ্ট্র নীতি ও আন্তর্জাতিক সম্পর্ক",
            serial: 4,
            completed: false,
          },
          {
            id: "bcs-wbd-5",
            title: "সামাজিক উন্নয়ন — শিক্ষা, স্বাস্থ্য, নারী",
            serial: 5,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-w-intl",
        title: "আন্তর্জাতিক বিষয়াবলি (100 নম্বর)",
        serial: 5,
        marks: 100,
        topics: [
          {
            id: "bcs-wi-1",
            title: "বৈশ্বিক রাজনীতি ও মার্কিন-চীন-রাশিয়া সম্পর্ক",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-wi-2",
            title: "আন্তর্জাতিক আইন ও কূটনীতি",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-wi-3",
            title: "আন্তর্জাতিক সংস্থার ভূমিকা ও কার্যক্রম",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-wi-4",
            title: "আঞ্চলিক ইস্যু ও বৈশ্বিক নিরাপত্তা",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-w-math",
        title: "গাণিতিক যুক্তি ও মানসিক দক্ষতা (100 নম্বর)",
        serial: 6,
        marks: 100,
        topics: [
          {
            id: "bcs-wm-1",
            title: "গাণিতিক যুক্তি — সংখ্যা, শতকরা, অনুপাত, সুদ",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-wm-2",
            title: "বীজগণিত ও জ্যামিতি সমস্যা",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-wm-3",
            title: "ডেটা বিশ্লেষণ ও পরিসংখ্যান",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-wm-4",
            title: "মানসিক দক্ষতা — সিরিজ, অ্যানালজি, লজিক",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "bcs-w-science",
        title: "সাধারণ বিজ্ঞান ও প্রযুক্তি (100 নম্বর)",
        serial: 7,
        marks: 100,
        topics: [
          {
            id: "bcs-ws-1",
            title: "ভৌত বিজ্ঞান ও রসায়নের প্রাসঙ্গিক প্রয়োগ",
            serial: 1,
            completed: false,
          },
          {
            id: "bcs-ws-2",
            title: "জীববিজ্ঞান ও পরিবেশ বিজ্ঞান",
            serial: 2,
            completed: false,
          },
          {
            id: "bcs-ws-3",
            title: "তথ্যপ্রযুক্তি ও ডিজিটাল বাংলাদেশ রূপকল্প",
            serial: 3,
            completed: false,
          },
          {
            id: "bcs-ws-4",
            title: "কৃষি, শিল্প ও জ্বালানি প্রযুক্তি",
            serial: 4,
            completed: false,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // 19TH NTRCA PRELIMINARY — School & College Level
  // Source: Actual DB syllabus (syllabuses_rows.csv)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "ntrca-school-preliminary",
    slug: "ntrca-school-preliminary",
    title: "NTRCA School Level Preliminary",
    titleBn: "NTRCA স্কুল পর্যায় প্রিলিমিনারি",
    category: "education",
    examType: "MCQ",
    totalMarks: 100,
    subjects: [
      {
        id: "ntrca-s-bangla",
        title: "বাংলা",
        serial: 1,
        marks: 25,
        topics: [
          {
            id: "ntrca-sb-1",
            title: "ভাষারীতি ও বিরামচিহ্নের ব্যবহার",
            serial: 1,
            completed: false,
          },
          {
            id: "ntrca-sb-2",
            title: "ভুল সংশোধন ও শুদ্ধকরণ",
            serial: 2,
            completed: false,
          },
          {
            id: "ntrca-sb-3",
            title: "বাগধারা ও বাগবিধি",
            serial: 3,
            completed: false,
          },
          {
            id: "ntrca-sb-4",
            title: "যথার্থ অনুবাদ (বাংলা থেকে ইংরেজি)",
            serial: 4,
            completed: false,
          },
          {
            id: "ntrca-sb-5",
            title: "সন্ধি বিচ্ছেদ",
            serial: 5,
            completed: false,
          },
          {
            id: "ntrca-sb-6",
            title: "কারক ও বিভক্তি",
            serial: 6,
            completed: false,
          },
          {
            id: "ntrca-sb-7",
            title: "সমাস ও প্রত্যয়",
            serial: 7,
            completed: false,
          },
          {
            id: "ntrca-sb-8",
            title: "সমার্থক ও বিপরীতার্থক শব্দ",
            serial: 8,
            completed: false,
          },
          {
            id: "ntrca-sb-9",
            title: "বাক্য সংকোচন (এককথায় প্রকাশ)",
            serial: 9,
            completed: false,
          },
          {
            id: "ntrca-sb-10",
            title: "লিঙ্গ পরিবর্তন",
            serial: 10,
            completed: false,
          },
        ],
      },
      {
        id: "ntrca-s-english",
        title: "English",
        serial: 2,
        marks: 25,
        topics: [
          {
            id: "ntrca-se-1",
            title: "Sentences — types & structure",
            serial: 1,
            completed: false,
          },
          {
            id: "ntrca-se-2",
            title: "Change of Parts of Speech",
            serial: 2,
            completed: false,
          },
          {
            id: "ntrca-se-3",
            title: "Transformation of Sentences",
            serial: 3,
            completed: false,
          },
          {
            id: "ntrca-se-4",
            title: "Right Forms of Verb & Tense",
            serial: 4,
            completed: false,
          },
          {
            id: "ntrca-se-5",
            title: "Synonyms & Antonyms",
            serial: 5,
            completed: false,
          },
          {
            id: "ntrca-se-6",
            title: "Idioms & Phrases",
            serial: 6,
            completed: false,
          },
          {
            id: "ntrca-se-7",
            title: "Fill in the Blanks (appropriate word)",
            serial: 7,
            completed: false,
          },
          {
            id: "ntrca-se-8",
            title: "Translation from Bengali to English",
            serial: 8,
            completed: false,
          },
        ],
      },
      {
        id: "ntrca-s-math",
        title: "গণিত",
        serial: 3,
        marks: 25,
        topics: [
          {
            id: "ntrca-sm-1",
            title: "পাটিগণিত — গড়, ঐকিক নিয়ম, লসাগু, গসাগু",
            serial: 1,
            completed: false,
          },
          {
            id: "ntrca-sm-2",
            title: "পাটিগণিত — সুদ, লাভ-ক্ষতি, শতাংশ, অনুপাত",
            serial: 2,
            completed: false,
          },
          {
            id: "ntrca-sm-3",
            title: "বীজগণিত — বাস্তব সংখ্যা, সূত্র, বর্গ ও ঘন",
            serial: 3,
            completed: false,
          },
          {
            id: "ntrca-sm-4",
            title: "বীজগণিত — সূচক ও লগারিদম প্রয়োগ",
            serial: 4,
            completed: false,
          },
          {
            id: "ntrca-sm-5",
            title: "বীজগণিতীয় সূত্রের গঠন ও প্রয়োগ",
            serial: 5,
            completed: false,
          },
          {
            id: "ntrca-sm-6",
            title: "জ্যামিতি — রেখা, কোণ, ত্রিভুজ, চতুর্ভুজ",
            serial: 6,
            completed: false,
          },
          {
            id: "ntrca-sm-7",
            title: "জ্যামিতি — ক্ষেত্রফল ও বৃত্তের ধারণা",
            serial: 7,
            completed: false,
          },
        ],
      },
      {
        id: "ntrca-s-gk",
        title: "সাধারণ জ্ঞান",
        serial: 4,
        marks: 25,
        topics: [
          {
            id: "ntrca-sg-1",
            title: "বাংলাদেশ — ইতিহাস, ভূগোল ও জলবায়ু",
            serial: 1,
            completed: false,
          },
          {
            id: "ntrca-sg-2",
            title: "ভাষা আন্দোলন ও মুক্তিযুদ্ধ",
            serial: 2,
            completed: false,
          },
          {
            id: "ntrca-sg-3",
            title: "রাজনৈতিক ব্যবস্থা ও অর্থনীতি",
            serial: 3,
            completed: false,
          },
          {
            id: "ntrca-sg-4",
            title: "সভ্যতা, সংস্কৃতি ও বিখ্যাত স্থান",
            serial: 4,
            completed: false,
          },
          {
            id: "ntrca-sg-5",
            title: "জাতীয় দিবস, কৃষি, শিল্প ও পানিসম্পদ",
            serial: 5,
            completed: false,
          },
          {
            id: "ntrca-sg-6",
            title: "আন্তর্জাতিক সংস্থা ও আঞ্চলিক সংগঠন",
            serial: 6,
            completed: false,
          },
          {
            id: "ntrca-sg-7",
            title: "বিভিন্ন দেশের পরিচিতি ও মুদ্রা",
            serial: 7,
            completed: false,
          },
          {
            id: "ntrca-sg-8",
            title: "আন্তর্জাতিক দিবস, পুরস্কার ও খেলাধুলা",
            serial: 8,
            completed: false,
          },
          {
            id: "ntrca-sg-9",
            title: "সাম্প্রতিক ঘটনাবলি (জাতীয় ও আন্তর্জাতিক)",
            serial: 9,
            completed: false,
          },
          {
            id: "ntrca-sg-10",
            title: "দৈনন্দিন বিজ্ঞান — পদার্থ, রসায়ন, জীববিজ্ঞান",
            serial: 10,
            completed: false,
          },
          {
            id: "ntrca-sg-11",
            title: "স্বাস্থ্য, চিকিৎসা ও পরিবেশ বিজ্ঞান",
            serial: 11,
            completed: false,
          },
          {
            id: "ntrca-sg-12",
            title: "তথ্য ও যোগাযোগ প্রযুক্তি (ICT)",
            serial: 12,
            completed: false,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // PRIMARY ASSISTANT TEACHER (DPE)
  // Source: Actual DB syllabus (syllabuses_rows.csv) — DPE Bangladesh
  // Written 80 marks (MCQ), Viva 20 marks, Pass 50%
  // ─────────────────────────────────────────────────────────────────
  {
    id: "primary-teacher",
    slug: "primary-teacher",
    title: "Primary Assistant Teacher",
    titleBn: "প্রাথমিক সহকারী শিক্ষক (DPE)",
    category: "education",
    examType: "MCQ + Viva",
    totalMarks: 100,
    subjects: [
      {
        id: "dpe-bangla",
        title: "বাংলা",
        serial: 1,
        marks: 20,
        topics: [
          {
            id: "dpe-bn-1",
            title: "ধ্বনি ও ধ্বনি পরিবর্তন",
            serial: 1,
            completed: false,
          },
          {
            id: "dpe-bn-2",
            title: "সন্ধি বিচ্ছেদ ও সমাস",
            serial: 2,
            completed: false,
          },
          {
            id: "dpe-bn-3",
            title: "কারক-বিভক্তি",
            serial: 3,
            completed: false,
          },
          {
            id: "dpe-bn-4",
            title: "পদ প্রকরণ ও কাল",
            serial: 4,
            completed: false,
          },
          {
            id: "dpe-bn-5",
            title: "উপসর্গ ও অনুসর্গ",
            serial: 5,
            completed: false,
          },
          {
            id: "dpe-bn-6",
            title: "বানান ও বাক্য শুদ্ধি",
            serial: 6,
            completed: false,
          },
          {
            id: "dpe-bn-7",
            title: "সমার্থক ও বিপরীত শব্দ",
            serial: 7,
            completed: false,
          },
          { id: "dpe-bn-8", title: "বাগধারা", serial: 8, completed: false },
          {
            id: "dpe-bn-9",
            title: "বাংলা সাহিত্য — প্রাচীন ও মধ্যযুগ",
            serial: 9,
            completed: false,
          },
          {
            id: "dpe-bn-10",
            title: "রবীন্দ্রনাথ, নজরুল, জসীমউদ্দীন, বঙ্কিমচন্দ্র",
            serial: 10,
            completed: false,
          },
          {
            id: "dpe-bn-11",
            title: "মুক্তিযুদ্ধ ভিত্তিক সাহিত্য ও ভাষা আন্দোলন",
            serial: 11,
            completed: false,
          },
          {
            id: "dpe-bn-12",
            title: "ছদ্মনাম ও সংবাদপত্র",
            serial: 12,
            completed: false,
          },
        ],
      },
      {
        id: "dpe-english",
        title: "ইংরেজি",
        serial: 2,
        marks: 20,
        topics: [
          {
            id: "dpe-en-1",
            title: "Parts of Speech",
            serial: 1,
            completed: false,
          },
          {
            id: "dpe-en-2",
            title: "Tense, Voice & Narration",
            serial: 2,
            completed: false,
          },
          {
            id: "dpe-en-3",
            title: "Article, Number & Gender",
            serial: 3,
            completed: false,
          },
          {
            id: "dpe-en-4",
            title: "Degree of Comparison & Correction",
            serial: 4,
            completed: false,
          },
          {
            id: "dpe-en-5",
            title: "Synonyms & Antonyms",
            serial: 5,
            completed: false,
          },
          {
            id: "dpe-en-6",
            title: "Phrases & Idioms",
            serial: 6,
            completed: false,
          },
          {
            id: "dpe-en-7",
            title: "Sentence Transformation",
            serial: 7,
            completed: false,
          },
          {
            id: "dpe-en-8",
            title: "English Literature (basics)",
            serial: 8,
            completed: false,
          },
        ],
      },
      {
        id: "dpe-math",
        title: "গণিত",
        serial: 3,
        marks: 20,
        topics: [
          {
            id: "dpe-ma-1",
            title: "লাভ-ক্ষতি ও সুদকষা",
            serial: 1,
            completed: false,
          },
          {
            id: "dpe-ma-2",
            title: "অনুপাত-সমানুপাত",
            serial: 2,
            completed: false,
          },
          {
            id: "dpe-ma-3",
            title: "কাজ ও সময়, বয়স সমস্যা",
            serial: 3,
            completed: false,
          },
          {
            id: "dpe-ma-4",
            title: "লসাগু ও গসাগু",
            serial: 4,
            completed: false,
          },
          {
            id: "dpe-ma-5",
            title: "বীজগণিত — মান নির্ণয় ও সমীকরণ",
            serial: 5,
            completed: false,
          },
          {
            id: "dpe-ma-6",
            title: "ত্রিভুজ ও বৃত্তের ক্ষেত্রফল",
            serial: 6,
            completed: false,
          },
          {
            id: "dpe-ma-7",
            title: "দশমিক ও ভগ্নাংশ",
            serial: 7,
            completed: false,
          },
        ],
      },
      {
        id: "dpe-gk",
        title: "সাধারণ জ্ঞান",
        serial: 4,
        marks: 20,
        topics: [
          {
            id: "dpe-gk-1",
            title: "মুক্তিযুদ্ধ ও ইতিহাস",
            serial: 1,
            completed: false,
          },
          {
            id: "dpe-gk-2",
            title: "বাংলাদেশের ভৌগোলিক তথ্যাবলি",
            serial: 2,
            completed: false,
          },
          {
            id: "dpe-gk-3",
            title: "জুলাই বিপ্লব ও ড. ইউনূস সরকার",
            serial: 3,
            completed: false,
          },
          {
            id: "dpe-gk-4",
            title: "সংবিধান ও রাজনীতি",
            serial: 4,
            completed: false,
          },
          {
            id: "dpe-gk-5",
            title: "অর্থনীতি, জনসংখ্যা ও খনিজ সম্পদ",
            serial: 5,
            completed: false,
          },
          {
            id: "dpe-gk-6",
            title: "আন্তর্জাতিক সংস্থা ও দেশ-মুদ্রা-রাজধানী",
            serial: 6,
            completed: false,
          },
          {
            id: "dpe-gk-7",
            title: "জাতীয় ও আন্তর্জাতিক দিবস",
            serial: 7,
            completed: false,
          },
          {
            id: "dpe-gk-8",
            title: "পদার্থ, রসায়ন ও খাদ্য-পুষ্টি-স্বাস্থ্য",
            serial: 8,
            completed: false,
          },
          {
            id: "dpe-gk-9",
            title: "কম্পিউটার ও ICT",
            serial: 9,
            completed: false,
          },
        ],
      },
      {
        id: "dpe-viva",
        title: "মৌখিক পরীক্ষা (Viva)",
        serial: 5,
        marks: 20,
        topics: [
          {
            id: "dpe-vi-1",
            title: "শিক্ষাগত যোগ্যতা ও অভিজ্ঞতা উপস্থাপন",
            serial: 1,
            completed: false,
          },
          {
            id: "dpe-vi-2",
            title: "প্রাথমিক শিক্ষা ও শিশু মনোবিজ্ঞান",
            serial: 2,
            completed: false,
          },
          {
            id: "dpe-vi-3",
            title: "সাম্প্রতিক ঘটনাবলি ও জাতীয় বিষয়",
            serial: 3,
            completed: false,
          },
          {
            id: "dpe-vi-4",
            title: "ব্যক্তিত্ব ও যোগাযোগ দক্ষতা",
            serial: 4,
            completed: false,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // DSS (সমাজসেবা অধিদপ্তর)
  // Source: Actual DB syllabus (syllabuses_rows.csv)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "dss-recruitment",
    slug: "dss-recruitment",
    title: "DSS Recruitment Exam",
    titleBn: "সমাজসেবা অধিদপ্তর (DSS) নিয়োগ পরীক্ষা",
    category: "govt-office",
    examType: "MCQ / Written + Viva",
    totalMarks: 100,
    subjects: [
      {
        id: "dss-bangla",
        title: "বাংলা",
        serial: 1,
        marks: 25,
        topics: [
          {
            id: "dss-bn-1",
            title: "ধ্বনি ও বর্ণ",
            serial: 1,
            completed: false,
          },
          {
            id: "dss-bn-2",
            title: "শব্দ — সমার্থক, বিপরীতার্থক",
            serial: 2,
            completed: false,
          },
          {
            id: "dss-bn-3",
            title: "সন্ধি বিচ্ছেদ",
            serial: 3,
            completed: false,
          },
          {
            id: "dss-bn-4",
            title: "কারক ও বিভক্তি",
            serial: 4,
            completed: false,
          },
          { id: "dss-bn-5", title: "সমাস", serial: 5, completed: false },
          {
            id: "dss-bn-6",
            title: "প্রত্যয় ও উপসর্গ",
            serial: 6,
            completed: false,
          },
          {
            id: "dss-bn-7",
            title: "বানান শুদ্ধি ও বিরামচিহ্ন",
            serial: 7,
            completed: false,
          },
          {
            id: "dss-bn-8",
            title: "বাগধারা ও প্রবাদ-প্রবচন",
            serial: 8,
            completed: false,
          },
          {
            id: "dss-bn-9",
            title: "এককথায় প্রকাশ",
            serial: 9,
            completed: false,
          },
          {
            id: "dss-bn-10",
            title: "বাংলা সাহিত্য — প্রাচীন ও মধ্যযুগ (চর্যাপদ, মঙ্গলকাব্য)",
            serial: 10,
            completed: false,
          },
          {
            id: "dss-bn-11",
            title:
              "আধুনিক যুগ — রবীন্দ্রনাথ, নজরুল, মাইকেল মধুসূদন, বঙ্কিমচন্দ্র",
            serial: 11,
            completed: false,
          },
          {
            id: "dss-bn-12",
            title: "ছদ্মনাম ও উক্তি",
            serial: 12,
            completed: false,
          },
        ],
      },
      {
        id: "dss-english",
        title: "ইংরেজি",
        serial: 2,
        marks: 25,
        topics: [
          {
            id: "dss-en-1",
            title: "Parts of Speech",
            serial: 1,
            completed: false,
          },
          { id: "dss-en-2", title: "Tense", serial: 2, completed: false },
          {
            id: "dss-en-3",
            title: "Voice Change (Active ↔ Passive)",
            serial: 3,
            completed: false,
          },
          {
            id: "dss-en-4",
            title: "Narration (Direct ↔ Indirect)",
            serial: 4,
            completed: false,
          },
          { id: "dss-en-5", title: "Preposition", serial: 5, completed: false },
          {
            id: "dss-en-6",
            title: "Subject-Verb Agreement",
            serial: 6,
            completed: false,
          },
          {
            id: "dss-en-7",
            title: "Clauses & Conditionals",
            serial: 7,
            completed: false,
          },
          {
            id: "dss-en-8",
            title: "Right Forms of Verbs",
            serial: 8,
            completed: false,
          },
          {
            id: "dss-en-9",
            title: "Sentence Correction",
            serial: 9,
            completed: false,
          },
          {
            id: "dss-en-10",
            title: "Synonyms & Antonyms",
            serial: 10,
            completed: false,
          },
          {
            id: "dss-en-11",
            title: "Idioms and Phrases",
            serial: 11,
            completed: false,
          },
          {
            id: "dss-en-12",
            title: "Spelling Corrections & One-word Substitutions",
            serial: 12,
            completed: false,
          },
          {
            id: "dss-en-13",
            title: "Transformation of Sentences",
            serial: 13,
            completed: false,
          },
        ],
      },
      {
        id: "dss-math",
        title: "গণিত",
        serial: 3,
        marks: 25,
        topics: [
          {
            id: "dss-ma-1",
            title: "মৌলিক সংখ্যা ও গড়",
            serial: 1,
            completed: false,
          },
          {
            id: "dss-ma-2",
            title: "লসাগু ও গসাগু",
            serial: 2,
            completed: false,
          },
          { id: "dss-ma-3", title: "ঐকিক নিয়ম", serial: 3, completed: false },
          {
            id: "dss-ma-4",
            title: "শতকরা ও লাভ-ক্ষতি",
            serial: 4,
            completed: false,
          },
          {
            id: "dss-ma-5",
            title: "সরল ও চক্রবৃদ্ধি সুদ",
            serial: 5,
            completed: false,
          },
          {
            id: "dss-ma-6",
            title: "অনুপাত ও সমানুপাত",
            serial: 6,
            completed: false,
          },
          { id: "dss-ma-7", title: "ভগ্নাংশ", serial: 7, completed: false },
          {
            id: "dss-ma-8",
            title: "বীজগণিত — উৎপাদক, বর্গ-ঘন সূত্র, সমীকরণ",
            serial: 8,
            completed: false,
          },
          {
            id: "dss-ma-9",
            title: "বীজগণিত — সূচক ও সমান্তর ধারা",
            serial: 9,
            completed: false,
          },
          {
            id: "dss-ma-10",
            title: "জ্যামিতি — রেখা, কোণ, ত্রিভুজ ও চতুর্ভুজ",
            serial: 10,
            completed: false,
          },
          {
            id: "dss-ma-11",
            title: "বৃত্তের পরিধি, ক্ষেত্রফল ও উপপাদ্য",
            serial: 11,
            completed: false,
          },
        ],
      },
      {
        id: "dss-gk",
        title: "সাধারণ জ্ঞান",
        serial: 4,
        marks: 25,
        topics: [
          {
            id: "dss-gk-1",
            title: "বাংলাদেশের ইতিহাস",
            serial: 1,
            completed: false,
          },
          {
            id: "dss-gk-2",
            title: "মুক্তিযুদ্ধ ১৯৭১",
            serial: 2,
            completed: false,
          },
          {
            id: "dss-gk-3",
            title: "ভৌগোলিক অবস্থান ও প্রশাসন",
            serial: 3,
            completed: false,
          },
          {
            id: "dss-gk-4",
            title: "সংবিধান ও সরকার ব্যবস্থা",
            serial: 4,
            completed: false,
          },
          {
            id: "dss-gk-5",
            title: "জাতীয় সংসদ ও অর্থনীতি",
            serial: 5,
            completed: false,
          },
          {
            id: "dss-gk-6",
            title: "DSS কার্যক্রম — বয়স্ক, বিধবা, প্রতিবন্ধী ভাতা",
            serial: 6,
            completed: false,
          },
          {
            id: "dss-gk-7",
            title: "সমাজসেবা অধিদপ্তরের লক্ষ্য, শিশু উন্নয়ন কার্যক্রম",
            serial: 7,
            completed: false,
          },
          {
            id: "dss-gk-8",
            title: "বিশ্বের দেশ, রাজধানী ও মুদ্রা",
            serial: 8,
            completed: false,
          },
          {
            id: "dss-gk-9",
            title: "জাতিসংঘ, SAARC, ASEAN ও অন্যান্য সংস্থা",
            serial: 9,
            completed: false,
          },
          {
            id: "dss-gk-10",
            title: "সাম্প্রতিক বৈশ্বিক ঘটনাবলি",
            serial: 10,
            completed: false,
          },
          {
            id: "dss-gk-11",
            title: "দৈনন্দিন বিজ্ঞান ও স্বাস্থ্য-পুষ্টিবিজ্ঞান",
            serial: 11,
            completed: false,
          },
          {
            id: "dss-gk-12",
            title: "ভিটামিন ও খনিজ পদার্থ",
            serial: 12,
            completed: false,
          },
          {
            id: "dss-gk-13",
            title: "তথ্য ও যোগাযোগ প্রযুক্তি (ICT)",
            serial: 13,
            completed: false,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // BANGLADESH BANK — Assistant Director (AD)
  // Source: Bangladesh Bank official circular & past question patterns
  // ─────────────────────────────────────────────────────────────────
  {
    id: "bb-assistant-director",
    slug: "bb-assistant-director",
    title: "Bangladesh Bank — Assistant Director",
    titleBn: "বাংলাদেশ ব্যাংক — সহকারী পরিচালক (AD)",
    category: "bank",
    examType: "MCQ + Written + Viva",
    totalMarks: 200,
    subjects: [
      {
        id: "bb-bangla",
        title: "বাংলা",
        serial: 1,
        marks: 25,
        topics: [
          {
            id: "bb-bn-1",
            title: "ব্যাকরণ — সন্ধি, কারক, সমাস, প্রত্যয়",
            serial: 1,
            completed: false,
          },
          {
            id: "bb-bn-2",
            title: "বাগধারা, সমার্থক ও বিপরীত শব্দ",
            serial: 2,
            completed: false,
          },
          {
            id: "bb-bn-3",
            title: "বানান শুদ্ধি ও বাক্য সংশোধন",
            serial: 3,
            completed: false,
          },
          {
            id: "bb-bn-4",
            title: "বাংলা সাহিত্য — উল্লেখযোগ্য লেখক ও কর্ম",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "bb-english",
        title: "English",
        serial: 2,
        marks: 25,
        topics: [
          {
            id: "bb-en-1",
            title: "Grammar — Tense, Voice, Narration, Correction",
            serial: 1,
            completed: false,
          },
          {
            id: "bb-en-2",
            title: "Vocabulary — Synonyms, Antonyms, Idioms",
            serial: 2,
            completed: false,
          },
          {
            id: "bb-en-3",
            title: "Reading Comprehension",
            serial: 3,
            completed: false,
          },
          {
            id: "bb-en-4",
            title: "Sentence Transformation & Rearrangement",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "bb-math",
        title: "গণিত ও পরিসংখ্যান",
        serial: 3,
        marks: 25,
        topics: [
          {
            id: "bb-ma-1",
            title: "Arithmetic — Percentage, Profit/Loss, Ratio, Interest",
            serial: 1,
            completed: false,
          },
          {
            id: "bb-ma-2",
            title: "Algebra — Equations, Indices, Series",
            serial: 2,
            completed: false,
          },
          {
            id: "bb-ma-3",
            title: "Data Interpretation — Table, Graph, Chart",
            serial: 3,
            completed: false,
          },
          {
            id: "bb-ma-4",
            title: "Statistics — Mean, Median, Mode, SD",
            serial: 4,
            completed: false,
          },
          {
            id: "bb-ma-5",
            title: "Probability (Basic Concepts)",
            serial: 5,
            completed: false,
          },
        ],
      },
      {
        id: "bb-gk",
        title: "সাধারণ জ্ঞান ও আইসিটি",
        serial: 4,
        marks: 25,
        topics: [
          {
            id: "bb-gk-1",
            title: "বাংলাদেশ বিষয়াবলি — ইতিহাস, সংবিধান, অর্থনীতি",
            serial: 1,
            completed: false,
          },
          {
            id: "bb-gk-2",
            title: "আন্তর্জাতিক বিষয়াবলি ও সংস্থা",
            serial: 2,
            completed: false,
          },
          {
            id: "bb-gk-3",
            title: "সাম্প্রতিক ঘটনাবলি (জাতীয় ও বৈশ্বিক)",
            serial: 3,
            completed: false,
          },
          {
            id: "bb-gk-4",
            title: "কম্পিউটার ও আইসিটি মৌলিক ধারণা",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "bb-economics",
        title: "অর্থনীতি ও ব্যাংকিং",
        serial: 5,
        marks: 50,
        topics: [
          {
            id: "bb-ec-1",
            title: "চাহিদা ও যোগান তত্ত্ব, বাজার কাঠামো",
            serial: 1,
            completed: false,
          },
          {
            id: "bb-ec-2",
            title: "জাতীয় আয় — GDP, GNP, NNP পরিমাপ",
            serial: 2,
            completed: false,
          },
          {
            id: "bb-ec-3",
            title: "মুদ্রানীতি ও রাজস্বনীতি",
            serial: 3,
            completed: false,
          },
          {
            id: "bb-ec-4",
            title: "বাণিজ্যিক ব্যাংকিং — আমানত, ঋণ, সুদ হার",
            serial: 4,
            completed: false,
          },
          {
            id: "bb-ec-5",
            title: "কেন্দ্রীয় ব্যাংকের কার্যাবলি ও বাংলাদেশ ব্যাংক",
            serial: 5,
            completed: false,
          },
          {
            id: "bb-ec-6",
            title: "বৈদেশিক মুদ্রা ব্যবস্থাপনা ও বিনিময় হার",
            serial: 6,
            completed: false,
          },
          {
            id: "bb-ec-7",
            title: "মূলধন বাজার — DSE, CSE ও সিকিউরিটিজ",
            serial: 7,
            completed: false,
          },
          {
            id: "bb-ec-8",
            title: "আর্থিক অন্তর্ভুক্তি (Financial Inclusion) ও MFS",
            serial: 8,
            completed: false,
          },
          {
            id: "bb-ec-9",
            title: "আন্তর্জাতিক বাণিজ্য — BoP, LoC, LC",
            serial: 9,
            completed: false,
          },
          {
            id: "bb-ec-10",
            title: "বাংলাদেশের অর্থনৈতিক পরিস্থিতি ও পঞ্চবার্ষিক পরিকল্পনা",
            serial: 10,
            completed: false,
          },
        ],
      },
      {
        id: "bb-written",
        title: "লিখিত পরীক্ষা (Written)",
        serial: 6,
        marks: 50,
        topics: [
          {
            id: "bb-wr-1",
            title: "Essay Writing (English — economic/financial topic)",
            serial: 1,
            completed: false,
          },
          {
            id: "bb-wr-2",
            title: "প্রবন্ধ রচনা (বাংলা — সমসাময়িক বিষয়)",
            serial: 2,
            completed: false,
          },
          {
            id: "bb-wr-3",
            title: "Official Letter / Report Writing",
            serial: 3,
            completed: false,
          },
          {
            id: "bb-wr-4",
            title: "Analytical Reasoning & Case Study",
            serial: 4,
            completed: false,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // PROBATIONARY OFFICER — Sonali / Janata / Agrani / Rupali Bank
  // Source: Bangladesh Bank (BIBM exam pattern), BB circulars
  // ─────────────────────────────────────────────────────────────────
  {
    id: "probationary-officer",
    slug: "probationary-officer",
    title: "Probationary Officer (State Banks)",
    titleBn: "প্রোবেশনারি অফিসার — সোনালী / জনতা / অগ্রণী / রূপালী ব্যাংক",
    category: "bank",
    examType: "MCQ + Written + Viva",
    totalMarks: 200,
    subjects: [
      {
        id: "po-bangla",
        title: "বাংলা",
        serial: 1,
        marks: 25,
        topics: [
          {
            id: "po-bn-1",
            title: "ব্যাকরণ — সমাস, সন্ধি, কারক, প্রত্যয়",
            serial: 1,
            completed: false,
          },
          {
            id: "po-bn-2",
            title: "বাগধারা ও সমার্থক শব্দ",
            serial: 2,
            completed: false,
          },
          {
            id: "po-bn-3",
            title: "বানান শুদ্ধি, বাক্য সংশোধন",
            serial: 3,
            completed: false,
          },
          {
            id: "po-bn-4",
            title: "বাংলা সাহিত্য — সংক্ষিপ্ত পরিচিতি",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "po-english",
        title: "English",
        serial: 2,
        marks: 25,
        topics: [
          {
            id: "po-en-1",
            title: "Grammar — Tense, Voice, Narration, Preposition",
            serial: 1,
            completed: false,
          },
          {
            id: "po-en-2",
            title: "Vocabulary — Synonyms, Antonyms, One-word Sub",
            serial: 2,
            completed: false,
          },
          {
            id: "po-en-3",
            title: "Reading Comprehension & Cloze Test",
            serial: 3,
            completed: false,
          },
          {
            id: "po-en-4",
            title: "Sentence Rearrangement & Error Spotting",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "po-math",
        title: "গণিত",
        serial: 3,
        marks: 25,
        topics: [
          {
            id: "po-ma-1",
            title: "Arithmetic — Percentage, Ratio, Interest, Partnership",
            serial: 1,
            completed: false,
          },
          {
            id: "po-ma-2",
            title: "Algebra — Equations, Indices, Progressions",
            serial: 2,
            completed: false,
          },
          {
            id: "po-ma-3",
            title: "Data Interpretation — Tables, Bar/Pie Charts",
            serial: 3,
            completed: false,
          },
          {
            id: "po-ma-4",
            title: "Mensuration & Basic Geometry",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "po-gk",
        title: "সাধারণ জ্ঞান ও আইসিটি",
        serial: 4,
        marks: 25,
        topics: [
          {
            id: "po-gk-1",
            title: "বাংলাদেশ বিষয়াবলি",
            serial: 1,
            completed: false,
          },
          {
            id: "po-gk-2",
            title: "আন্তর্জাতিক বিষয়াবলি ও সংস্থা",
            serial: 2,
            completed: false,
          },
          {
            id: "po-gk-3",
            title: "ব্যাংকিং ও অর্থনীতির মৌলিক ধারণা",
            serial: 3,
            completed: false,
          },
          {
            id: "po-gk-4",
            title: "কম্পিউটার ও আইসিটি",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "po-analytical",
        title: "বিশ্লেষণমূলক দক্ষতা",
        serial: 5,
        marks: 25,
        topics: [
          {
            id: "po-an-1",
            title: "Analytical Ability & Critical Reasoning",
            serial: 1,
            completed: false,
          },
          {
            id: "po-an-2",
            title: "Puzzles, Seating Arrangements & Blood Relations",
            serial: 2,
            completed: false,
          },
          {
            id: "po-an-3",
            title: "Input-Output, Coding-Decoding",
            serial: 3,
            completed: false,
          },
          {
            id: "po-an-4",
            title: "Direction Sense & Ranking",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "po-written",
        title: "লিখিত পরীক্ষা ও ভাইভা",
        serial: 6,
        marks: 75,
        topics: [
          {
            id: "po-wr-1",
            title: "Essay Writing (English)",
            serial: 1,
            completed: false,
          },
          {
            id: "po-wr-2",
            title: "প্রবন্ধ রচনা (বাংলা)",
            serial: 2,
            completed: false,
          },
          {
            id: "po-wr-3",
            title: "অফিসিয়াল চিঠি ও প্রতিবেদন লেখা",
            serial: 3,
            completed: false,
          },
          {
            id: "po-wr-4",
            title: "ভাইভা — ব্যাংকিং জ্ঞান ও ব্যক্তিত্ব মূল্যায়ন",
            serial: 4,
            completed: false,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // COMPUTER OPERATOR — Govt Office (various ministries)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "computer-operator",
    slug: "computer-operator",
    title: "Computer Operator (Govt Office)",
    titleBn: "কম্পিউটার অপারেটর",
    category: "govt-office",
    examType: "MCQ + Practical",
    totalMarks: 100,
    subjects: [
      {
        id: "co-bangla",
        title: "বাংলা ও ইংরেজি",
        serial: 1,
        marks: 20,
        topics: [
          {
            id: "co-bn-1",
            title: "ব্যাকরণ — ধ্বনি, শব্দ, বাক্য, বানান",
            serial: 1,
            completed: false,
          },
          {
            id: "co-bn-2",
            title: "Grammar — Parts of Speech, Tense, Vocabulary",
            serial: 2,
            completed: false,
          },
        ],
      },
      {
        id: "co-math",
        title: "গণিত",
        serial: 2,
        marks: 20,
        topics: [
          {
            id: "co-ma-1",
            title: "পাটিগণিত — শতকরা, লাভ-ক্ষতি, সুদ",
            serial: 1,
            completed: false,
          },
          {
            id: "co-ma-2",
            title: "বীজগণিত — সমীকরণ ও সূত্র",
            serial: 2,
            completed: false,
          },
          {
            id: "co-ma-3",
            title: "জ্যামিতি — ক্ষেত্রফল ও আয়তন",
            serial: 3,
            completed: false,
          },
        ],
      },
      {
        id: "co-ict",
        title: "কম্পিউটার ও আইসিটি",
        serial: 3,
        marks: 40,
        topics: [
          {
            id: "co-ict-1",
            title: "কম্পিউটারের ইতিহাস, প্রকারভেদ ও মূল উপাদান (Hardware)",
            serial: 1,
            completed: false,
          },
          {
            id: "co-ict-2",
            title: "অপারেটিং সিস্টেম — Windows, Linux মৌলিক ধারণা",
            serial: 2,
            completed: false,
          },
          {
            id: "co-ict-3",
            title: "MS Word — ডকুমেন্ট ফরম্যাটিং ও মেইল মার্জ",
            serial: 3,
            completed: false,
          },
          {
            id: "co-ict-4",
            title: "MS Excel — ফর্মুলা, ফাংশন, চার্ট ও ডেটা সর্টিং",
            serial: 4,
            completed: false,
          },
          {
            id: "co-ict-5",
            title: "MS PowerPoint — স্লাইড ডিজাইন ও প্রেজেন্টেশন",
            serial: 5,
            completed: false,
          },
          {
            id: "co-ict-6",
            title: "নেটওয়ার্কিং — LAN, WAN, IP Address, DNS",
            serial: 6,
            completed: false,
          },
          {
            id: "co-ict-7",
            title: "ইন্টারনেট ও ওয়েব ব্রাউজিং, ই-মেইল",
            serial: 7,
            completed: false,
          },
          {
            id: "co-ict-8",
            title: "ডেটাবেস — MS Access মৌলিক ধারণা, SQL",
            serial: 8,
            completed: false,
          },
          {
            id: "co-ict-9",
            title: "সাইবার নিরাপত্তা — ভাইরাস, ফিশিং, পাসওয়ার্ড",
            serial: 9,
            completed: false,
          },
          {
            id: "co-ict-10",
            title: "Binary ও হেক্সাডেসিমেল সংখ্যা পদ্ধতি",
            serial: 10,
            completed: false,
          },
        ],
      },
      {
        id: "co-gk",
        title: "সাধারণ জ্ঞান",
        serial: 4,
        marks: 20,
        topics: [
          {
            id: "co-gk-1",
            title: "বাংলাদেশ বিষয়াবলি",
            serial: 1,
            completed: false,
          },
          {
            id: "co-gk-2",
            title: "আন্তর্জাতিক বিষয়াবলি ও সাম্প্রতিক ঘটনা",
            serial: 2,
            completed: false,
          },
          {
            id: "co-gk-3",
            title: "ডিজিটাল বাংলাদেশ ও e-service",
            serial: 3,
            completed: false,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // BANGLADESH ARMY — Soldier (General Duty) Recruitment
  // ─────────────────────────────────────────────────────────────────
  {
    id: "bangladesh-army",
    slug: "bangladesh-army",
    title: "Bangladesh Army — Soldier Recruitment",
    titleBn: "বাংলাদেশ সেনাবাহিনী — সৈনিক নিয়োগ",
    category: "defense",
    examType: "Written + Physical + Medical",
    totalMarks: 100,
    subjects: [
      {
        id: "army-bangla",
        title: "বাংলা",
        serial: 1,
        marks: 25,
        topics: [
          {
            id: "ar-bn-1",
            title: "ব্যাকরণ — বর্ণ, শব্দ, বাক্য ও সন্ধি",
            serial: 1,
            completed: false,
          },
          {
            id: "ar-bn-2",
            title: "বানান শুদ্ধি ও বাগধারা",
            serial: 2,
            completed: false,
          },
          {
            id: "ar-bn-3",
            title: "সাহিত্য — বিখ্যাত কবি ও লেখক পরিচিতি",
            serial: 3,
            completed: false,
          },
          {
            id: "ar-bn-4",
            title: "মুক্তিযুদ্ধ ও ভাষা আন্দোলন",
            serial: 4,
            completed: false,
          },
        ],
      },
      {
        id: "army-english",
        title: "ইংরেজি",
        serial: 2,
        marks: 25,
        topics: [
          {
            id: "ar-en-1",
            title: "Parts of Speech & Tense",
            serial: 1,
            completed: false,
          },
          {
            id: "ar-en-2",
            title: "Vocabulary — Synonyms, Antonyms",
            serial: 2,
            completed: false,
          },
          {
            id: "ar-en-3",
            title: "Sentence Correction & Fill in the Blanks",
            serial: 3,
            completed: false,
          },
        ],
      },
      {
        id: "army-math",
        title: "গণিত",
        serial: 3,
        marks: 25,
        topics: [
          {
            id: "ar-ma-1",
            title: "পাটিগণিত — শতকরা, অনুপাত, সুদকষা",
            serial: 1,
            completed: false,
          },
          {
            id: "ar-ma-2",
            title: "বীজগণিত — সহজ সমীকরণ",
            serial: 2,
            completed: false,
          },
          {
            id: "ar-ma-3",
            title: "জ্যামিতি — কোণ, ত্রিভুজ, ক্ষেত্রফল",
            serial: 3,
            completed: false,
          },
        ],
      },
      {
        id: "army-gk",
        title: "সাধারণ জ্ঞান",
        serial: 4,
        marks: 25,
        topics: [
          {
            id: "ar-gk-1",
            title: "বাংলাদেশ — ইতিহাস, ভূগোল, সংবিধান",
            serial: 1,
            completed: false,
          },
          {
            id: "ar-gk-2",
            title: "বাংলাদেশ সশস্ত্রবাহিনী ও মুক্তিযুদ্ধ",
            serial: 2,
            completed: false,
          },
          {
            id: "ar-gk-3",
            title: "আন্তর্জাতিক বিষয়াবলি ও সাম্প্রতিক ঘটনা",
            serial: 3,
            completed: false,
          },
          {
            id: "ar-gk-4",
            title: "বিজ্ঞান ও প্রযুক্তি — সাধারণ ধারণা",
            serial: 4,
            completed: false,
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// Helper functions (unchanged API, same as before)
// ─────────────────────────────────────────────────────────────────

export function getTotalTopics(role: JobRole): number {
  return role.subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
}

export function getCompletedTopics(role: JobRole): number {
  return role.subjects.reduce(
    (sum, subject) => sum + subject.topics.filter((t) => t.completed).length,
    0,
  );
}

export function getCurrentTopicIndex(
  role: JobRole,
): { subjectIndex: number; topicIndex: number } | null {
  for (let si = 0; si < role.subjects.length; si++) {
    for (let ti = 0; ti < role.subjects[si].topics.length; ti++) {
      if (!role.subjects[si].topics[ti].completed) {
        return { subjectIndex: si, topicIndex: ti };
      }
    }
  }
  return null;
}

export function getTotalMarks(role: JobRole): number {
  return role.subjects.reduce((sum, s) => sum + (s.marks ?? 0), 0);
}
