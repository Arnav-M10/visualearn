export default function Home() {
  return (
    <main className="clean-landing">
      <nav className="clean-nav" aria-label="Primary navigation">
        <a className="clean-brand" href="/">
          <span />
          Visualearn
        </a>
        <div className="clean-nav-links">
          <a href="#how">How it works</a>
          <a href="#audiences">For everyone</a>
          <a className="clean-nav-cta" href="/app">
            Open app
          </a>
        </div>
      </nav>

      <section className="clean-hero" aria-labelledby="landing-title">
        <div className="clean-hero-copy">
          <p className="clean-eyebrow">AI visual learning, without the clutter</p>
          <h1 id="landing-title">Learn anything by seeing it move.</h1>
          <p>
            Visualearn turns topics into simple interactive lessons with visuals first,
            short explanations second, and practice when you are ready.
          </p>
          <div className="clean-actions">
            <a className="clean-primary" href="/app">
              Start learning
            </a>
            <a className="clean-secondary" href="#how">
              See how it works
            </a>
          </div>
        </div>

        <div className="clean-preview" aria-label="Visualearn lesson preview">
          <div className="clean-preview-top">
            <span>Generated lesson</span>
            <strong>Your exact topic</strong>
          </div>
          <div className="clean-visual" aria-hidden="true">
            <span className="clean-orbit clean-orbit-a" />
            <span className="clean-orbit clean-orbit-b" />
            <span className="clean-core" />
          </div>
          <div className="clean-preview-steps">
            <span>Watch the model</span>
            <span>Move one variable</span>
            <span>Practice the idea</span>
          </div>
        </div>
      </section>

      <section className="clean-section" id="how">
        <div className="clean-section-heading">
          <p className="clean-eyebrow">How it works</p>
          <h2>Three calm steps. No wall of text.</h2>
        </div>
        <div className="clean-steps">
          {[
            ["Ask", "Type the exact concept or question."],
            ["See", "The app generates a custom visual system for that idea."],
            ["Practice", "Answer concept checks that test understanding, not the UI."]
          ].map(([title, detail], index) => (
            <article className="clean-step" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="clean-section" id="audiences">
        <div className="clean-section-heading">
          <p className="clean-eyebrow">For all ages</p>
          <h2>Simple enough to start. Deep enough to grow.</h2>
        </div>
        <div className="clean-audience-grid">
          {[
            ["Students", "Build intuition before memorizing definitions."],
            ["Parents", "Understand what your learner is seeing and practicing."],
            ["Teachers", "Use quick visual models to introduce hard ideas."]
          ].map(([title, detail]) => (
            <article className="clean-audience-card" key={title}>
              <h3>{title}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="clean-final-cta" aria-label="Start learning">
        <p className="clean-eyebrow">Ready when you are</p>
        <h2>Open the full learning studio when you want the advanced tools.</h2>
        <a className="clean-primary" href="/app">
          Enter Visualearn
        </a>
      </section>
    </main>
  );
}
