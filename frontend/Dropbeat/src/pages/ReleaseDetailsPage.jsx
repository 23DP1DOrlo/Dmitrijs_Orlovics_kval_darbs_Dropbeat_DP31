import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { CoverImage } from "../components/CoverImage";
import { ArtistIdentity } from "../components/ArtistIdentity";

function ArtistLine({ artists, primary, t }) {
  const list = (artists?.length ? artists : [primary]).filter(Boolean);
  return (
    <p className="release-artist-line">
      {list.map((a, i) => (
        <span key={a.id ?? i}>
          {i > 0 ? ", " : ""}
          {a.id ? (
            <Link to={`/artists/${a.id}`} className="release-artist-link">
              <ArtistIdentity artist={a} unknown={t?.("common.unknownArtist", "Nezināms mākslinieks")} />
            </Link>
          ) : (
            <ArtistIdentity artist={a} unknown={t?.("common.unknownArtist", "Nezināms mākslinieks")} />
          )}
        </span>
      ))}
    </p>
  );
}

export function ReleaseDetailsPage({ user, t = (key, fallback) => fallback }) {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState({
    rhymes_images: 5,
    structure_rhythm: 5,
    style_execution: 5,
    individuality_charisma: 5,
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [genres, setGenres] = useState([]);
  const [editingRelease, setEditingRelease] = useState(false);
  const [savingRelease, setSavingRelease] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    genre_id: "",
    custom_genre_name: "",
    release_date: "",
    type: "single",
    cover_url: "",
    description: "",
    duration_seconds: "",
  });

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
    setLoading(true);
    try {
      const { data } = await api.get(`/releases/${releaseId}`, { timeout: 12000 });
      setRelease(data);
    } catch (requestError) {
      setRelease(null);
      setError("Neizdevās ielādēt relīzi.");
      setMessage("");
      if (requestError?.response?.status === 404) {
        setError("Relīze nav atrasta.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRelease();
  }, [releaseId]);

  useEffect(() => {
    api.get("/genres")
      .then(({ data }) => setGenres(data ?? []))
      .catch(() => {});
  }, []);

  const submitRating = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const trimmedComment = comment.trim();
    try {
      if (trimmedComment) {
        await api.post(`/releases/${releaseId}/feedback`, {
          ...rating,
          comment: trimmedComment,
        });
      } else {
        await api.post(`/releases/${releaseId}/rate`, {
          ...rating,
        });
      }

      setComment("");
      if (trimmedComment) {
        setMessage("Novērtējums un komentārs saglabāts.");
        window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "success", message: "Feedback saglabats" } }));
        setRelease((prev) => (prev ? { ...prev, has_user_rated: true, has_user_commented: true } : prev));
      } else {
        setMessage("Novērtējums saglabāts. Vari pievienot komentāru vēlāk.");
        window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "success", message: "Novērtējums saglabāts" } }));
        setRelease((prev) => (prev ? { ...prev, has_user_rated: true, has_user_commented: false } : prev));
      }
      loadRelease();
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevās saglabāt novērtējumu.");
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const trimmedComment = comment.trim();
    if (trimmedComment.length < 3) {
      setError("Komentāram jābūt vismaz 3 simboliem.");
      return;
    }

    try {
      await api.post(`/releases/${releaseId}/comments`, {
        comment: trimmedComment,
      });
      setComment("");
      setMessage("Komentārs saglabāts.");
      window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "success", message: "Komentārs saglabāts" } }));
      setRelease((prev) => (prev ? { ...prev, has_user_commented: true } : prev));
      loadRelease();
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevās saglabāt komentāru.");
    }
  };

  const deleteComment = async (commentId) => {
    if (!commentId || user?.role !== "admin") return;
    setError("");
    setMessage("");
    try {
      await api.delete(`/releases/${releaseId}/comments/${commentId}`);
      setMessage("Komentārs dzēsts.");
      window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "success", message: "Komentārs dzēsts" } }));
      loadRelease();
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevās dzēst komentāru.");
    }
  };

  const openEditModal = () => {
    setEditForm({
      title: release?.title ?? "",
      genre_id: String(release?.genre_id ?? release?.genre?.id ?? ""),
      custom_genre_name: release?.custom_genre_name ?? "",
      release_date: release?.release_date ?? "",
      type: release?.type ?? "single",
      cover_url: release?.cover_url ?? "",
      description: release?.description ?? "",
      duration_seconds: release?.duration_seconds != null ? String(release.duration_seconds) : "",
    });
    setEditingRelease(true);
  };

  const submitReleaseEdit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      title: String(editForm.title ?? "").trim(),
      genre_id: Number(editForm.genre_id),
      custom_genre_name: editForm.custom_genre_name?.trim() ? editForm.custom_genre_name.trim() : null,
      release_date: editForm.release_date,
      type: editForm.type,
      description: editForm.description?.trim() ? editForm.description.trim() : null,
      duration_seconds: editForm.duration_seconds ? Number(editForm.duration_seconds) : null,
    };

    if (!payload.genre_id) {
      setError("Izvēlies žanru.");
      return;
    }

    setSavingRelease(true);
    try {
      await api.put(`/releases/${releaseId}`, payload);
      setEditingRelease(false);
      setMessage("Relīze atjaunota.");
      window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "success", message: "Relīze atjaunota" } }));
      await loadRelease();
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      const backendError = requestError?.response?.data?.error;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]?.[0];
        setError(firstError ?? "Neizdevās atjaunot relīzi.");
      } else if (backendError) {
        setError(`Neizdevās atjaunot relīzi: ${backendError}`);
      } else {
        setError(requestError?.response?.data?.message ?? "Neizdevās atjaunot relīzi.");
      }
    } finally {
      setSavingRelease(false);
    }
  };

  const feedbackItems = useMemo(() => {
    const comments = Array.isArray(release?.comments) ? release.comments : [];
    const ratings = Array.isArray(release?.ratings) ? release.ratings : [];
    const byUser = new Map();

    comments.forEach((item) => {
      const key = item.user?.id ?? `comment-${item.id}`;
      byUser.set(key, {
        user: item.user,
        comment: item.comment ?? "",
        commentCreatedAt: item.created_at ?? null,
        commentId: item.id ?? null,
        rating: null,
        ratingCreatedAt: null,
      });
    });

    ratings.forEach((item) => {
      const key = item.user?.id ?? `rating-${item.id}`;
      const existing = byUser.get(key) ?? {
        user: item.user,
        comment: "",
        commentCreatedAt: null,
        commentId: null,
        rating: null,
        ratingCreatedAt: null,
      };
      existing.rating = item;
      existing.ratingCreatedAt = item.created_at ?? null;
      if (!existing.user && item.user) existing.user = item.user;
      byUser.set(key, existing);
    });

    return Array.from(byUser.values()).sort((a, b) => {
      const bTime = Date.parse(b.commentCreatedAt ?? b.ratingCreatedAt ?? 0);
      const aTime = Date.parse(a.commentCreatedAt ?? a.ratingCreatedAt ?? 0);
      return bTime - aTime;
    });
  }, [release]);

  if (loading) {
    return <section className="panel"><h2>Relīze</h2><p>Ielāde...</p></section>;
  }

  if (!release) {
    return (
      <section className="panel">
        <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>← Atpakaļ</button>
        <h2>Relīze</h2>
        <p className="error">{error || "Neizdevās ieladēt relīzi."}</p>
      </section>
    );
  }

  const hasUserRatedFromPayload = Boolean(release.has_user_rated);
  const hasUserCommentedFromPayload = Boolean(release.has_user_commented);
  const hasUserRatedByRows = Array.isArray(release.ratings)
    ? release.ratings.some((item) => Number(item.user_id ?? item.user?.id) === Number(user?.id))
    : false;
  const hasUserCommentedByRows = Array.isArray(release.comments)
    ? release.comments.some((item) => Number(item.user_id ?? item.user?.id) === Number(user?.id))
    : false;
  const hasUserRated = hasUserRatedFromPayload || hasUserRatedByRows;
  const hasUserCommented = hasUserCommentedFromPayload || hasUserCommentedByRows;
  const releaseDate = release?.release_date ? new Date(`${release.release_date}T00:00:00`) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isReleaseOut = !releaseDate || Number.isNaN(releaseDate.getTime()) || releaseDate.getTime() <= today.getTime();
  const canRate = !hasUserRated;
  const canAddComment = hasUserRated && !hasUserCommented;
  const feedbackCompleted = hasUserRated && hasUserCommented;
  const canModerateComments = user?.role === "admin";
  const canEditRelease = user?.role === "admin";
  const canPromptGuestToAuth = !user && isReleaseOut;
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
    <section className="panel release-details-page">
      <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>← Atpakaļ</button>
      {canEditRelease && (
        <button type="button" className="primary-btn" onClick={openEditModal}>Rediģēt relīzi</button>
      )}
      <header className="release-profile-hero">
        <div className="release-profile-cover">
          <CoverImage className="release-profile-cover-image" src={normalizeCoverUrl(release.cover_url)} alt={release.title} />
        </div>
        <div className="release-profile-intro">
          <p className="tag">{String(release.type ?? "single").toUpperCase()}</p>
          <h1 className="release-profile-title">{release.title}</h1>
          <ArtistLine artists={release.artists} primary={release.artist} t={t} />
          <p className="release-genre-line">{release.custom_genre_name || release.genre?.name}</p>
          <div className="release-profile-meta-row">
            <span className="artist-profile-chip">Relīzes datums: {release.release_date ?? "n/a"}</span>
            <span className="artist-profile-chip">Ilgums: {formatDuration(release.duration_seconds)}</span>
            <span className="artist-profile-chip">Vērtēšanas skaits: {Number(release.ratings_count ?? 0)}</span>
          </div>
        </div>
        <aside className="release-profile-stats">
          <div className="artist-profile-stat-card artist-profile-stat-highlight">
            <span className="artist-profile-stat-value">{Number.isFinite(averageScore) ? averageScore.toFixed(1) : "—"}</span>
            <span className="artist-profile-stat-label">Kopējais vidējais</span>
          </div>
          <div className="artist-profile-stat-card">
            <div className="release-score-lines">
              <p>Teksts: <strong>{Number(release.avg_rhymes_images ?? 0).toFixed(1)}</strong></p>
              <p>Ritmika: <strong>{Number(release.avg_structure_rhythm ?? 0).toFixed(1)}</strong></p>
              <p>Stils: <strong>{Number(release.avg_style_execution ?? 0).toFixed(1)}</strong></p>
              <p>Individualitāte: <strong>{Number(release.avg_individuality_charisma ?? 0).toFixed(1)}</strong></p>
            </div>
          </div>
        </aside>
      </header>

      {error && <p className="error">{error}</p>}
      {message && <p className="ok">{message}</p>}

      <h2 className="artist-profile-section-title">Lietotāju atsauksmes</h2>
      {feedbackItems.length === 0 ? (
        <p className="muted">Vēl nav atsauksmju par šo relīzi.</p>
      ) : (
        <div className="release-feedback-grid">
          {feedbackItems.map((item, index) => {
            const score = item.rating
              ? (
                Number(item.rating.rhymes_images ?? 0)
                + Number(item.rating.structure_rhythm ?? 0)
                + Number(item.rating.style_execution ?? 0)
                + Number(item.rating.individuality_charisma ?? 0)
              ) / 4
              : null;

            return (
              <article className="release-feedback-card" key={`${item.user?.id ?? "anon"}-${index}`}>
                <div className="release-feedback-head">
                  <strong>
                    {item.user?.id ? (
                      <Link to={`/users/${item.user.id}`} className="release-feedback-user">
                        {item.user?.name ?? "Lietotājs"}
                      </Link>
                    ) : (
                      item.user?.name ?? "Lietotājs"
                    )}
                  </strong>
                  <span className={`artist-release-score ${score == null ? "is-muted" : ""}`}>
                    ★ {score == null ? "—" : score.toFixed(1)}
                  </span>
                </div>

                <div className="release-feedback-rating-grid">
                  <span>Teksts: <strong>{item.rating?.rhymes_images ?? "—"}</strong></span>
                  <span>Ritmika: <strong>{item.rating?.structure_rhythm ?? "—"}</strong></span>
                  <span>Stils: <strong>{item.rating?.style_execution ?? "—"}</strong></span>
                  <span>Individualitāte: <strong>{item.rating?.individuality_charisma ?? "—"}</strong></span>
                </div>

                <p className="release-feedback-comment">
                  {item.comment?.trim() ? item.comment : "Komentārs netika pievienots."}
                </p>
                {canModerateComments && item.commentId && (
                  <button
                    type="button"
                    className="danger"
                    onClick={() => deleteComment(item.commentId)}
                  >
                    Dzēst komentāru
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!isReleaseOut && (
        <article className="card">
          <h3>Novertēšana vēl nav pieejama</h3>
          <p className="muted">Šo relīzi varēs novertēt un komentēt no iznākšanas datuma: {release.release_date ?? "n/a"}.</p>
        </article>
      )}

      {user?.role === "listener" && isReleaseOut && canRate && (
        <>
          <h3>Tavs novertējums</h3>
          <form className="form-grid" onSubmit={submitRating}>
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
              <span>Individualitāte</span>
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
              placeholder="Komentārs (neobligāts)"
            />
            <button type="submit">
              {comment.trim() ? "Nosūtīt novērtējumu + komentāru" : "Nosūtīt novērtējumu"}
            </button>
          </form>
        </>
      )}

      {user?.role === "listener" && isReleaseOut && canAddComment && (
        <>
          <h3>Pievieno komentāru savai recenzijai</h3>
          <form className="form-grid" onSubmit={submitComment}>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tavs komentars par relizi"
              required
            />
            <button type="submit" disabled={comment.trim().length < 3}>Nosūtīt komentāru</button>
          </form>
        </>
      )}

      {user?.role === "listener" && isReleaseOut && feedbackCompleted && (
        <p className="ok">Tu jau nosūtīji novērtējumu un komentāru šai relīzei.</p>
      )}

      {canPromptGuestToAuth && (
        <div className="profile-head" style={{ marginTop: "0.85rem" }}>
          <div>
            <h3>Novērtē šo relīzi</h3>
            <p className="muted">Lai atstātu novērtējumu vai komentāru, pieslēdzies vai izveido kontu.</p>
          </div>
          <button
            type="button"
            className="primary-btn"
            onClick={() => navigate(`/auth?redirect=${encodeURIComponent(`/releases/${releaseId}`)}`)}
          >
            Novērtē relīzi
          </button>
        </div>
      )}

      {editingRelease && (
        <>
          <div className="feed-modal-backdrop" onClick={() => setEditingRelease(false)} />
          <section className="feed-release-modal" role="dialog" aria-modal="true" aria-label="Rediģēt relīzi">
            <button type="button" className="feed-modal-close" onClick={() => setEditingRelease(false)}>×</button>
            <div className="feed-modal-main">
              <p className="tag">Admin</p>
              <h3>Rediģēt relīzi</h3>
              <p className="muted">Vari labot relīzes datus no detalizētās lapas.</p>
            </div>
            <form className="form-grid" onSubmit={submitReleaseEdit}>
              <input
                placeholder="Nosaukums"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
              <input
                type="date"
                value={editForm.release_date}
                onChange={(e) => setEditForm((prev) => ({ ...prev, release_date: e.target.value }))}
                required
              />
              <select
                value={editForm.genre_id}
                onChange={(e) => setEditForm((prev) => ({ ...prev, genre_id: e.target.value }))}
                required
              >
                <option value="">Izvēlēties žanru</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
              <input
                placeholder="Cits žanrs (ja vajag)"
                value={editForm.custom_genre_name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, custom_genre_name: e.target.value }))}
              />
              <select
                value={editForm.type}
                onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="single">Singls</option>
                <option value="ep">EP</option>
                <option value="album">Albums</option>
              </select>
              <input
                type="number"
                min="30"
                max="86400"
                placeholder="Ilgums sekundēs"
                value={editForm.duration_seconds}
                onChange={(e) => setEditForm((prev) => ({ ...prev, duration_seconds: e.target.value }))}
              />
              <textarea
                rows={4}
                placeholder="Relīzes apraksts"
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              />
              <button type="submit" className="primary-btn" disabled={savingRelease}>
                {savingRelease ? "Saglabāju..." : "Saglabāt izmaiņas"}
              </button>
              <button type="button" onClick={() => setEditingRelease(false)}>Atcelt</button>
            </form>
          </section>
        </>
      )}
    </section>
  );
}
