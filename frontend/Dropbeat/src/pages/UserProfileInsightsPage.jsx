import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { CoverImage } from "../components/CoverImage";

export function UserProfileInsightsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/users/${userId}/comments`)
      .then(({ data }) => setDetails(data))
      .catch(() => setError("Neizdevas ieladet lietotaja aktivitates."));
  }, [userId]);

  if (error) {
    return <section className="panel"><p className="error">{error}</p></section>;
  }

  if (!details) {
    return <section className="panel"><p>Ielade...</p></section>;
  }

  const formatDate = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString();
  };

  return (
    <section className="panel">
      <h2>{details.user.name}</h2>
      <p className="muted">{details.user.email} | role: {details.user.role}</p>
      <div className="kpi-grid">
        <article className="card"><h3>{details.comment_count}</h3><p>Komentari</p></article>
        <article className="card"><h3>{details.rating_count ?? 0}</h3><p>Novertejumi</p></article>
      </div>

      <div className="user-activity-layout">
        <section className="user-activity-column">
          <h3>Ka noverteja relizes</h3>
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
            {(!details.ratings || details.ratings.length === 0) && <p className="muted">Sobrid nav novertejumu.</p>}
          </div>
        </section>

        <section className="user-activity-column">
          <h3>Kur komenteja</h3>
          <div className="comment-list">
            {(details.comments ?? []).map((item) => (
              <article className="card user-activity-card clickable-card" key={item.id} onClick={() => item.release?.id && navigate(`/releases/${item.release.id}`)}>
                {item.release?.cover_url && <CoverImage className="cover-image activity-cover" src={item.release.cover_url} alt={item.release?.title} />}
                <div className="activity-meta">
                  <strong>{item.release?.title} - {item.release?.artist?.stage_name}</strong>
                  <p className="small-text">{item.comment} {item.created_at ? `(${formatDate(item.created_at)})` : ""}</p>
                </div>
              </article>
            ))}
            {(!details.comments || details.comments.length === 0) && <p className="muted">Sobrid nav komentaru.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}
