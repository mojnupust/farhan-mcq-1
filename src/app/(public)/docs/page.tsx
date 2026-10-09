import { DOCX_FAQ_ITEMS, DocxFaq } from "@/features/docs/components/docx-faq";
import { DocxGenerator } from "@/features/docs/components/docx-generator";
import { Download, PenLine, Printer } from "lucide-react";

const SITE = "https://farhanmcq.com";

function DocsJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${SITE}/docs`,
        name: "ফ্রি Docx মেকার | Farhan MCQ",
        applicationCategory: "EducationApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
        description:
          "BCS, প্রাইমারি, NTRCA ও ব্যাংক জবের প্রশ্ন থেকে নিজের ব্র্যান্ডে প্রিন্ট-রেডি Word (.docx) ফাইল ফ্রিতে তৈরি করুন।",
        url: `${SITE}/docs`,
        inLanguage: "bn",
        isPartOf: {
          "@type": "WebSite",
          name: "Farhan MCQ",
          url: SITE,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: DOCX_FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "হোম", item: SITE },
          {
            "@type": "ListItem",
            position: 2,
            name: "Docx মেকার",
            item: `${SITE}/docs`,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function PublicDocsPage() {
  return (
    <>
      <DocsJsonLd />

      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            ফ্রি Docx মেকার — নিজের ব্র্যান্ডে প্রশ্নপত্র তৈরি করুন
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground">
            BCS, প্রাইমারি, NTRCA ও ব্যাংক জবের বিগত সালের প্রশ্ন থেকে কয়েক
            ক্লিকে প্রিন্ট-রেডি Word (.docx) ফাইল তৈরি করুন। নিজের নামে{" "}
            <strong className="text-foreground">প্রিন্ট করুন</strong> অথবা{" "}
            <strong className="text-foreground">বিক্রি করুন</strong> —
            সম্পূর্ণ ফ্রি।
          </p>

          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            <li className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PenLine className="size-5" />
              </span>
              <p className="text-sm font-medium">১. প্রশ্নসেট বেছে নিন</p>
              <p className="text-xs text-muted-foreground">
                পরীক্ষা, সাব-ক্যাটাগরি ও প্রশ্নসেট নির্বাচন করুন
              </p>
            </li>
            <li className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Download className="size-5" />
              </span>
              <p className="text-sm font-medium">২. ডিজাইন কাস্টমাইজ করুন</p>
              <p className="text-xs text-muted-foreground">
                ব্র্যান্ড নাম, টেমপ্লেট ও কলাম সাজিয়ে Docx তৈরি করুন
              </p>
            </li>
            <li className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Printer className="size-5" />
              </span>
              <p className="text-sm font-medium">৩. প্রিন্ট করুন বা বিক্রি করুন</p>
              <p className="text-xs text-muted-foreground">
                ডাউনলোড করা ফাইলটি নিজের ব্যবসায় ব্যবহার করুন
              </p>
            </li>
          </ol>
        </div>
      </div>

      <DocxGenerator
        previewBasePath="/docs/preview"
        showDonationBanner
        maxWidthClassName="max-w-5xl"
      />

      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">
          সচরাচর জিজ্ঞাসা
        </h2>
        <DocxFaq />
      </div>
    </>
  );
}
