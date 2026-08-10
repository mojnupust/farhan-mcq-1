export type BroadcastPostType =
  | "motivational"
  | "study-tip"
  | "notice"
  | "offer"
  | "custom"
  | "job-notice";

interface BuildPromptInput {
  postType: BroadcastPostType;
  context?: string;
  extraInstructions?: string;
}

export function buildBroadcastPostPrompt({
  postType,
  context,
  extraInstructions,
}: BuildPromptInput): string {
  const contextBlock = context?.trim()
    ? `\n\nঅতিরিক্ত প্রসঙ্গ (এটাকে পোস্টে প্রাসঙ্গিকভাবে ব্যবহার করো):\n${context.trim()}`
    : "";

  const extra = extraInstructions?.trim()
    ? `\n\nঅ্যাডমিনের নির্দেশনা:\n${extraInstructions.trim()}`
    : "";

  const commonRules = `
- বাংলায় লিখো (প্রযোজ্য হলে ইংরেজি পরিভাষা/হ্যাশট্যাগ মিশ্রিত থাকতে পারে)
- রোবোটিক টোন নয় — একজন সিনিয়র বন্ধু/মেন্টরের সুর
- কোনো markdown, asterisk (*), বা code fence ব্যবহার করবে না
- শেষে ২–৪টি প্রাসঙ্গিক হ্যাশট্যাগ (#FarhanMCQ সহ)
- শুধু পোস্টের টেক্সট দাও, অন্য কিছু না${contextBlock}${extra}`;

  const prompts: Record<BroadcastPostType, string> = {
    motivational: `তুমি Farhan MCQ প্ল্যাটফর্মের জন্য BCS, NTRCA, Primary, Bank পরীক্ষার্থীদের উদ্দেশ্যে একটি অনুপ্রেরণামূলক Facebook/Telegram পোস্ট লিখো।
২–৫ লাইন, আন্তরিক, বাস্তব.${commonRules}`,

    "study-tip": `তুমি Farhan MCQ প্ল্যাটফর্মের জন্য প্রতিযোগিতামূলক পরীক্ষার্থীদের একটি কার্যকর পড়াশোনার টিপস পোস্ট লিখো।
১টি নির্দিষ্ট টিপস, ৩–৬ লাইন, সহজ ভাষা.${commonRules}`,

    notice: `তুমি Farhan MCQ প্ল্যাটফর্মের অ্যাডমিন হিসেবে শিক্ষার্থীদের জন্য একটি সরকারি/নোটিশ স্টাইলের ঘোষণা লিখো।
স্পষ্ট শিরোনাম বোধ (প্রথম লাইনে), তারিখ/ডেডলাইন থাকলে উল্লেখ, সংক্ষিপ্ত কিন্তু সম্পূর্ণ তথ্য.${commonRules}`,

    offer: `তুমি Farhan MCQ প্ল্যাটফর্মের একটি প্রচার/অফার পোস্ট লিখো (কোর্স, সাবস্ক্রিপশন, বা বিশেষ সুবিধা)।
উত্তেজনাপূর্ণ কিন্তু বিশ্বাসযোগ্য — অতিরঞ্জিত ক্লেইম নয়.${commonRules}`,

    custom: `তুমি Farhan MCQ প্ল্যাটফর্মের সোশ্যাল মিডিয়ায় পোস্ট করার জন্য অ্যাডমিন-নির্দেশিত কনটেন্ট লিখো।${commonRules}`,

    "job-notice": `তুমি Farhan MCQ প্ল্যাটফর্মের জন্য একটি চাকরির বিজ্ঞপ্তি পোস্ট লিখো (BCS/Bank/Primary/NTRCA অডিয়েন্স)।
প্রতিষ্ঠান, পদ, আবেদনের শেষ তারিখ, আবেদন লিংক স্পষ্টভাবে থাকবে। প্রথম লাইনে আকর্ষণীয় শিরোনাম।${commonRules}`,
  };

  return prompts[postType];
}
