import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export function UserCommentsPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");

  const searchUsers = async () => {
    try {
      setError("");
      const { data } = await api.get("/users/search-comments", { params: { query } });
      setUsers(data);
    } catch {
      setError("Neizdevas atrast lietotajus.");
    }
  };

  const loadDetails = async (user) => {
    try {
      setSelected(user);
      const { data } = await api.get(`/users/${user.id}/comments`);
      setDetails(data);
    } catch {
      setError("Neizdevas ieladet komentaru vesturi.");
    }
  };

  return (
    <section className="panel">
      <h2>User Insights</h2>
      <p className="muted">Mekle artistus un klausitajus, apskati vinu komentarus un novertejumus.</p>
      <div className="filters">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Meklet pec varda vai e-pasta" />
        <button type="button" onClick={searchUsers}>Meklet</button>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="kpi-grid">
        {users.map((user) => (
          <article key={user.id} className={`card clickable-card ${selected?.id === user.id ? "active-card" : ""}`} onClick={() => loadDetails(user)}>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <p className="small-text">Loma: {user.role}{user.artist?.stage_name ? ` (${user.artist.stage_name})` : ""}</p>
            <small>Komentari: {user.release_comments_count}</small>
            <small>Novertejumi: {user.release_ratings_count ?? 0}</small>
            <p><Link to={`/users/${user.id}`} onClick={(event) => event.stopPropagation()}>Atvert profilu</Link></p>
          </article>
        ))}
      </div>

      {details && (
        <>
          <h3>{details.user.name} komentari ({details.comment_count})</h3>
          <div className="comment-list">
            {details.comments.map((item) => (
              <article className="card" key={item.id}>
                {item.release?.cover_url && <img className="cover-image" src={item.release.cover_url} alt={item.release?.title} />}
                <p className="small-text">{item.comment}</p>
                <small>{item.release?.artist?.stage_name} - {item.release?.title}</small>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
