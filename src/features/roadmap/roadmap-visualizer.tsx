"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getCompletedTopics,
  getCurrentTopicIndex,
  getTotalTopics,
  type JobRole,
  type RoadmapSubject,
} from "@/features/roadmap/roadmap-data";
import {
  CheckCircle,
  Circle,
  Flag,
  Footprints,
  Lock,
  MapPin,
  Trophy,
} from "lucide-react";

interface RoadmapVisualizerProps {
  role: JobRole;
}

export function RoadmapVisualizer({ role }: RoadmapVisualizerProps) {
  const totalTopics = getTotalTopics(role);
  const completedTopics = getCompletedTopics(role);
  const progressPercent = Math.round((completedTopics / totalTopics) * 100);
  const remainingTopics = totalTopics - completedTopics;
  const currentPosition = getCurrentTopicIndex(role);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="sticky top-0 z-10 rounded-xl border bg-card/95 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Footprints className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{role.titleBn}</h2>
              <p className="text-xs text-muted-foreground">
                {completedTopics}/{totalTopics} টপিক সম্পন্ন
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-primary">
                {progressPercent}%
              </div>
              <div className="text-xs text-muted-foreground">
                বাকি {remainingTopics} টপিক
              </div>
            </div>
            <div className="hidden sm:block">
              <Badge
                variant={progressPercent === 100 ? "default" : "secondary"}
                className="gap-1"
              >
                {progressPercent === 100 ? (
                  <Trophy className="size-3" />
                ) : (
                  <MapPin className="size-3" />
                )}
                {progressPercent === 100 ? "সম্পন্ন!" : "চলছে..."}
              </Badge>
            </div>
          </div>
        </div>
        <Progress value={progressPercent} className="mt-3 h-2.5" />
      </div>

      {/* Visual Road */}
      <div className="relative">
        {role.subjects.map((subject, subjectIndex) => (
          <SubjectRoadSection
            key={subject.id}
            subject={subject}
            subjectIndex={subjectIndex}
            currentPosition={currentPosition}
            isLast={subjectIndex === role.subjects.length - 1}
          />
        ))}

        {/* Finish Line */}
        <div className="flex justify-center pb-8 pt-4">
          <div className="flex items-center gap-2 rounded-full border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-3">
            <Flag className="size-5 text-primary" />
            <span className="text-sm font-semibold text-primary">
              🎉 গন্তব্য — {role.titleBn} প্রস্তুতি সম্পন্ন!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SubjectRoadSectionProps {
  subject: RoadmapSubject;
  subjectIndex: number;
  currentPosition: { subjectIndex: number; topicIndex: number } | null;
  isLast: boolean;
}

function SubjectRoadSection({
  subject,
  subjectIndex,
  currentPosition,
  isLast,
}: SubjectRoadSectionProps) {
  const completedCount = subject.topics.filter((t) => t.completed).length;
  const allCompleted = completedCount === subject.topics.length;

  return (
    <div className="relative mb-2">
      {/* Subject Header Milestone */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 font-bold ${
            allCompleted
              ? "border-green-500 bg-green-50 text-green-600"
              : "border-primary bg-primary/10 text-primary"
          }`}
        >
          {subject.serial}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{subject.title}</h3>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{subject.topics.length} টপিক সম্পন্ন
          </p>
        </div>
        <Badge
          variant={allCompleted ? "default" : "outline"}
          className={allCompleted ? "bg-green-600" : ""}
        >
          {allCompleted ? "✓ সম্পন্ন" : `${subject.topics.length} টপিক`}
        </Badge>
      </div>

      {/* Topic Road - Winding Path */}
      <div className="relative ml-5 border-l-2 border-dashed border-muted-foreground/20 pb-6 pl-8">
        {subject.topics.map((topic, topicIndex) => {
          const isCurrent =
            currentPosition?.subjectIndex === subjectIndex &&
            currentPosition?.topicIndex === topicIndex;
          const isCompleted = topic.completed;

          return (
            <div
              key={topic.id}
              className={`group relative mb-4 last:mb-0 ${
                isCurrent ? "scale-[1.02]" : ""
              }`}
            >
              {/* Road node connector */}
              <div
                className={`absolute -left-[2.35rem] top-3 size-4 rounded-full border-2 ${
                  isCompleted
                    ? "border-green-500 bg-green-500"
                    : isCurrent
                      ? "animate-pulse border-primary bg-primary"
                      : "border-muted-foreground/30 bg-background"
                }`}
              />

              {/* Topic Card */}
              <div
                className={`rounded-lg border p-3 transition-all ${
                  isCompleted
                    ? "border-green-200 bg-green-50/50"
                    : isCurrent
                      ? "border-primary/50 bg-primary/5 shadow-md ring-2 ring-primary/20"
                      : "border-border bg-card opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div className="shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="size-5 text-green-500" />
                    ) : isCurrent ? (
                      <div className="relative">
                        <Circle className="size-5 text-primary" />
                        <Footprints className="absolute -right-1 -top-1 size-3 text-primary" />
                      </div>
                    ) : (
                      <Lock className="size-4 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Topic Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${
                          isCompleted
                            ? "text-green-600"
                            : isCurrent
                              ? "text-primary"
                              : "text-muted-foreground"
                        }`}
                      >
                        #{topic.serial}
                      </span>
                      <span
                        className={`truncate text-sm font-medium ${
                          isCompleted
                            ? "text-green-700"
                            : isCurrent
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {topic.title}
                      </span>
                    </div>
                    {isCurrent && (
                      <p className="mt-1 text-xs text-primary">
                        📍 আপনি এখানে আছেন — এই টপিক অনুশীলন করুন
                      </p>
                    )}
                  </div>

                  {/* Action hint */}
                  {isCurrent && (
                    <Badge variant="default" className="shrink-0 text-xs">
                      অনুশীলন করুন
                    </Badge>
                  )}
                  {isCompleted && (
                    <span className="shrink-0 text-xs text-green-600">✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connector to next subject */}
      {!isLast && (
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>⬇️</span>
            <span>পরবর্তী বিষয়</span>
          </div>
        </div>
      )}
    </div>
  );
}
