import { composeCleanLesson } from "@/lib/visualearn-lessons";

type LearnPageProps = {
  searchParams: Promise<{
    topic?: string;
  }>;
};

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const params = await searchParams;
  const lesson = composeCleanLesson(params.topic ?? "");

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

      <section className="result-hero" aria-labelledby="result-title">
        <div>
          <p className="result-eyebrow">{lesson.subject}</p>
          <h1 id="result-title">{lesson.topic}</h1>
          <p>{lesson.summary}</p>
        </div>
        <div className="result-visual" aria-label={`${lesson.topic} visual model`}>
          <span className="result-ring result-ring-a" />
          <span className="result-ring result-ring-b" />
          <strong>{lesson.subject}</strong>
        </div>
      </section>

      <section className="answer-grid" aria-label="Generated learning answer">
        <article className="answer-card answer-primary">
          <span>Short answer</span>
          <p>{lesson.plainAnswer}</p>
        </article>
        <article className="answer-card">
          <span>Key idea</span>
          <p>{lesson.keyIdea}</p>
        </article>
        <article className="answer-card">
          <span>Visual model</span>
          <p>{lesson.visualModel}</p>
        </article>
      </section>

      <section className="result-section" aria-labelledby="steps-title">
        <div className="result-section-heading">
          <p className="result-eyebrow">Learn it</p>
          <h2 id="steps-title">Three steps</h2>
        </div>
        <div className="result-steps">
          {lesson.steps.map((step, index) => (
            <article key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="result-practice" aria-label="Practice prompt">
        <div>
          <p className="result-eyebrow">Practice</p>
          <h2>Try this</h2>
          <p>{lesson.tryThis}</p>
        </div>
        <a href={`/learn?topic=${encodeURIComponent(`${lesson.topic} practice`)}`}>Generate practice</a>
      </section>

      <section className="next-questions" aria-label="Follow-up questions">
        <p className="result-eyebrow">Next questions</p>
        <div>
          {lesson.nextQuestions.map((question) => (
            <a href={`/learn?topic=${encodeURIComponent(question)}`} key={question}>
              {question}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
