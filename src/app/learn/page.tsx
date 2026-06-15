import { composeCleanLesson } from "@/lib/visualearn-lessons";

type LearnPageProps = {
  searchParams: Promise<{
    topic?: string;
  }>;
};

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const params = await searchParams;
  const lesson = await composeCleanLesson(params.topic ?? "");
  const subjectSlug = lesson.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const confidenceLabel =
    lesson.confidence === "curated"
      ? "Curated lesson"
      : lesson.confidence === "source-backed"
        ? "Source-backed lesson"
        : "Inferred lesson scaffold";

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
          <p className="result-eyebrow">{lesson.subject} / {confidenceLabel}</p>
          <h1 id="result-title">{lesson.topic}</h1>
          <p>{lesson.answer}</p>
          {lesson.source.url ? (
            <a className="source-link" href={lesson.source.url}>
              Source summary
            </a>
          ) : null}
        </div>
        <div className={`result-visual result-visual-${subjectSlug}`} aria-label={`${lesson.topic} visual model`}>
          <span className="result-ring result-ring-a" />
          <span className="result-ring result-ring-b" />
          <div className="result-core-card">
            <span>{lesson.subject}</span>
            <strong>{lesson.visualModel.title}</strong>
          </div>
          <div className="result-model-labels" aria-hidden="true">
            {lesson.visualModel.parts.slice(0, 4).map((part) => (
              <span key={part.label}>{part.label}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="answer-grid" aria-label="Generated learning answer">
        <article className="answer-card answer-primary">
          <span>Why it matters</span>
          <p>{lesson.whyItMatters}</p>
        </article>
        <article className="answer-card">
          <span>Common mistake</span>
          <p>{lesson.misconception}</p>
        </article>
        <article className="answer-card">
          <span>Concrete example</span>
          <p>{lesson.example}</p>
        </article>
      </section>

      <section className="visual-breakdown" aria-labelledby="model-title">
        <div className="result-section-heading">
          <p className="result-eyebrow">Visual model</p>
          <h2 id="model-title">{lesson.visualModel.title}</h2>
        </div>
        <div className="model-part-grid">
          {lesson.visualModel.parts.map((part, index) => (
            <article key={part.label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{part.label}</h3>
              <p>{part.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="result-section" aria-labelledby="steps-title">
        <div className="result-section-heading">
          <p className="result-eyebrow">Learn it</p>
          <h2 id="steps-title">Three steps</h2>
        </div>
        <div className="result-steps">
          {lesson.steps.map((step, index) => (
            <article key={step.title}>
              <span>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="result-practice" aria-label="Practice prompt">
        <div>
          <p className="result-eyebrow">Practice</p>
          <h2>Try this</h2>
          <p>{lesson.practice.prompt}</p>
          <small>{lesson.practice.hint}</small>
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
