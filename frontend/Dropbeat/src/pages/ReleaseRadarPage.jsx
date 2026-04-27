import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

export function ReleaseRadarPage() {
  const [radarData, setRadarData] = useState([]);

  useEffect(() => {
    api.get("/stats/genres")
      .then(({ data }) => setRadarData((data ?? []).slice(0, 8)))
      .catch(() => setRadarData([]));
  }, []);

  const max = useMemo(() => {
    if (!radarData.length) return 1;
    return Math.max(...radarData.map((d) => Number(d.total_streams ?? 0)));
  }, [radarData]);

  return (
    <section className="panel">
      <h2>Release Radar</h2>
      <p className="muted">Tendenču panelis ar realu zanru aktivitati no datubazes.</p>
      <div className="comment-list">
        {radarData.map((row) => (
          <article className="card" key={row.genre}>
            <p>{row.genre}</p>
            <div className="progress-shell">
              <div className="progress-fill" style={{ width: `${(Number(row.total_streams ?? 0) / max) * 100}%` }} />
            </div>
            <small>{Number(row.total_streams ?? 0)} streams • {Number(row.release_count ?? 0)} relizes</small>
          </article>
        ))}
        {!radarData.length && <p className="muted">Nav datu radar panelim.</p>}
      </div>
    </section>
  );
}
