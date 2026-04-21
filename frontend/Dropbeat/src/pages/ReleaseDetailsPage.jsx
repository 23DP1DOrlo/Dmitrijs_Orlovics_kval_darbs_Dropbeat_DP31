import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export function ReleaseDetailsPage({ user }) {
  const { releaseId } = useParams();
  const [release, setRelease] = useState(null);
  const [comment, setComment] = useState("");
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

  if (!release) {
    return <section className="panel"><h2>Relize</h2><p>Ielade...</p></section>;
  }

  return (
    <section className="panel">
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
            <strong>{item.user?.name ?? "Lietotajs"}</strong>
            <p>{item.comment}</p>
          </article>
        ))}
      </div>

      {user?.role === "listener" && (
        <form className="form-grid" onSubmit={submitComment}>
          <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tavs komentars par relizi" required />
          <button type="submit">Pievienot komentaru</button>
        </form>
      )}
    </section>
  );
}
