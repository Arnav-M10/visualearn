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
          Type any topic. Visualearn generates a fresh lesson with a custom simulator, Manim-style animation beats, and concept checks.
        </p>

        <form className="ask-form" action="/learn">
          <label htmlFor="topic">Topic</label>
          <div className="ask-input-row">
            <input
              id="topic"
              name="topic"
              type="search"
              placeholder="Type the exact concept or question you want to understand..."
              autoComplete="off"
              autoFocus
            />
            <button type="submit">Generate</button>
          </div>
        </form>
      </section>
    </main>
  );
}
