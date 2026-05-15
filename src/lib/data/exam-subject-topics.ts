// @/lib/data/exam-subject-topics.ts

export interface ExamOption {
  id: number;
  name: string;
}

export interface SubjectOption {
  id: number;
  exam_id: number;
  name: string;
  marks: number;
}

export interface TopicOption {
  id: number;
  subject_id: number;
  name: string;
}

export const exams: ExamOption[] = [
  { id: 1, name: "BCS প্রিলিমিনারি" },
  { id: 2, name: "NTRCA শিক্ষক নিবন্ধন (প্রিলিমিনারি)" },
  { id: 3, name: "প্রাথমিক শিক্ষক নিয়োগ (DPE)" },
];

export const subjects: SubjectOption[] = [
  // BCS (exam_id: 1)
  { id: 101, exam_id: 1, name: "বাংলা ভাষা ও সাহিত্য", marks: 35 },
  { id: 102, exam_id: 1, name: "English Language & Literature", marks: 35 },
  { id: 103, exam_id: 1, name: "বাংলাদেশ বিষয়াবলি", marks: 30 },
  { id: 104, exam_id: 1, name: "আন্তর্জাতিক বিষয়াবলি", marks: 20 },
  {
    id: 105,
    exam_id: 1,
    name: "ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা",
    marks: 10,
  },
  { id: 106, exam_id: 1, name: "সাধারণ বিজ্ঞান", marks: 15 },
  { id: 107, exam_id: 1, name: "গণিত ও মানসিক দক্ষতা", marks: 30 },
  { id: 108, exam_id: 1, name: "কম্পিউটার ও তথ্যপ্রযুক্তি", marks: 15 },
  { id: 109, exam_id: 1, name: "নৈতিকতা, মূল্যবোধ ও সুশাসন", marks: 10 },

  // NTRCA (exam_id: 2)
  { id: 201, exam_id: 2, name: "বাংলা", marks: 25 },
  { id: 202, exam_id: 2, name: "English", marks: 25 },
  { id: 203, exam_id: 2, name: "সাধারণ গণিত", marks: 25 },
  { id: 204, exam_id: 2, name: "সাধারণ জ্ঞান", marks: 25 },

  // Primary / DPE (exam_id: 3)
  { id: 301, exam_id: 3, name: "বাংলা", marks: 25 },
  { id: 302, exam_id: 3, name: "English", marks: 25 },
  { id: 303, exam_id: 3, name: "গণিত", marks: 20 },
  { id: 304, exam_id: 3, name: "সাধারণ জ্ঞান ও বিজ্ঞান", marks: 20 },
];

