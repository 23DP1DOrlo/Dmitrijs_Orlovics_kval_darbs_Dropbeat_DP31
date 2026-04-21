export function StudioPage({ user }) {
  if (user?.role !== "artist") {
    return <section className="panel"><h2>Studio</h2><p>Tikai maksliniekiem.</p></section>;
  }

  return (
    <section className="panel">
      <h2>Artist Studio</h2>
      <p className="muted">Produkcijas darba panelis, kas atdarina lielu platformu.</p>
      <div className="kpi-grid">
        <article className="card">
          <h3>Roadmap</h3>
          <p>Upload audio failiem un cover menedzments.</p>
        </article>
        <article className="card">
          <h3>Campaigns</h3>
          <p>Relizu promo kampanas un statistikas salidzinajums.</p>
        </article>
        <article className="card">
          <h3>Distribution</h3>
          <p>Eksports uz Spotify/Apple Music metadatu schema.</p>
        </article>
      </div>
    </section>
  );
}
