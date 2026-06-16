import { LessonExperience } from "@/components/lesson-experience";
import { composeCleanLesson } from "@/lib/visualearn-lessons";

type LearnPageProps = {
  searchParams: Promise<{
    topic?: string;
  }>;
};

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const params = await searchParams;
  const lesson = await composeCleanLesson(params.topic ?? "");

  return (
    <main className="result-shell">
      <nav className="result-nav" aria-label="Result navigation">
        <a href="/app" className="result-brand">
          Visualearn
        </a>
        <form className="result-search" action="/learn">
          <label htmlFor="result-topic">Search another topic</label>
          <input id="result-topic" name="topic" type="search" defaultValue={lesson.topic} />
          <button type="submit">Ask</button>
        </form>
      </nav>

      <LessonExperience lesson={lesson} />
    </main>
  );
}
