"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  exams,
  getSubjectsByExamName,
  getTopicsBySubjectName,
  type SubjectOption,
} from "@/lib/data/exam-subject-topics";
import { memo, useMemo } from "react";

const NONE = "__none__";

export interface ExamSubjectTopicValues {
  examName: string;
  subject: string;
  topic: string;
}

type ExamSelectProps = {
  examName: string;
  onExamChange: (examName: string) => void;
  triggerClassName?: string;
  placeholder?: string;
};

/** Shared exam dropdown UI (toolbar + per-row use the same options). */
const ExamSelect = memo(function ExamSelect({
  examName,
  onExamChange,
  triggerClassName = "h-8 text-xs",
  placeholder = "পরীক্ষা",
}: ExamSelectProps) {
  const value = examName || NONE;
  return (
    <Select
      value={value}
      onValueChange={(v) => onExamChange(v === NONE ? "" : v)}
    >
      <SelectTrigger className={triggerClassName} aria-label="পরীক্ষা">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value={NONE}>— পরীক্ষা —</SelectItem>
        {exams.map((e) => (
          <SelectItem key={e.id} value={e.name}>
            {e.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

/** Toolbar: one exam for the whole question set. */
export const SharedExamSelect = memo(function SharedExamSelect({
  examName,
  onExamChange,
}: {
  examName: string;
  onExamChange: (examName: string) => void;
}) {
  return (
    <ExamSelect
      examName={examName}
      onExamChange={onExamChange}
      triggerClassName="h-9 min-w-[14rem] text-sm"
      placeholder="পরীক্ষা নির্বাচন করুন"
    />
  );
});

export const SubjectTopicSelects = memo(function SubjectTopicSelects({
  subject,
  topic,
  subjectOptions,
  onChange,
}: {
  subject: string;
  topic: string;
  subjectOptions: SubjectOption[];
  onChange: (patch: { subject?: string; topic?: string }) => void;
}) {
  const topicOptions = useMemo(
    () => (subject ? getTopicsBySubjectName(subject) : []),
    [subject],
  );

  const subjectInList =
    !subject || subjectOptions.some((s) => s.name === subject);
  const topicInList =
    !topic || topicOptions.some((t) => t.name === topic);

  const subjectValue = subject || NONE;
  const topicValue = topic || NONE;

  return (
    <>
      <Select
        value={subjectValue}
        onValueChange={(v) => {
          const nextSubject = v === NONE ? "" : v;
          onChange({ subject: nextSubject, topic: "" });
        }}
        disabled={subjectOptions.length === 0}
      >
        <SelectTrigger className="h-8 text-xs" aria-label="বিষয়">
          <SelectValue placeholder="বিষয়" />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-60">
          <SelectItem value={NONE}>— বিষয় —</SelectItem>
          {subject && !subjectInList && (
            <SelectItem value={subject}>{subject} (বর্তমান)</SelectItem>
          )}
          {subjectOptions.map((s) => (
            <SelectItem key={s.id} value={s.name}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={topicValue}
        onValueChange={(v) => onChange({ topic: v === NONE ? "" : v })}
        disabled={!subject}
      >
        <SelectTrigger className="h-8 text-xs" aria-label="টপিক">
          <SelectValue placeholder="টপিক" />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-60">
          <SelectItem value={NONE}>— টপিক —</SelectItem>
          {topic && !topicInList && (
            <SelectItem value={topic}>{topic} (বর্তমান)</SelectItem>
          )}
          {topicOptions.map((t) => (
            <SelectItem key={t.id} value={t.name}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
});

/**
 * Per-row: exam (syncs all rows via onExamChange) + subject + topic.
 * `examName` always comes from page-level shared state.
 */
export const RowClassificationSelects = memo(function RowClassificationSelects({
  examName,
  subject,
  topic,
  subjectOptions,
  onExamChange,
  onSubjectTopicChange,
}: {
  examName: string;
  subject: string;
  topic: string;
  subjectOptions: SubjectOption[];
  /** Changing exam on any row updates every row (parent handler). */
  onExamChange: (examName: string) => void;
  onSubjectTopicChange: (patch: {
    subject?: string;
    topic?: string;
  }) => void;
}) {
  return (
    <div className="flex min-w-[11rem] flex-col gap-1">
      <ExamSelect examName={examName} onExamChange={onExamChange} />
      <SubjectTopicSelects
        subject={subject}
        topic={topic}
        subjectOptions={subjectOptions}
        onChange={onSubjectTopicChange}
      />
    </div>
  );
});
