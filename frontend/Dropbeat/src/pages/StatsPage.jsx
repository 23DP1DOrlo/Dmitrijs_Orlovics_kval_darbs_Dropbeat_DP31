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
      <h2>Statistika pa žanriem</h2>
      {overview?.totals && (
        <div className="kpi-grid">
          <article className="card"><h3>{overview.totals.users}</h3><p>Lietotāji</p></article>
          <article className="card"><h3>{overview.totals.releases}</h3><p>Relīzes</p></article>
          <article className="card"><h3>{overview.totals.comments}</h3><p>Komentāri</p></article>
          <article className="card"><h3>{overview.totals.ratings}</h3><p>Novērtējumi</p></article>
          <article className="card"><h3>{overview.totals.streams}</h3><p>Streams</p></article>
          <article className="card"><h3>{overview.totals.likes}</h3><p>Likes</p></article>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>Žanrs</th>
            <th>Streams</th>
            <th>Likes</th>
            <th>Relīžu skaits</th>
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
          <h3>Aktīvākie lietotāji</h3>
          <div className="comment-list">
            {overview.top_users.map((user) => (
              <article key={user.id} className="card">
                <h3>{user.name}</h3>
                <small>{user.role} • Komentāri: {user.release_comments_count} • Novērtējumi: {user.release_ratings_count}</small>
                <p><Link to={`/users/${user.id}`}>Atvērt aktivitāti</Link></p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
