import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

export function ReleaseDetailsPage({ user }) {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const [release, setRelease] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState({
    rhymes_images: 5,
    structure_rhythm: 5,
    style_execution: 5,
    individuality_charisma: 5,
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRelease = async () => {
    try {
      const { data } = await api.get(`/releases/${releaseId}`);
      setRelease(data);
    } catch {
      setError("Neizdevas ieladet relizi.");
    }
  };

  useEffect(() => {
    loadRelease();
  }, [releaseId]);

  const submitComment = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post(`/releases/${releaseId}/comments`, { comment });
      setComment("");
      setMessage("Komentars pievienots.");
      loadRelease();
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevas pievienot komentaru.");
    }
  };

  const submitRating = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post(`/releases/${releaseId}/rate`, rating);
      setMessage("Novertejums saglabats.");
      loadRelease();
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevas pievienot novertejumu.");
    }
  };

  if (!release) {
    return <section className="panel"><h2>Relize</h2><p>Ielade...</p></section>;
  }

  return (
    <section className="panel">
      <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>← Atpakal</button>
      <header className="release-hero">
        <img className="cover-image" src={release.cover_url} alt={release.title} />
        <div>
          <p className="tag">{release.type}</p>
          <h2>{release.title}</h2>
          <p>{release.artist?.stage_name} - {release.genre?.name}</p>
          <p className="small-text">
            Videjais: R/O {Number(release.avg_rhymes_images ?? 0).toFixed(1)} | S/R {Number(release.avg_structure_rhythm ?? 0).toFixed(1)} | Stils {Number(release.avg_style_execution ?? 0).toFixed(1)} | Harizma {Number(release.avg_individuality_charisma ?? 0).toFixed(1)}
          </p>
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {message && <p className="ok">{message}</p>}

      <h3>Komentari</h3>
      <div className="comment-list">
        {(release.comments ?? []).map((item) => (
          <article className="card" key={item.id}>
            <strong><Link to={`/users/${item.user?.id}`}>{item.user?.name ?? "Lietotajs"}</Link></strong>
            <p>{item.comment}</p>
          </article>
        ))}
      </div>

      {user?.role === "listener" && (
        <>
          <h3>Tavs novertejums</h3>
          <form className="form-grid" onSubmit={submitRating}>
            <label>Rifmas / Obrazi <input type="range" min="1" max="10" value={rating.rhymes_images} onChange={(e) => setRating((p) => ({ ...p, rhymes_images: Number(e.target.value) }))} /></label>
            <label>Struktura / Ritmika <input type="range" min="1" max="10" value={rating.structure_rhythm} onChange={(e) => setRating((p) => ({ ...p, structure_rhythm: Number(e.target.value) }))} /></label>
            <label>Stila realizacija <input type="range" min="1" max="10" value={rating.style_execution} onChange={(e) => setRating((p) => ({ ...p, style_execution: Number(e.target.value) }))} /></label>
            <label>Individualitate / Harizma <input type="range" min="1" max="10" value={rating.individuality_charisma} onChange={(e) => setRating((p) => ({ ...p, individuality_charisma: Number(e.target.value) }))} /></label>
            <button type="submit" disabled={Boolean(release.has_user_rated)}>{release.has_user_rated ? "Jau novertets" : "Saglabat novertejumu"}</button>
          </form>

          <h3>Tavs komentars</h3>
          <form className="form-grid" onSubmit={submitComment}>
            <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tavs komentars par relizi" required />
            <button type="submit">Pievienot komentaru</button>
          </form>
        </>
      )}
    </section>
  );
}
