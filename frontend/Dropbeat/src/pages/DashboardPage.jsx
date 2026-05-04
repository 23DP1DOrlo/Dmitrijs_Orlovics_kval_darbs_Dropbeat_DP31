import { useEffect, useState } from "react";
import { api } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { CoverImage } from "../components/CoverImage";

export function DashboardPage({ user, t = (key, fallback) => fallback }) {
  const [rows, setRows] = useState([]);
  const [latest, setLatest] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    api.get("/stats/overview")
      .then(({ data }) => setOverview(data))
      .catch(() => setOverview(null))
      .finally(() => setLoadingOverview(false));
    api.get("/releases", { params: { sort_by: "created_at", sort_dir: "desc" } }).then(({ data }) => {
      setLatest(data.data ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  const countdownToRelease = (releaseDate) => {
    if (!releaseDate) return null;
    const target = new Date(`${releaseDate}T00:00:00`).getTime();
    const diffMs = target - nowTick;
    if (diffMs <= 0) return null;

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  };

  const upcoming = latest
    .map((item) => ({
      ...item,
      countdown: countdownToRelease(item.release_date),
    }))
    .filter((item) => item.countdown)
    .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime())
    .slice(0, 6);

  return (
    <section className="panel">
      <h2>{t("pages.dashboard.title", "Dashboard")}</h2>
      <p className="muted">{t("pages.dashboard.welcome", "Sveiks")}, {user?.name ?? t("common.guest", "viesis")}! {t("pages.dashboard.subtitle", "Seit ir projekta galvena atskaite.")}</p>

      <div className="kpi-grid dashboard-kpi-grid">
        <article className="card kpi-card-3d"><h3>{overview?.totals?.releases ?? 0}</h3><p>{t("pages.dashboard.kpiReleases", "Kopējais relīžu skaits")}</p></article>
        <article className="card kpi-card-3d"><h3>{overview?.totals?.users ?? 0}</h3><p>{t("pages.dashboard.kpiUsers", "Lietotaji platforma")}</p></article>
        <article className="card kpi-card-3d"><h3>{overview?.totals?.comments ?? 0}</h3><p>{t("pages.dashboard.kpiComments", "Komentari")}</p></article>
        <article className="card kpi-card-3d"><h3>{overview?.totals?.ratings ?? 0}</h3><p>{t("pages.dashboard.kpiRatings", "Novertejumi")}</p></article>
      </div>
      {loadingOverview && <p className="small-text">{t("pages.dashboard.loading", "Ieladejam realo statistiku no datubazes...")}</p>}
      {!loadingOverview && !overview?.totals && <p className="error">{t("pages.dashboard.loadError", "Neizdevas ieladet statistiku no datubazes.")}</p>}

      <section className="upcoming-shell">
        <div className="upcoming-head">
          <h3>{t("pages.dashboard.upcoming", "Upcoming Releases")}</h3>
        </div>
        <div className="upcoming-grid">
          {upcoming.map((item) => (
            <article key={item.id} className="card upcoming-card clickable-card" onClick={() => navigate(`/releases/${item.id}`)}>
              {item.cover_url && <CoverImage className="upcoming-cover" src={item.cover_url} alt={item.title} />}
              <div className="upcoming-meta">
                <strong>{item.title}</strong>
                <p>
                  {item.artist?.id ? (
                    <Link to={`/artists/${item.artist.id}`} className="dashboard-artist-link" onClick={(e) => e.stopPropagation()}>
                      {item.artist?.stage_name}
                    </Link>
                  ) : (
                    item.artist?.stage_name
                  )}
                  {" — "}
                  {item.release_date}
                </p>
                <div className="release-countdown">
                  <span>{String(item.countdown.days).padStart(2, "0")}d</span>
                  <span>{String(item.countdown.hours).padStart(2, "0")}h</span>
                  <span>{String(item.countdown.minutes).padStart(2, "0")}m</span>
                  <span>{String(item.countdown.seconds).padStart(2, "0")}s</span>
                </div>
              </div>
            </article>
          ))}
          {upcoming.length === 0 && <p className="muted">{t("pages.dashboard.noUpcoming", "Pagaidam nav relizu ar nakotnes datumu.")}</p>}
        </div>
      </section>

      <h3>{t("pages.dashboard.latest", "Jaunākās relīzes")}</h3>
      <div className="release-grid">
        {latest.slice(0, 6).map((item) => (
          <article key={item.id} className="card clickable-card" onClick={() => navigate(`/releases/${item.id}`)}>
            {item.cover_url && <CoverImage className="cover-image" src={item.cover_url} alt={item.title} />}
            <h3>{item.title}</h3>
            <p>
              {item.artist?.id ? (
                <Link to={`/artists/${item.artist.id}`} className="dashboard-artist-link" onClick={(e) => e.stopPropagation()}>
                  {item.artist?.stage_name}
                </Link>
              ) : (
                item.artist?.stage_name
              )}
              {" — "}
              {item.genre?.name}
            </p>
            <small>{item.release_date}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
