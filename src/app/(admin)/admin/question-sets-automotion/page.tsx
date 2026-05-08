"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { QuestionSet } from "@/features/question-sets";
import { routineService } from "@/features/routines";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useEffect, useState } from "react";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ManageQuestionSetAutoMotion() {
  const [createdSets, setCreatedSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Auto-check on mount
  useEffect(() => {
    const checkAndCreate = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const sets = await routineService.autoCreateQuestionSetsForDate();
        setCreatedSets(sets);
        if (sets.length > 0) {
          setMessage(`✓ ${sets.length}টি প্রশ্ন সেট সফলভাবে তৈরি করা হয়েছে`);
        } else {
          setMessage("আজকের জন্য কোনো নতুন প্রশ্ন সেট তৈরি করার প্রয়োজন নেই");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(`প্রশ্ন সেট তৈরিতে সমস্যা হয়েছে: ${msg}`);
      } finally {
        setLoading(false);
      }
    };

    checkAndCreate();
  }, []);

  const handleManualCreate = async () => {
    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      const sets = await routineService.autoCreateQuestionSetsForDate();
      setCreatedSets(sets);
      if (sets.length > 0) {
        setMessage(`✓ ${sets.length}টি প্রশ্ন সেট সফলভাবে তৈরি করা হয়েছে`);
      } else {
        setMessage("আজকের জন্য কোনো নতুন প্রশ্ন সেট তৈরি করার প্রয়োজন নেই");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`প্রশ্ন সেট তৈরিতে সমস্যা হয়েছে: ${msg}`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">প্রশ্ন সেট স্বয়ংক্রিয় তৈরি</h1>
        <p className="text-gray-600 mt-2">
          আজকের রুটিন থেকে স্বয়ংক্রিয়ভাবে প্রশ্ন সেট তৈরি করুন
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              স্ট্যাটাস
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                <span className="text-lg font-semibold">চেক করা হচ্ছে...</span>
              </div>
            ) : createdSets.length > 0 ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-lg font-semibold text-green-600">
                  সম্পূর্ণ
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-blue-600">
                  কোনো সেট নেই
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              তৈরি প্রশ্ন সেট
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{createdSets.length}</div>
            <p className="text-sm text-gray-500">আজকের জন্য</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              তারিখ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {formatDate(new Date().toISOString())}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Action Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleManualCreate}
          disabled={checking}
          className="gap-2"
        >
          {checking && <Loader className="w-4 h-4 animate-spin" />}
          প্রশ্ন সেট স্বয়ংক্রিয় তৈরি করুন
        </Button>
      </div>

      {/* Results Table */}
      {createdSets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>তৈরি প্রশ্ন সেট</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>শিরোনাম</TableHead>
                    <TableHead>বিষয়</TableHead>
                    <TableHead>মোট নম্বর</TableHead>
                    <TableHead>সময় (মিনিট)</TableHead>
                    <TableHead>অবস্থা</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {createdSets.map((set) => (
                    <TableRow key={set.id}>
                      <TableCell className="font-medium">{set.title}</TableCell>
                      <TableCell>{set.subject}</TableCell>
                      <TableCell>{set.totalMarks}</TableCell>
                      <TableCell>{set.duration}</TableCell>
                      <TableCell>
                        <Badge variant={set.isActive ? "default" : "secondary"}>
                          {set.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && createdSets.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-lg">
                আজকের জন্য কোনো প্রশ্ন সেট তৈরি হয়নি
              </p>
              <p className="text-gray-500 text-sm mt-2">
                রুটিন ডেটা উপলব্ধ না থাকলে প্রশ্ন সেট তৈরি হয় না
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">কীভাবে কাজ করে:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
              <li>এই পৃষ্ঠা খোলার সময় স্বয়ংক্রিয়ভাবে চেক হয়</li>
              <li>আজকের তারিখের সাথে মিলে এমন সব রুটিন খুঁজে বের করা হয়</li>
              <li>প্রতিটি রুটিন থেকে একটি নতুন প্রশ্ন সেট তৈরি হয়</li>
              <li>
                নতুন প্রশ্ন সেট নিষ্ক্রিয় অবস্থায় তৈরি হয় (পরে সক্রিয় করতে
                হবে)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
