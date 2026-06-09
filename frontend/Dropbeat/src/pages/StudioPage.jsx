export function StudioPage({ user, t = (key, fallback) => fallback }) {
  if (user?.role !== "artist") {
    return <section className="panel"><h2>{t("pages.studio.title", "Studija")}</h2><p>{t("pages.studio.onlyArtists", "Tikai māksliniekiem.")}</p></section>;
  }

  return (
    <section className="panel">
      <h2>{t("pages.studio.artistTitle", "Mākslinieka studija")}</h2>
      <p className="muted">{t("pages.studio.subtitle", "Produkcijas darba panelis, kas atdarina lielu platformu.")}</p>
      <div className="kpi-grid">
        <article className="card">
          <h3>{t("pages.studio.roadmap", "Plāns")}</h3>
          <p>{t("pages.studio.roadmapText", "Audio failu augšupielāde un vāku pārvaldība.")}</p>
        </article>
        <article className="card">
          <h3>{t("pages.studio.campaigns", "Kampaņas")}</h3>
          <p>{t("pages.studio.campaignsText", "Relīžu promo kampaņas un statistikas salīdzinājums.")}</p>
        </article>
        <article className="card">
          <h3>{t("pages.studio.distribution", "Izplatīšana")}</h3>
          <p>{t("pages.studio.distributionText", "Metadatu eksports uz Spotify/Apple Music shēmu.")}</p>
        </article>
      </div>
    </section>
  );
}