export const topics: TopicOption[] = [
  // BCS: বাংলা ভাষা ও সাহিত্য (subject_id: 101)
  { id: 1001, subject_id: 101, name: "ধ্বনিতত্ত্ব ও বর্ণমালা" },
  { id: 1002, subject_id: 101, name: "শব্দ ও পদ-প্রকরণ" },
  { id: 1003, subject_id: 101, name: "সন্ধি বিচ্ছেদ" },
  { id: 1004, subject_id: 101, name: "সমাস" },
  { id: 1005, subject_id: 101, name: "কারক ও বিভক্তি" },
  { id: 1006, subject_id: 101, name: "বাক্য গঠন ও বাক্য রূপান্তর" },
  { id: 1007, subject_id: 101, name: "বানান শুদ্ধি ও প্রকরণ" },
  { id: 1008, subject_id: 101, name: "বাগধারা ও প্রবাদ-প্রবচন" },
  { id: 1009, subject_id: 101, name: "সমার্থক ও বিপরীত শব্দ" },
  { id: 1010, subject_id: 101, name: "এককথায় প্রকাশ" },
  { id: 1011, subject_id: 101, name: "প্রত্যয় ও উপসর্গ" },
  { id: 1012, subject_id: 101, name: "বিরামচিহ্ন" },
  { id: 1013, subject_id: 101, name: "ব্যাকরণিক পরিভাষা" },
  { id: 1014, subject_id: 101, name: "সাহিত্য — প্রাচীন যুগ (চর্যাপদ)" },
  {
    id: 1015,
    subject_id: 101,
    name: "সাহিত্য — মধ্যযুগ (মঙ্গলকাব্য, বৈষ্ণব সাহিত্য)",
  },
  { id: 1016, subject_id: 101, name: "সাহিত্য — আধুনিক যুগ: কবিতা" },
  { id: 1017, subject_id: 101, name: "সাহিত্য — আধুনিক যুগ: উপন্যাস ও গল্প" },
  { id: 1018, subject_id: 101, name: "রবীন্দ্রনাথ ঠাকুর" },
  { id: 1019, subject_id: 101, name: "কাজী নজরুল ইসলাম" },
  { id: 1020, subject_id: 101, name: "মাইকেল মধুসূদন দত্ত" },
  { id: 1021, subject_id: 101, name: "জীবনানন্দ দাশ ও অন্যান্য কবি" },
  { id: 1022, subject_id: 101, name: "বঙ্কিমচন্দ্র ও শরৎচন্দ্র চট্টোপাধ্যায়" },
  { id: 1023, subject_id: 101, name: "মুক্তিযুদ্ধভিত্তিক সাহিত্য" },

  // BCS: English (subject_id: 102)
  { id: 1101, subject_id: 102, name: "Parts of Speech" },
  { id: 1102, subject_id: 102, name: "Tense & Verb Forms" },
  { id: 1103, subject_id: 102, name: "Voice (Active & Passive)" },
  { id: 1104, subject_id: 102, name: "Narration (Direct & Indirect Speech)" },
  { id: 1105, subject_id: 102, name: "Sentence Transformation & Correction" },
  { id: 1106, subject_id: 102, name: "Clauses & Conditionals" },
  { id: 1107, subject_id: 102, name: "Articles & Prepositions" },
  { id: 1108, subject_id: 102, name: "Idioms & Phrases" },
  { id: 1109, subject_id: 102, name: "Synonyms & Antonyms" },
  { id: 1110, subject_id: 102, name: "Spelling & Vocabulary" },
  { id: 1111, subject_id: 102, name: "Composition & Translation" },
  { id: 1112, subject_id: 102, name: "Change of Parts of Speech" },
  { id: 1113, subject_id: 102, name: "Literature — Elizabethan Period" },
  {
    id: 1114,
    subject_id: 102,
    name: "Literature — Romantic & Victorian Period",
  },
  { id: 1115, subject_id: 102, name: "Literature — 20th & 21st Century" },
  { id: 1116, subject_id: 102, name: "Shakespeare's Major Works" },
  { id: 1117, subject_id: 102, name: "Famous Quotations from Drama & Poetry" },
  { id: 1118, subject_id: 102, name: "Modern English Drama & Novel" },

  // BCS: বাংলাদেশ বিষয়াবলি (subject_id: 103)
  { id: 1201, subject_id: 103, name: "বাংলাদেশের ভূগোল ও প্রাকৃতিক পরিবেশ" },
  { id: 1202, subject_id: 103, name: "নদ-নদী, জলাশয় ও বনাঞ্চল" },
  { id: 1203, subject_id: 103, name: "বাংলাদেশের ইতিহাস — প্রাচীন ও মধ্যযুগ" },
  { id: 1204, subject_id: 103, name: "ব্রিটিশ শাসনকাল ও বঙ্গভঙ্গ" },
  { id: 1205, subject_id: 103, name: "ভাষা আন্দোলন ১৯৫২" },
  { id: 1206, subject_id: 103, name: "৬-দফা ও ৬৯-এর গণঅভ্যুত্থান" },
  { id: 1207, subject_id: 103, name: "১৯৭০ সালের নির্বাচন" },
  { id: 1208, subject_id: 103, name: "মুক্তিযুদ্ধ ১৯৭১ ও স্বাধীনতা" },
  { id: 1209, subject_id: 103, name: "বঙ্গবন্ধু শেখ মুজিবুর রহমান" },
  { id: 1210, subject_id: 103, name: "বাংলাদেশের সংবিধান ও সংশোধনী" },
  { id: 1211, subject_id: 103, name: "বাংলাদেশের রাজনীতি ও সরকার ব্যবস্থা" },
  { id: 1212, subject_id: 103, name: "জাতীয় সংসদ ও স্থানীয় সরকার" },
  {
    id: 1213,
    subject_id: 103,
    name: "বাংলাদেশের অর্থনীতি — জিডিপি, রপ্তানি, রেমিট্যান্স",
  },
  { id: 1214, subject_id: 103, name: "বাংলাদেশের কৃষি ও শিল্প" },
  { id: 1215, subject_id: 103, name: "বাংলাদেশের সমাজ ও সংস্কৃতি" },
  { id: 1216, subject_id: 103, name: "বাংলাদেশের জনসংখ্যা ও জনগোষ্ঠী" },
  { id: 1217, subject_id: 103, name: "বাংলাদেশ ও আন্তর্জাতিক সম্পর্ক" },
  { id: 1218, subject_id: 103, name: "SDG ও উন্নয়ন পরিকল্পনা" },
  { id: 1219, subject_id: 103, name: "জাতীয় পুরস্কার ও অর্জন" },

  // BCS: আন্তর্জাতিক বিষয়াবলি (subject_id: 104)
  { id: 1301, subject_id: 104, name: "আন্তর্জাতিক সম্পর্কের ধারণা ও পরিধি" },
  { id: 1302, subject_id: 104, name: "রাষ্ট্র, সার্বভৌমত্ব ও জাতীয়তাবাদ" },
  { id: 1303, subject_id: 104, name: "ক্ষমতা ও শক্তির ভারসাম্য" },
  { id: 1304, subject_id: 104, name: "বৈদেশিক নীতি ও কূটনীতি" },
  { id: 1305, subject_id: 104, name: "জাতিসংঘ ও বিশ্ব সংস্থাসমূহ" },
  { id: 1306, subject_id: 104, name: "বিশ্বযুদ্ধ ও ঠান্ডাযুদ্ধ" },
  { id: 1307, subject_id: 104, name: "দক্ষিণ এশিয়ার রাজনীতি" },
  { id: 1308, subject_id: 104, name: "ভারত-পাকিস্তান সম্পর্ক" },
  { id: 1309, subject_id: 104, name: "বাংলাদেশ-ভারত সম্পর্ক" },
  { id: 1310, subject_id: 104, name: "SAARC, ASEAN, NATO, EU" },
  { id: 1311, subject_id: 104, name: "WTO, IMF, World Bank" },
  { id: 1312, subject_id: 104, name: "সন্ত্রাসবাদ ও আন্তর্জাতিক নিরাপত্তা" },
  { id: 1313, subject_id: 104, name: "মানবাধিকার ও আন্তর্জাতিক আইন" },
  { id: 1314, subject_id: 104, name: "বৈশ্বিক উষ্ণায়ন ও জলবায়ু চুক্তি" },
  { id: 1315, subject_id: 104, name: "মধ্যপ্রাচ্য সংকট ও বৈশ্বিক রাজনীতি" },
  { id: 1316, subject_id: 104, name: "সাম্প্রতিক আন্তর্জাতিক ঘটনাবলি" },

  // BCS: ভূগোল, পরিবেশ ও দুর্যোগ (subject_id: 105)
  { id: 1401, subject_id: 105, name: "ভৌত ভূগোল — পৃথিবীর গঠন ও ভূপ্রকৃতি" },
  { id: 1402, subject_id: 105, name: "আবহাওয়া ও জলবায়ু" },
  { id: 1403, subject_id: 105, name: "বাংলাদেশের ভূগোল ও ভূপ্রকৃতি" },
  { id: 1404, subject_id: 105, name: "নদী ব্যবস্থা ও বন্যা" },
  { id: 1405, subject_id: 105, name: "পরিবেশ দূষণ (বায়ু, পানি, মাটি)" },
  { id: 1406, subject_id: 105, name: "জীববৈচিত্র্য ও বনাঞ্চল" },
  {
    id: 1407,
    subject_id: 105,
    name: "প্রাকৃতিক দুর্যোগ — ঘূর্ণিঝড়, বন্যা, ভূমিকম্প",
  },
  { id: 1408, subject_id: 105, name: "দুর্যোগ ব্যবস্থাপনা ও প্রস্তুতি" },
  { id: 1409, subject_id: 105, name: "জলবায়ু পরিবর্তন ও বাংলাদেশ" },
  { id: 1410, subject_id: 105, name: "মানচিত্র ও স্থানাঙ্ক ব্যবস্থা" },

  // BCS: সাধারণ বিজ্ঞান (subject_id: 106)
  { id: 1501, subject_id: 106, name: "পদার্থবিজ্ঞান — গতি ও বল" },
  { id: 1502, subject_id: 106, name: "পদার্থবিজ্ঞান — তাপ ও শক্তি" },
  { id: 1503, subject_id: 106, name: "পদার্থবিজ্ঞান — আলো ও শব্দ" },
  { id: 1504, subject_id: 106, name: "পদার্থবিজ্ঞান — বিদ্যুৎ ও চুম্বকত্ব" },
  { id: 1505, subject_id: 106, name: "রসায়ন — অ্যাসিড, ক্ষার ও লবণ" },
  { id: 1506, subject_id: 106, name: "রসায়ন — পর্যায় সারণি ও মৌল" },
  { id: 1507, subject_id: 106, name: "রসায়ন — দৈনন্দিন জীবনে রসায়ন" },
  { id: 1508, subject_id: 106, name: "জীববিজ্ঞান — কোষ ও জীবনের একক" },
  { id: 1509, subject_id: 106, name: "জীববিজ্ঞান — উদ্ভিদ ও প্রাণী" },
  { id: 1510, subject_id: 106, name: "জীববিজ্ঞান — মানবদেহ ও স্বাস্থ্য" },
  { id: 1511, subject_id: 106, name: "জীববিজ্ঞান — রোগজীবাণু ও রোগ প্রতিরোধ" },
  { id: 1512, subject_id: 106, name: "খাদ্য ও পুষ্টি" },
  { id: 1513, subject_id: 106, name: "কৃষিবিজ্ঞান ও পরিবেশ" },
  {
    id: 1514,
    subject_id: 106,
    name: "বিজ্ঞান ও প্রযুক্তির সাম্প্রতিক অগ্রগতি",
  },

  // BCS: গণিত ও মানসিক দক্ষতা (subject_id: 107)
  { id: 1601, subject_id: 107, name: "সংখ্যা, ভগ্নাংশ ও দশমিক" },
  { id: 1602, subject_id: 107, name: "লসাগু ও গসাগু" },
  { id: 1603, subject_id: 107, name: "শতকরা ও লাভ-ক্ষতি" },
  { id: 1604, subject_id: 107, name: "সুদ-আসল (সরল ও চক্রবৃদ্ধি)" },
  { id: 1605, subject_id: 107, name: "অনুপাত ও সমানুপাত" },
  { id: 1606, subject_id: 107, name: "বয়স ও কাজের সমস্যা" },
  { id: 1607, subject_id: 107, name: "সময়, গতি ও দূরত্ব" },
  { id: 1608, subject_id: 107, name: "বীজগণিত — সরল সমীকরণ" },
  { id: 1609, subject_id: 107, name: "বীজগণিত — বহুপদী ও উৎপাদক" },
  { id: 1610, subject_id: 107, name: "বীজগণিত — সূচক ও লগারিদম" },
  { id: 1611, subject_id: 107, name: "জ্যামিতি — রেখা, কোণ ও ত্রিভুজ" },
  { id: 1612, subject_id: 107, name: "জ্যামিতি — চতুর্ভুজ ও বৃত্ত" },
  { id: 1613, subject_id: 107, name: "পরিমিতি — ক্ষেত্রফল ও আয়তন" },
  { id: 1614, subject_id: 107, name: "পরিসংখ্যান ও গড়" },
  { id: 1615, subject_id: 107, name: "মানসিক দক্ষতা — সংখ্যা সিরিজ" },
  { id: 1616, subject_id: 107, name: "মানসিক দক্ষতা — সাদৃশ্য ও বিশ্লেষণ" },
  { id: 1617, subject_id: 107, name: "মানসিক দক্ষতা — লজিক্যাল রিজনিং" },
  {
    id: 1618,
    subject_id: 107,
    name: "মানসিক দক্ষতা — ডায়াগ্রাম ও ছবি বিশ্লেষণ",
  },

  // BCS: কম্পিউটার ও তথ্যপ্রযুক্তি (subject_id: 108)
  { id: 1701, subject_id: 108, name: "কম্পিউটারের ইতিহাস ও প্রজন্ম" },
  { id: 1702, subject_id: 108, name: "হার্ডওয়্যার ও সফটওয়্যার" },
  { id: 1703, subject_id: 108, name: "অপারেটিং সিস্টেম" },
  { id: 1704, subject_id: 108, name: "ইনপুট ও আউটপুট ডিভাইস" },
  { id: 1705, subject_id: 108, name: "মেমোরি ও স্টোরেজ" },
  { id: 1706, subject_id: 108, name: "নেটওয়ার্কিং ও ইন্টারনেট" },
  { id: 1707, subject_id: 108, name: "ই-মেইল ও যোগাযোগ প্রযুক্তি" },
  { id: 1708, subject_id: 108, name: "ডেটাবেজ ও ডেটা ম্যানেজমেন্ট" },
  { id: 1709, subject_id: 108, name: "সাইবার নিরাপত্তা" },
  { id: 1710, subject_id: 108, name: "মোবাইল প্রযুক্তি ও ক্লাউড কম্পিউটিং" },
  { id: 1711, subject_id: 108, name: "তথ্যপ্রযুক্তি আইন ও নীতিমালা" },
  { id: 1712, subject_id: 108, name: "ডিজিটাল বাংলাদেশ ও ই-গভর্ন্যান্স" },
  {
    id: 1713,
    subject_id: 108,
    name: "কৃত্রিম বুদ্ধিমত্তা ও রোবোটিক্স (বেসিক)",
  },
  { id: 1714, subject_id: 108, name: "বিনারি ও নম্বর সিস্টেম" },

  // BCS: নৈতিকতা, মূল্যবোধ ও সুশাসন (subject_id: 109)
  { id: 1801, subject_id: 109, name: "মূল্যবোধের ধারণা ও গুরুত্ব" },
  { id: 1802, subject_id: 109, name: "ব্যক্তিজীবনে নৈতিকতা" },
  { id: 1803, subject_id: 109, name: "সামাজিক নৈতিকতা ও দায়িত্ব" },
  { id: 1804, subject_id: 109, name: "সুশাসন — ধারণা ও বৈশিষ্ট্য" },
  { id: 1805, subject_id: 109, name: "জবাবদিহিতা ও স্বচ্ছতা" },
  { id: 1806, subject_id: 109, name: "দুর্নীতি ও প্রতিরোধ" },
  { id: 1807, subject_id: 109, name: "নাগরিক অধিকার ও কর্তব্য" },
  { id: 1808, subject_id: 109, name: "আইনের শাসন" },
  { id: 1809, subject_id: 109, name: "গণতন্ত্র ও সুশাসনের সম্পর্ক" },
  { id: 1810, subject_id: 109, name: "রাষ্ট্র পরিচালনায় মূল্যবোধ" },

  // NTRCA: বাংলা (subject_id: 201)
  { id: 2001, subject_id: 201, name: "ধ্বনি ও বর্ণ প্রকরণ" },
  { id: 2002, subject_id: 201, name: "শব্দ গঠন ও প্রকারভেদ" },
  { id: 2003, subject_id: 201, name: "সন্ধি বিচ্ছেদ" },
  { id: 2004, subject_id: 201, name: "সমাস" },
  { id: 2005, subject_id: 201, name: "কারক ও বিভক্তি" },
  { id: 2006, subject_id: 201, name: "ক্রিয়া ও ক্রিয়ার কাল" },
  { id: 2007, subject_id: 201, name: "প্রত্যয় ও উপসর্গ" },
  { id: 2008, subject_id: 201, name: "বাক্য গঠন ও শুদ্ধিকরণ" },
  { id: 2009, subject_id: 201, name: "বাগধারা ও প্রবাদ-প্রবচন" },
  { id: 2010, subject_id: 201, name: "সমার্থক ও বিপরীত শব্দ" },
  { id: 2011, subject_id: 201, name: "এককথায় প্রকাশ" },
  { id: 2012, subject_id: 201, name: "বানান শুদ্ধি" },
  { id: 2013, subject_id: 201, name: "বিরামচিহ্ন" },
  { id: 2014, subject_id: 201, name: "ব্যাকরণিক পরিভাষা" },
  { id: 2015, subject_id: 201, name: "প্রাচীন ও মধ্যযুগের সাহিত্য" },
  { id: 2016, subject_id: 201, name: "আধুনিক বাংলা সাহিত্য" },
  { id: 2017, subject_id: 201, name: "বিখ্যাত সাহিত্যিক ও তাঁদের রচনা" },

  // NTRCA: English (subject_id: 202)
  { id: 2101, subject_id: 202, name: "Parts of Speech" },
  { id: 2102, subject_id: 202, name: "Right Forms of Verb / Tense" },
  { id: 2103, subject_id: 202, name: "Voice (Active & Passive)" },
  { id: 2104, subject_id: 202, name: "Narration (Direct & Indirect)" },
  { id: 2105, subject_id: 202, name: "Transformation of Sentences" },
  { id: 2106, subject_id: 202, name: "Sentence Correction" },
  { id: 2107, subject_id: 202, name: "Fill in the Blanks" },
  { id: 2108, subject_id: 202, name: "Synonyms & Antonyms" },
  { id: 2109, subject_id: 202, name: "Spelling Correction" },
  { id: 2110, subject_id: 202, name: "Idioms & Phrases" },
  { id: 2111, subject_id: 202, name: "Translation (Bangla to English)" },
  { id: 2112, subject_id: 202, name: "Completing Sentences" },
  { id: 2113, subject_id: 202, name: "Change of Parts of Speech" },
  { id: 2114, subject_id: 202, name: "Articles & Prepositions" },

  // NTRCA: সাধারণ গণিত (subject_id: 203)
  { id: 2201, subject_id: 203, name: "সংখ্যা পদ্ধতি ও মৌলিক সংখ্যা" },
  { id: 2202, subject_id: 203, name: "লসাগু ও গসাগু" },
  { id: 2203, subject_id: 203, name: "ভগ্নাংশ ও দশমিক" },
  { id: 2204, subject_id: 203, name: "শতকরা" },
  { id: 2205, subject_id: 203, name: "অনুপাত ও সমানুপাত" },
  { id: 2206, subject_id: 203, name: "সুদকষা (সরল ও চক্রবৃদ্ধি)" },
  { id: 2207, subject_id: 203, name: "লাভ-ক্ষতি" },
  { id: 2208, subject_id: 203, name: "সময় ও কাজ" },
  { id: 2209, subject_id: 203, name: "সময়, গতি ও দূরত্ব" },
  { id: 2210, subject_id: 203, name: "বীজগণিতীয় সমীকরণ" },
  { id: 2211, subject_id: 203, name: "জ্যামিতি — ত্রিভুজ ও চতুর্ভুজ" },
  { id: 2212, subject_id: 203, name: "পরিমিতি — ক্ষেত্রফল ও আয়তন" },
  { id: 2213, subject_id: 203, name: "সংখ্যা সিরিজ" },

  // NTRCA: সাধারণ জ্ঞান (subject_id: 204)
  { id: 2301, subject_id: 204, name: "বাংলাদেশের ইতিহাস ও ঐতিহ্য" },
  { id: 2302, subject_id: 204, name: "মুক্তিযুদ্ধ ১৯৭১" },
  { id: 2303, subject_id: 204, name: "বাংলাদেশের সংবিধান ও সরকার" },
  { id: 2304, subject_id: 204, name: "বাংলাদেশের ভূগোল ও প্রাকৃতিক সম্পদ" },
  { id: 2305, subject_id: 204, name: "বাংলাদেশের অর্থনীতি" },
  { id: 2306, subject_id: 204, name: "আন্তর্জাতিক সংস্থা ও চুক্তি" },
  { id: 2307, subject_id: 204, name: "সাম্প্রতিক জাতীয় ঘটনা" },
  { id: 2308, subject_id: 204, name: "সাম্প্রতিক আন্তর্জাতিক ঘটনা" },
  { id: 2309, subject_id: 204, name: "বিজ্ঞান ও প্রযুক্তি" },
  { id: 2310, subject_id: 204, name: "পরিবেশ ও জলবায়ু" },
  { id: 2311, subject_id: 204, name: "খেলাধুলা ও সংস্কৃতি" },
  { id: 2312, subject_id: 204, name: "বিখ্যাত ব্যক্তিত্ব" },
  { id: 2313, subject_id: 204, name: "জাতীয় পুরস্কার ও দিবস" },

  // Primary: বাংলা (subject_id: 301)
  { id: 3001, subject_id: 301, name: "ধ্বনি ও বর্ণমালা" },
  { id: 3002, subject_id: 301, name: "শব্দ ও পদ-প্রকরণ" },
  { id: 3003, subject_id: 301, name: "সন্ধি বিচ্ছেদ" },
  { id: 3004, subject_id: 301, name: "সমাস" },
  { id: 3005, subject_id: 301, name: "কারক ও বিভক্তি" },
  { id: 3006, subject_id: 301, name: "প্রত্যয় ও উপসর্গ" },
  { id: 3007, subject_id: 301, name: "বাক্য গঠন ও শুদ্ধিকরণ" },
  { id: 3008, subject_id: 301, name: "বানান শুদ্ধি" },
  { id: 3009, subject_id: 301, name: "বিরামচিহ্ন" },
  { id: 3010, subject_id: 301, name: "বাগধারা ও প্রবাদ-প্রবচন" },
  { id: 3011, subject_id: 301, name: "সমার্থক ও বিপরীত শব্দ" },
  { id: 3012, subject_id: 301, name: "এককথায় প্রকাশ" },
  { id: 3013, subject_id: 301, name: "সাহিত্য — বিখ্যাত কবি-সাহিত্যিক" },
  { id: 3014, subject_id: 301, name: "সাহিত্য — বিখ্যাত কাব্য ও উপন্যাস" },
  { id: 3015, subject_id: 301, name: "প্রাথমিক পাঠ্যক্রম — বাংলা অংশ" },

  // Primary: English (subject_id: 302)
  { id: 3101, subject_id: 302, name: "Parts of Speech" },
  { id: 3102, subject_id: 302, name: "Tense & Verb Forms" },
  { id: 3103, subject_id: 302, name: "Voice (Active & Passive)" },
  { id: 3104, subject_id: 302, name: "Narration (Direct & Indirect)" },
  { id: 3105, subject_id: 302, name: "Sentence Correction & Transformation" },
  { id: 3106, subject_id: 302, name: "Fill in the Blanks" },
  { id: 3107, subject_id: 302, name: "Synonyms & Antonyms" },
  { id: 3108, subject_id: 302, name: "Spelling Correction" },
  { id: 3109, subject_id: 302, name: "Idioms & Phrases" },
  { id: 3110, subject_id: 302, name: "Articles & Prepositions" },
  { id: 3111, subject_id: 302, name: "Translation (Bangla to English)" },
  { id: 3112, subject_id: 302, name: "Reading Comprehension" },
  { id: 3113, subject_id: 302, name: "Primary Curriculum — English" },

  // Primary: গণিত (subject_id: 303)
  { id: 3201, subject_id: 303, name: "সংখ্যা পদ্ধতি" },
  { id: 3202, subject_id: 303, name: "লসাগু ও গসাগু" },
  { id: 3203, subject_id: 303, name: "ভগ্নাংশ ও দশমিক" },
  { id: 3204, subject_id: 303, name: "শতকরা" },
  { id: 3205, subject_id: 303, name: "অনুপাত ও সমানুপাত" },
  { id: 3206, subject_id: 303, name: "সুদকষা (সরল ও চক্রবৃদ্ধি)" },
  { id: 3207, subject_id: 303, name: "লাভ-ক্ষতি" },
  { id: 3208, subject_id: 303, name: "সময়, কাজ ও গতি" },
  { id: 3209, subject_id: 303, name: "জ্যামিতি — ক্ষেত্রফল ও পরিসীমা" },
  { id: 3210, subject_id: 303, name: "পরিমাপ ও একক রূপান্তর" },
  { id: 3211, subject_id: 303, name: "সংখ্যা সিরিজ ও মানসিক গণিত" },

  // Primary: সাধারণ জ্ঞান ও বিজ্ঞান (subject_id: 304)
  { id: 3301, subject_id: 304, name: "বাংলাদেশের ইতিহাস" },
  { id: 3302, subject_id: 304, name: "মুক্তিযুদ্ধ ১৯৭১" },
  { id: 3303, subject_id: 304, name: "বঙ্গবন্ধু শেখ মুজিবুর রহমান" },
  { id: 3304, subject_id: 304, name: "ভাষা আন্দোলন ১৯৫২" },
  { id: 3305, subject_id: 304, name: "বাংলাদেশের সংবিধান ও সরকার" },
  { id: 3306, subject_id: 304, name: "বাংলাদেশের ভূগোল" },
  { id: 3307, subject_id: 304, name: "বাংলাদেশের অর্থনীতি ও কৃষি" },
  { id: 3308, subject_id: 304, name: "আন্তর্জাতিক বিষয়াবলি" },
  { id: 3309, subject_id: 304, name: "সাম্প্রতিক জাতীয় ও আন্তর্জাতিক ঘটনা" },
  { id: 3310, subject_id: 304, name: "জাতীয় দিবস ও পুরস্কার" },
  { id: 3311, subject_id: 304, name: "সাধারণ বিজ্ঞান — পদার্থ ও রসায়ন" },
  { id: 3312, subject_id: 304, name: "সাধারণ বিজ্ঞান — জীববিজ্ঞান ও মানবদেহ" },
  { id: 3313, subject_id: 304, name: "পরিবেশ ও জলবায়ু" },
  { id: 3314, subject_id: 304, name: "তথ্যপ্রযুক্তি ও কম্পিউটার" },
  { id: 3315, subject_id: 304, name: "স্বাস্থ্য ও পরিচ্ছন্নতা" },
  { id: 3316, subject_id: 304, name: "প্রাথমিক শিক্ষা সংক্রান্ত আইন ও নীতি" },
];

/** Helper: get subjects filtered by exam name */
export function getSubjectsByExamName(examName: string): SubjectOption[] {
  const exam = exams.find((e) => e.name === examName);
  if (!exam) return [];
  return subjects.filter((s) => s.exam_id === exam.id);
}

/** Helper: get topics filtered by subject name */
export function getTopicsBySubjectName(subjectName: string): TopicOption[] {
  const subject = subjects.find((s) => s.name === subjectName);
  if (!subject) return [];
  return topics.filter((t) => t.subject_id === subject.id);
}
