import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export function LeaderboardPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/releases", { params: { sort_by: "release_date", sort_dir: "desc" } })
      .then(({ data }) => {
        const sorted = (data.data ?? [])
          .map((item) => ({
            ...item,
            score:
              Number(item.avg_rhymes_images ?? 0) +
              Number(item.avg_structure_rhythm ?? 0) +
              Number(item.avg_style_execution ?? 0) +
              Number(item.avg_individuality_charisma ?? 0),
          }))
          .sort((a, b) => b.score - a.score);
        setRows(sorted.slice(0, 20));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="panel">
      <h2>Leaderboard</h2>
      <p className="muted">Top relizes pec auditorijas novertejuma.</p>
      <div className="comment-list">
        {rows.map((item, idx) => (
          <article className="card" key={item.id}>
            {item.cover_url && <img className="cover-image" src={item.cover_url} alt={item.title} />}
            <strong>#{idx + 1} - {item.title}</strong>
            <p>{item.artist?.stage_name} | Score: {item.score.toFixed(1)}</p>
            <small>Votes: {item.ratings_count ?? 0}</small>
            <p><Link to={`/releases/${item.id}`}>Atvert relizi</Link></p>
          </article>
        ))}
      </div>
    </section>
  );
}
