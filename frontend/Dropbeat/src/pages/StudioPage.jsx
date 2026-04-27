export function StudioPage({ user, t = (key, fallback) => fallback }) {
  if (user?.role !== "artist") {
    return <section className="panel"><h2>{t("pages.studio.title", "Studio")}</h2><p>{t("pages.studio.onlyArtists", "Tikai maksliniekiem.")}</p></section>;
  }

  return (
    <section className="panel">
      <h2>{t("pages.studio.artistTitle", "Artist Studio")}</h2>
      <p className="muted">{t("pages.studio.subtitle", "Produkcijas darba panelis, kas atdarina lielu platformu.")}</p>
      <div className="kpi-grid">
        <article className="card">
          <h3>{t("pages.studio.roadmap", "Roadmap")}</h3>
          <p>{t("pages.studio.roadmapText", "Upload audio failiem un cover menedzments.")}</p>
        </article>
        <article className="card">
          <h3>{t("pages.studio.campaigns", "Campaigns")}</h3>
          <p>{t("pages.studio.campaignsText", "Relizu promo kampanas un statistikas salidzinajums.")}</p>
        </article>
        <article className="card">
          <h3>{t("pages.studio.distribution", "Distribution")}</h3>
          <p>{t("pages.studio.distributionText", "Eksports uz Spotify/Apple Music metadatu schema.")}</p>
        </article>
      </div>
    </section>
  );
}
