import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export function UserProfileInsightsPage() {
  const { userId } = useParams();
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

  return (
    <section className="panel">
      <h2>{details.user.name}</h2>
      <p className="muted">{details.user.email} | role: {details.user.role}</p>
      <div className="kpi-grid">
        <article className="card"><h3>{details.comment_count}</h3><p>Komentari</p></article>
        <article className="card"><h3>{details.rating_count ?? 0}</h3><p>Novertejumi</p></article>
      </div>

      <h3>Kur komenteja</h3>
      <div className="comment-list">
        {(details.comments ?? []).map((item) => (
          <article className="card" key={item.id}>
            {item.release?.cover_url && <img className="cover-image" src={item.release.cover_url} alt={item.release?.title} />}
            <p className="small-text">{item.comment}</p>
            <small>{item.release?.artist?.stage_name} - {item.release?.title}</small>
          </article>
        ))}
      </div>

      <h3>Ka noverteja relizes</h3>
      <div className="comment-list">
        {(details.ratings ?? []).map((item) => (
          <article className="card" key={item.id}>
            {item.release?.cover_url && <img className="cover-image" src={item.release.cover_url} alt={item.release?.title} />}
            <p>R/O {item.rhymes_images}, S/R {item.structure_rhythm}, Stils {item.style_execution}, Harizma {item.individuality_charisma}</p>
            <small>{item.release?.artist?.stage_name} - {item.release?.title}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
