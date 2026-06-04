import { LandingHeader } from "@/components/landing-header";
import { JOB_ROLES } from "@/features/roadmap/roadmap-data";
import { RoadmapVisualizer } from "@/features/roadmap/roadmap-visualizer";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ roleSlug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { roleSlug } = await params;
  const role = JOB_ROLES.find((r) => r.slug === roleSlug);
  if (!role) return { title: "রোডম্যাপ পাওয়া যায়নি" };
  return {
    title: `${role.titleBn} রোডম্যাপ`,
    description: `${role.titleBn} পদের জন্য সম্পূর্ণ প্রস্তুতির রোডম্যাপ দেখুন।`,
  };
}

export function generateStaticParams() {
  return JOB_ROLES.map((role) => ({ roleSlug: role.slug }));
}

export default async function RoadmapRolePage({ params }: PageProps) {
  const { roleSlug } = await params;
  const role = JOB_ROLES.find((r) => r.slug === roleSlug);

  if (!role) {
    notFound();
  }

  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20 px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-3xl">
          {/* Back navigation */}
          <Link
            href="/roadmap"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            সব রোডম্যাপ দেখুন
          </Link>

          {/* Roadmap Visualizer */}
          <RoadmapVisualizer role={role} />
        </div>
      </main>
    </>
  );
}
