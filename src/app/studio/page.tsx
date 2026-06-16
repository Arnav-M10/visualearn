export default function StudioPage() {
  return (
    <main className="studio-hub">
      <nav className="studio-hub-nav" aria-label="Studio navigation">
        <a href="/" className="studio-hub-brand">
          Visualearn
        </a>
        <div>
          <a href="/app">Simple ask</a>
          <a className="studio-hub-primary" href="/learn?topic=black%20holes">
            Open model
          </a>
        </div>
      </nav>

      <section className="studio-hub-hero" aria-labelledby="studio-title">
        <div className="studio-hub-copy">
          <p className="studio-hub-eyebrow">Advanced studio</p>
          <h1 id="studio-title">A focused control room for visual lessons.</h1>
          <p>
            Use the simple app when you just want a clean prompt. Open any generated model
            when you want sliders, source-backed visuals, checkpoints, and practice.
          </p>
          <div className="studio-hub-actions">
            <a className="studio-hub-primary" href="/learn?topic=black%20holes">
              Launch visual model
            </a>
            <a href="/app">Ask a clean question</a>
          </div>
        </div>

        <div className="studio-hub-panel" aria-label="Studio preview">
          <div className="studio-hub-panel-top">
            <span>Power mode</span>
            <strong>Black holes</strong>
          </div>
          <div className="studio-hub-stage" aria-hidden="true">
            <span className="studio-hub-node studio-hub-node-a">Concept</span>
            <span className="studio-hub-node studio-hub-node-b">Visual</span>
            <span className="studio-hub-node studio-hub-node-c">Practice</span>
            <span className="studio-hub-line studio-hub-line-a" />
            <span className="studio-hub-line studio-hub-line-b" />
          </div>
          <div className="studio-hub-metrics">
            <span>
              <strong>4</strong>
              simulation modes
            </span>
            <span>
              <strong>8</strong>
              source lenses
            </span>
            <span>
              <strong>1</strong>
              calm workflow
            </span>
          </div>
        </div>
      </section>

      <section className="studio-hub-tools" aria-label="Studio tools">
        {[
          ["Engine", "Every topic becomes a source-backed model, not a saved hardcoded lesson."],
          ["Canvas", "Graphs, flows, networks, timelines, particles, and orbits render from generated structure."],
          ["Practice", "Questions appear inside checkpoints and again at the end so learning stays active."]
        ].map(([title, detail]) => (
          <article key={title}>
            <span>{title}</span>
            <p>{detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
