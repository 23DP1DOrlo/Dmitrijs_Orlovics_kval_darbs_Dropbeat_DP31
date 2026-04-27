import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { CoverImage } from "../components/CoverImage";

export function UserCommentsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const searchUsers = async () => {
    try {
      setError("");
      const { data } = await api.get("/users/search-comments", { params: { query } });
      setUsers(data);
    } catch {
      setError("Neizdevas atrast lietotajus.");
    }
  };

  useEffect(() => {
    const term = query.trim();
    if (term.length === 0) {
      setUsers([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        setError("");
        const { data } = await api.get("/users/search-comments", { params: { query: term } });
        setUsers(data ?? []);
      } catch {
        setError("Neizdevas atrast lietotajus.");
      } finally {
        setLoadingSuggestions(false);
      }
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const loadDetails = async (user) => {
    try {
      setSelected(user);
      const { data } = await api.get(`/users/${user.id}/comments`);
      setDetails(data);
    } catch {
      setError("Neizdevas ieladet komentaru vesturi.");
    }
  };

  const formatDate = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString();
  };

  return (
    <section className="panel">
      <h2>User Insights</h2>
      <p className="muted">Mekle artistus un klausitajus, apskati vinu komentarus un novertejumus.</p>
      <div className="filters">
        <div className="search-suggest-wrap">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Meklet pec varda vai e-pasta" />
          {query.trim().length > 0 && (
            <div className="search-suggest-list">
              {loadingSuggestions && <p className="small-text">Meklesana...</p>}
              {!loadingSuggestions && users.length === 0 && <p className="small-text">Nav rezultatu</p>}
              {!loadingSuggestions && users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="search-suggest-item"
                  onClick={() => {
                    setQuery(user.name);
                    loadDetails(user);
                  }}
                >
                  <strong>{user.name}</strong>
                  <small>{user.role}{user.artist?.stage_name ? ` - ${user.artist.stage_name}` : ""}</small>
                </button>
              ))}
            </div>
          )}
        </div>
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
              <article className="card user-activity-card clickable-card" key={item.id} onClick={() => item.release?.id && navigate(`/releases/${item.release.id}`)}>
                {item.release?.cover_url && <CoverImage className="cover-image activity-cover" src={item.release.cover_url} alt={item.release?.title} />}
                <div className="activity-meta">
                  <strong>{item.release?.title} - {item.release?.artist?.stage_name}</strong>
                  <p className="small-text">{item.comment} {item.created_at ? `(${formatDate(item.created_at)})` : ""}</p>
                </div>
              </article>
            ))}
          </div>

          <h3>{details.user.name} novertejumi ({details.rating_count ?? 0})</h3>
          <div className="comment-list">
            {(details.ratings ?? []).map((item) => (
              <article className="card user-activity-card clickable-card" key={item.id} onClick={() => item.release?.id && navigate(`/releases/${item.release.id}`)}>
                {item.release?.cover_url && <CoverImage className="cover-image activity-cover" src={item.release.cover_url} alt={item.release?.title} />}
                <div className="activity-meta">
                  <strong>{item.release?.title} - {item.release?.artist?.stage_name}</strong>
                  <div className="rating-inline-wrap" onClick={(event) => event.stopPropagation()}>
                    <span className="rating-inline-pill">
                      {item.rhymes_images}/{item.structure_rhythm}/{item.style_execution}/{item.individuality_charisma}
                    </span>
                    <div className="rating-inline-tooltip">
                      <p>Teksts: {item.rhymes_images}</p>
                      <p>Ritmika: {item.structure_rhythm}</p>
                      <p>Stils: {item.style_execution}</p>
                      <p>Individualitate: {item.individuality_charisma}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
