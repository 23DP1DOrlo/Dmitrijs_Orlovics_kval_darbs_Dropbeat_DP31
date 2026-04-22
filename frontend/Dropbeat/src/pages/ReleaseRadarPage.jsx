import { useMemo } from "react";

const radarData = [
  { label: "Hip-Hop", value: 87 },
  { label: "Electronic", value: 74 },
  { label: "Lo-Fi", value: 65 },
  { label: "Trap", value: 58 },
  { label: "Pop", value: 41 },
];

export function ReleaseRadarPage() {
  const max = useMemo(() => Math.max(...radarData.map((d) => d.value)), []);

  return (
    <section className="panel">
      <h2>Release Radar</h2>
      <p className="muted">Tendenču panelis ar žanru aktivitāti.</p>
      <div className="comment-list">
        {radarData.map((row) => (
          <article className="card" key={row.label}>
            <p>{row.label}</p>
            <div className="progress-shell">
              <div className="progress-fill" style={{ width: `${(row.value / max) * 100}%` }} />
            </div>
            <small>{row.value} points</small>
          </article>
        ))}
      </div>
    </section>
  );
}
