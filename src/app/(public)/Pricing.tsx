"use client";

import { AnimateIn } from "@/components/ui/animate-in";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { subscriptionService } from "@/features/subscriptions";
import type { PackageDto } from "@/features/subscriptions/types";
import { CheckCircle2, Infinity as InfinityIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Pricing() {
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await subscriptionService.getAdminPackages();
      setPackages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="scroll-mt-16 border-b bg-muted/40"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <AnimateIn variant="fade-up" duration={500}>
          <div className="mx-auto max-w-xl text-center">
            <h2
              id="pricing-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              একটি মেম্বারশিপ, সব সুবিধা অন্তর্ভুক্ত
            </h2>
            <p className="mt-2 text-muted-foreground">
              আপনার সময়ের সাথে মানানসই প্যাকেজ বেছে নিন। লুকানো কোনো খরচ নেই।
            </p>
          </div>
        </AnimateIn>

        <div className="mt-10">
          {loading ? (
            <div className="mx-auto max-w-md rounded-xl border bg-card p-4">
              <TableSkeleton rows={4} />
            </div>
          ) : packages.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-card py-12 text-center text-muted-foreground">
              এই মুহূর্তে কোনো প্যাকেজ নেই। শীঘ্রই নতুন প্যাকেজ আসছে।
            </p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <li key={pkg.id}>
                  <article className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                    <h3 className="text-base font-semibold">{pkg.name}</h3>

                    <p className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-4xl font-bold tracking-tight">
                        ৳{pkg.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {pkg.durationDays} দিন
                      </span>
                    </p>

                    <p className="mt-2 min-h-6 text-sm font-medium text-primary">
                      {pkg.discount ? `ছাড়: ৳${pkg.discount}` : null}
                    </p>

                    <ul className="mt-5 space-y-2.5 border-t pt-5 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span>মেয়াদ: {pkg.durationDays} দিন</span>
                      </li>
                      {pkg.liveQuota || pkg.archiveQuota ? (
                        <>
                          <li className="flex items-start gap-2">
                            <CheckCircle2
                              className="mt-0.5 size-4 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                            <span className="inline-flex items-center gap-1">
                              লাইভ পরীক্ষা: {pkg.liveQuota ?? <InfinityIcon className="size-4" aria-label="সীমাহীন" />}
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2
                              className="mt-0.5 size-4 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                            <span className="inline-flex items-center gap-1">
                              আর্কাইভ পরীক্ষা: {pkg.archiveQuota ?? <InfinityIcon className="size-4" aria-label="সীমাহীন" />}
                            </span>
                          </li>
                        </>
                      ) : (
                        <li className="flex items-start gap-2">
                          <CheckCircle2
                            className="mt-0.5 size-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span>সীমাহীন পরীক্ষা</span>
                        </li>
                      )}
                    </ul>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">
          bKash বা Nagad-এ পেমেন্ট করা যায়। Mobile দিয়ে সাইন ইন করে শুরু করুন,
          তারপর অ্যাডমিনের সাথে যোগাযোগ করলেই অ্যাক্সেস চালু হবে।
        </p>
      </div>
    </section>
  );
}