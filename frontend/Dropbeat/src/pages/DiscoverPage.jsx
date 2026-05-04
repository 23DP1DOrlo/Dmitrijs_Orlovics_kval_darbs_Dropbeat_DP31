import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export function DiscoverPage({ t = (key, fallback) => fallback }) {
  const [rows, setRows] = useState([]);
  const formatDuration = (durationSeconds) => {
    const total = Number(durationSeconds ?? 0);
    if (!total) return "n/a";
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours > 0) return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    api.get("/releases", { params: { sort_by: "release_date", sort_dir: "desc" } }).then(({ data }) => {
      setRows(data.data ?? []);
    }).catch(() => {});
  }, []);

  return (
    <section className="panel">
      <h2>{t("pages.discover.title", "Discover")}</h2>
      <p className="muted">{t("pages.discover.subtitle", "Atlasito relizu izlase klausitajiem un A&R komandai.")}</p>
      <div className="release-grid">
        {rows.map((item) => (
          <article className="card" key={item.id}>
            {item.cover_url && <img className="cover-image" src={item.cover_url} alt={item.title} />}
            <p className="tag">{item.type}</p>
            <h3>{item.title}</h3>
            <Link to={`/releases/${item.id}`}>{t("pages.discover.details", "Skatit detalas")}</Link>
            <p>
              {item.artist?.id ? (
                <Link to={`/artists/${item.artist.id}`} className="discover-artist-link">
                  {item.artist?.stage_name}
                </Link>
              ) : (
                item.artist?.stage_name
              )}
            </p>
            <small>{item.genre?.name} | {item.release_date} | {formatDuration(item.duration_seconds)}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
