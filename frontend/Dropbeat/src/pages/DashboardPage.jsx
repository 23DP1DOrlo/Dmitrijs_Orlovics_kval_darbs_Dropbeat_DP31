import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { CoverImage } from "../components/CoverImage";

export function DashboardPage({ user }) {
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
      <h2>Dashboard</h2>
      <p className="muted">Sveiks, {user?.name ?? "viesis"}! Seit ir projekta galvena atskaite.</p>

      <div className="kpi-grid dashboard-kpi-grid">
        <article className="card kpi-card-3d"><h3>{overview?.totals?.releases ?? 0}</h3><p>Kopējais relīžu skaits</p></article>
        <article className="card kpi-card-3d"><h3>{overview?.totals?.users ?? 0}</h3><p>Lietotaji platforma</p></article>
        <article className="card kpi-card-3d"><h3>{overview?.totals?.comments ?? 0}</h3><p>Komentari</p></article>
        <article className="card kpi-card-3d"><h3>{overview?.totals?.ratings ?? 0}</h3><p>Novertejumi</p></article>
      </div>
      {loadingOverview && <p className="small-text">Ieladejam realo statistiku no datubazes...</p>}
      {!loadingOverview && !overview?.totals && <p className="error">Neizdevas ieladet statistiku no datubazes.</p>}

      <section className="upcoming-shell">
        <div className="upcoming-head">
          <h3>Upcoming Releases</h3>
        </div>
        <div className="upcoming-grid">
          {upcoming.map((item) => (
            <article key={item.id} className="card upcoming-card clickable-card" onClick={() => navigate(`/releases/${item.id}`)}>
              {item.cover_url && <CoverImage className="upcoming-cover" src={item.cover_url} alt={item.title} />}
              <div className="upcoming-meta">
                <strong>{item.title}</strong>
                <p>{item.artist?.stage_name} - {item.release_date}</p>
                <div className="release-countdown">
                  <span>{String(item.countdown.days).padStart(2, "0")}d</span>
                  <span>{String(item.countdown.hours).padStart(2, "0")}h</span>
                  <span>{String(item.countdown.minutes).padStart(2, "0")}m</span>
                  <span>{String(item.countdown.seconds).padStart(2, "0")}s</span>
                </div>
              </div>
            </article>
          ))}
          {upcoming.length === 0 && <p className="muted">Pagaidam nav relizu ar nakotnes datumu.</p>}
        </div>
      </section>

      <h3>Jaunākās relīzes</h3>
      <div className="release-grid">
        {latest.slice(0, 6).map((item) => (
          <article key={item.id} className="card clickable-card" onClick={() => navigate(`/releases/${item.id}`)}>
            {item.cover_url && <CoverImage className="cover-image" src={item.cover_url} alt={item.title} />}
            <h3>{item.title}</h3>
            <p>{item.artist?.stage_name} - {item.genre?.name}</p>
            <small>{item.release_date}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
