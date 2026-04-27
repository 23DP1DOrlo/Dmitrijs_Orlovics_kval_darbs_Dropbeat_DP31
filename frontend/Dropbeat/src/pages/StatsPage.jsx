import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export function StatsPage() {
  const [rows, setRows] = useState([]);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api.get("/stats/genres").then(({ data }) => setRows(data));
    api.get("/stats/overview").then(({ data }) => setOverview(data)).catch(() => {});
  }, []);

  return (
    <section className="panel">
      <h2>Statistika pa zanriem</h2>
      {overview?.totals && (
        <div className="kpi-grid">
          <article className="card"><h3>{overview.totals.users}</h3><p>Lietotaji</p></article>
          <article className="card"><h3>{overview.totals.releases}</h3><p>Relizes</p></article>
          <article className="card"><h3>{overview.totals.comments}</h3><p>Komentari</p></article>
          <article className="card"><h3>{overview.totals.ratings}</h3><p>Novertejumi</p></article>
          <article className="card"><h3>{overview.totals.streams}</h3><p>Streams</p></article>
          <article className="card"><h3>{overview.totals.likes}</h3><p>Likes</p></article>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>Zanrs</th>
            <th>Streams</th>
            <th>Likes</th>
            <th>Relizu skaits</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.genre}>
              <td>{row.genre}</td>
              <td>{row.total_streams}</td>
              <td>{row.total_likes}</td>
              <td>{row.release_count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {overview?.top_users?.length > 0 && (
        <>
          <h3>Aktivakie lietotaji</h3>
          <div className="comment-list">
            {overview.top_users.map((user) => (
              <article key={user.id} className="card">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <small>{user.role} • Komentari: {user.release_comments_count} • Novertejumi: {user.release_ratings_count}</small>
                <p><Link to={`/users/${user.id}`}>Atvert aktivitati</Link></p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
