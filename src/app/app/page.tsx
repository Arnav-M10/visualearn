const examples = ["derivatives", "black holes", "French Revolution", "neural networks"];

export default function AppPage() {
  return (
    <main className="ask-shell">
      <nav className="ask-nav" aria-label="Visualearn app navigation">
        <a href="/" className="ask-brand">
          Visualearn
        </a>
        <a href="/studio" className="ask-nav-link">
          Advanced studio
        </a>
      </nav>

      <section className="ask-panel" aria-labelledby="ask-title">
        <p className="ask-eyebrow">Ask anything</p>
        <h1 id="ask-title">What do you want to understand?</h1>
        <p className="ask-subtitle">
          Type a topic. Visualearn will open a clean result page with the answer, visual model, and practice.
        </p>

        <form className="ask-form" action="/learn">
          <label htmlFor="topic">Topic</label>
          <div className="ask-input-row">
            <input
              id="topic"
              name="topic"
              type="search"
              placeholder="Try: black holes, derivatives, DNA replication..."
              autoComplete="off"
              autoFocus
            />
            <button type="submit">Generate</button>
          </div>
        </form>

        <div className="ask-examples" aria-label="Example topics">
          {examples.map((example) => (
            <a href={`/learn?topic=${encodeURIComponent(example)}`} key={example}>
              {example}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
