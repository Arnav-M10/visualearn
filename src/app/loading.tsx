export default function Loading() {
  return (
    <main className="loading-shell">
      <div className="loading-card" role="status" aria-live="polite">
        <div className="loading-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="loading-copy">
          <p className="eyebrow">Visualearn synthesis</p>
          <h1>Composing a visual lesson.</h1>
          <p>Detecting subject, extracting primitives, rendering the model, and calibrating practice.</p>
        </div>
        <div className="loading-pipeline" aria-hidden="true">
          <span>Subject</span>
          <span>Primitives</span>
          <span>Renderer</span>
          <span>Practice</span>
        </div>
      </div>
    </main>
  );
}
