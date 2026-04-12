import { questionService } from "@/features/questions";
import { QuestionList } from "@/features/questions/components/question-list";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  const questions = await questionService.getAll();
  const unansweredCount = questions.filter((q) => !q.answered).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Questions</h1>
        <p className="text-sm text-muted-foreground">
          {unansweredCount} unanswered across all courses
        </p>
      </div>
      <QuestionList questions={questions} />
    </div>
  );
}
