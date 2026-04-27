import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { CoverImage } from "../components/CoverImage";

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

  const normalizeCoverUrl = (value) => {
    if (!value) return value;
    const apiOrigin = (api.defaults.baseURL ?? "").replace("/api", "");
    if (value.startsWith("/storage/")) return `${apiOrigin}${value}`;
    if (/^https?:\/\/localhost(?::\d+)?\/storage\//.test(value)) {
      return value.replace(/^https?:\/\/localhost(?::\d+)?\/storage\//, `${apiOrigin}/storage/`);
    }
    if (/^https?:\/\/127\.0\.0\.1(?::\d+)?\/storage\//.test(value)) {
      return value.replace(/^https?:\/\/127\.0\.0\.1(?::\d+)?\/storage\//, `${apiOrigin}/storage/`);
    }
    return value;
  };

  const formatDuration = (durationSeconds) => {
    const total = Number(durationSeconds ?? 0);
    if (!total) return "n/a";
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours > 0) return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

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

  const submitFeedback = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post(`/releases/${releaseId}/feedback`, {
        ...rating,
        comment,
      });
      setComment("");
      setMessage("Novertejums un komentars saglabati.");
      window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "success", message: "Feedback saglabats" } }));
      setRelease((prev) => (prev ? { ...prev, has_user_rated: true, has_user_commented: true } : prev));
      loadRelease();
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevas saglabat novertejumu un komentaru.");
    }
  };

  if (!release) {
    return <section className="panel"><h2>Relize</h2><p>Ielade...</p></section>;
  }

  const hasUserRated = Boolean(release.has_user_rated);
  const hasUserCommented = Boolean(release.has_user_commented);
  const canInteract = !hasUserRated && !hasUserCommented;
  const averageScore = (
    Number(release.avg_rhymes_images ?? 0)
    + Number(release.avg_structure_rhythm ?? 0)
    + Number(release.avg_style_execution ?? 0)
    + Number(release.avg_individuality_charisma ?? 0)
  ) / 4;

  const handleRangeChange = (field) => (event) => {
    setRating((prev) => ({ ...prev, [field]: Number(event.target.value) }));
  };

  return (
    <section className="panel">
      <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>← Atpakal</button>
      <header className="release-hero">
        <div className="release-hero-media">
          <CoverImage className="cover-image" src={normalizeCoverUrl(release.cover_url)} alt={release.title} />
        </div>
        <div>
          <p className="tag">{release.type}</p>
          <h2>{release.title}</h2>
          <p>{release.artist?.stage_name} - {release.custom_genre_name || release.genre?.name}</p>
          <p className="small-text">Ilgums: {formatDuration(release.duration_seconds)}</p>
          <p className="small-text">
            Videjais: Teksts {Number(release.avg_rhymes_images ?? 0).toFixed(1)} | Ritmika {Number(release.avg_structure_rhythm ?? 0).toFixed(1)} | Stils {Number(release.avg_style_execution ?? 0).toFixed(1)} | Individualitate {Number(release.avg_individuality_charisma ?? 0).toFixed(1)}
          </p>
        </div>
        <div className="release-details-rating">
          <div className="rating-badge-wrap">
            <div className="rating-badge">{averageScore.toFixed(1)}</div>
            <div className="rating-tooltip">
              <p>Teksts: {Number(release.avg_rhymes_images ?? 0).toFixed(1)}</p>
              <p>Ritmika: {Number(release.avg_structure_rhythm ?? 0).toFixed(1)}</p>
              <p>Stils: {Number(release.avg_style_execution ?? 0).toFixed(1)}</p>
              <p>Individualitate: {Number(release.avg_individuality_charisma ?? 0).toFixed(1)}</p>
            </div>
          </div>
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

      {user?.role === "listener" && canInteract && (
        <>
          <h3>Tavs feedback</h3>
          <form className="form-grid" onSubmit={submitFeedback}>
            <label className="rating-slider-row">
              <span>Teksts</span>
              <div className="rating-slider-wrap">
                <div className="rating-slider-track">
                  <div className="rating-slider-fill" style={{ width: `${((rating.rhymes_images - 1) / 9) * 100}%` }} />
                  <input
                    className="rating-range-input"
                    type="range"
                    min="1"
                    max="10"
                    value={rating.rhymes_images}
                    onChange={handleRangeChange("rhymes_images")}
                  />
                </div>
                <strong>{rating.rhymes_images}</strong>
              </div>
            </label>
            <label className="rating-slider-row">
              <span>Ritmika</span>
              <div className="rating-slider-wrap">
                <div className="rating-slider-track">
                  <div className="rating-slider-fill" style={{ width: `${((rating.structure_rhythm - 1) / 9) * 100}%` }} />
                  <input
                    className="rating-range-input"
                    type="range"
                    min="1"
                    max="10"
                    value={rating.structure_rhythm}
                    onChange={handleRangeChange("structure_rhythm")}
                  />
                </div>
                <strong>{rating.structure_rhythm}</strong>
              </div>
            </label>
            <label className="rating-slider-row">
              <span>Stils</span>
              <div className="rating-slider-wrap">
                <div className="rating-slider-track">
                  <div className="rating-slider-fill" style={{ width: `${((rating.style_execution - 1) / 9) * 100}%` }} />
                  <input
                    className="rating-range-input"
                    type="range"
                    min="1"
                    max="10"
                    value={rating.style_execution}
                    onChange={handleRangeChange("style_execution")}
                  />
                </div>
                <strong>{rating.style_execution}</strong>
              </div>
            </label>
            <label className="rating-slider-row">
              <span>Individualitate</span>
              <div className="rating-slider-wrap">
                <div className="rating-slider-track">
                  <div className="rating-slider-fill" style={{ width: `${((rating.individuality_charisma - 1) / 9) * 100}%` }} />
                  <input
                    className="rating-range-input"
                    type="range"
                    min="1"
                    max="10"
                    value={rating.individuality_charisma}
                    onChange={handleRangeChange("individuality_charisma")}
                  />
                </div>
                <strong>{rating.individuality_charisma}</strong>
              </div>
            </label>

            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tavs komentars par relizi"
              required
            />
            <button type="submit">Nosutit feedback</button>
          </form>
        </>
      )}

      {user?.role === "listener" && !canInteract && (
        <p className="ok">Tu jau nosutiji feedback (novertejumu + komentaru) sim relizam.</p>
      )}
    </section>
  );
}
