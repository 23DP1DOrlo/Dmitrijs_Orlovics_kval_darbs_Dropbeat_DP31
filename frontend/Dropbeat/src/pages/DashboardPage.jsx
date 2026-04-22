import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export function DashboardPage({ user }) {
  const [rows, setRows] = useState([]);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    api.get("/stats/genres").then(({ data }) => setRows(data)).catch(() => {});
    api.get("/releases", { params: { sort_by: "created_at", sort_dir: "desc" } }).then(({ data }) => {
      setLatest(data.data ?? []);
    }).catch(() => {});
  }, []);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.streams += Number(row.total_streams ?? 0);
        acc.likes += Number(row.total_likes ?? 0);
        acc.releases += Number(row.release_count ?? 0);
        return acc;
      },
      { streams: 0, likes: 0, releases: 0 },
    );
  }, [rows]);

  return (
    <section className="panel">
      <h2>Dashboard</h2>
      <p className="muted">Sveiks, {user?.name ?? "viesis"}! Seit ir projekta galvena atskaite.</p>

      <div className="kpi-grid">
        <article className="card"><h3>{totals.releases}</h3><p>Kopējais relīžu skaits</p></article>
        <article className="card"><h3>{totals.streams}</h3><p>Kopējie streami</p></article>
        <article className="card"><h3>{totals.likes}</h3><p>Kopējie like</p></article>
      </div>

      <h3>Jaunākās relīzes</h3>
      <div className="release-grid">
        {latest.slice(0, 6).map((item) => (
          <article key={item.id} className="card">
            {item.cover_url && <img className="cover-image" src={item.cover_url} alt={item.title} />}
            <h3>{item.title}</h3>
            <p>{item.artist?.stage_name} - {item.genre?.name}</p>
            <small>{item.release_date}</small>
            <p><Link to={`/releases/${item.id}`}>Atvert relizi</Link></p>
          </article>
        ))}
      </div>
    </section>
  );
}
