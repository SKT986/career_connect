import { MockInterviewFlow } from "@/components/mock-interview/mock-interview-flow";

export default function MockInterviewPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Mock Interview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Practice with AI-generated questions, scored instantly with specific feedback.
        </p>
      </div>
      <MockInterviewFlow />
    </div>
  );
}
