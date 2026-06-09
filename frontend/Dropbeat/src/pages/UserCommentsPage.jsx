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
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchUsers = async () => {
    const term = query.trim();
    if (term.length === 0) {
      setUsers([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoadingSuggestions(true);
      setError("");
      const { data } = await api.get("/users/search-comments", { params: { query: term } });
      setUsers(data ?? []);
      setShowSuggestions(false);
    } catch {
      setError("Neizdevās atrast lietotājus.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    const term = query.trim();
    if (term.length === 0) {
      setUsers([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        setError("");
        const { data } = await api.get("/users/search-comments", { params: { query: term } });
        setUsers(data ?? []);
      } catch {
        setError("Neizdevās atrast lietotājus.");
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
      setError("Neizdevās ielādēt komentāru vēsturi.");
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
      <p className="muted">Meklē māksliniekus un klausītājus, apskati viņu komentārus un novērtējumus.</p>
      <div className="filters">
        <div className="search-suggest-wrap">
          <input
            value={query}
            onChange={(e) => {
              const nextQuery = e.target.value;
              setQuery(nextQuery);
              setShowSuggestions(nextQuery.trim().length > 0);
            }}
            onFocus={() => {
              if (query.trim().length > 0) setShowSuggestions(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                searchUsers();
              }
              if (event.key === "Escape") {
                setShowSuggestions(false);
              }
            }}
            placeholder="Meklēt pēc vārda vai nika"
          />
          {showSuggestions && query.trim().length > 0 && (
            <div className="search-suggest-list">
              {loadingSuggestions && <p className="small-text">Meklēšana...</p>}
              {!loadingSuggestions && users.length === 0 && <p className="small-text">Nav rezultātu</p>}
              {!loadingSuggestions && users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="search-suggest-item"
                  onClick={() => {
                    setQuery(user.name);
                    setShowSuggestions(false);
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
        <button type="button" className="search-submit-btn" onClick={searchUsers}>Meklēt</button>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="kpi-grid">
        {users.map((user) => (
          <article key={user.id} className={`card clickable-card ${selected?.id === user.id ? "active-card" : ""}`} onClick={() => loadDetails(user)}>
            <h3>{user.name}</h3>
            <p className="small-text">
              Loma: {user.role}
              {user.artist?.stage_name ? ` | Niks: ${user.artist.stage_name}` : ""}
            </p>
            <small>Komentāri: {user.release_comments_count}</small>
            <small>Novērtējumi: {user.release_ratings_count ?? 0}</small>
            <p><Link to={`/users/${user.id}`} onClick={(event) => event.stopPropagation()}>Atvērt profilu</Link></p>
          </article>
        ))}
      </div>

      {details && (
        <>
          <h3>{details.user.name} komentāri ({details.comment_count})</h3>
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

          <h3>{details.user.name} novērtējumi ({details.rating_count ?? 0})</h3>
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
                      <p>Individualitāte: {item.individuality_charisma}</p>
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
