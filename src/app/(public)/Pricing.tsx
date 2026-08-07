"use client";

import { AnimateIn } from "@/components/ui/animate-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { subscriptionService } from "@/features/subscriptions";
import type { PackageDto } from "@/features/subscriptions/types";
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
    <section className="border-b bg-muted/40">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <AnimateIn variant="scale-up" duration={600}>
          <div className="mx-auto max-w-md text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              সহজ ও সাশ্রয়ী মূল্য
            </h2>
            <p className="mt-2 text-muted-foreground">
              একটি মেম্বারশিপ — সব কিছু অন্তর্ভুক্ত।
            </p>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">সকল প্যাকেজ</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TableSkeleton rows={4} />
                ) : packages.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    কোনো প্যাকেজ নেই
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>নাম</TableHead>
                        <TableHead>মেয়াদ</TableHead>
                        <TableHead>মূল্য</TableHead>
                        <TableHead>ছাড়</TableHead>
                        <TableHead>কোটা</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.map((pkg) => (
                        <TableRow key={pkg.id}>
                          <TableCell className="font-medium">
                            {pkg.name}
                          </TableCell>
                          <TableCell>{pkg.durationDays} দিন</TableCell>
                          <TableCell>৳{pkg.price}</TableCell>
                          <TableCell>৳{pkg.discount}</TableCell>
                          <TableCell>
                            {pkg.liveQuota || pkg.archiveQuota ? (
                              <span className="text-xs">
                                L:{pkg.liveQuota ?? "∞"} A:
                                {pkg.archiveQuota ?? "∞"}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                সীমাহীন
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
