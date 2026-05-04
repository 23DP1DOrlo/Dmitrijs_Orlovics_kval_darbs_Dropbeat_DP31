import { useEffect, useState } from "react";
import { api } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { CoverImage } from "../components/CoverImage";

const defaultFilter = { q: "", genre_id: "", type: "", sort_by: "release_date", sort_dir: "desc" };
const emptyForm = {
  title: "",
  genre_id: "",
  custom_genre_name: "",
  release_date: "",
  type: "single",
  cover_url: "",
  description: "",
  duration_seconds: "",
};
const emptyDuration = { hours: "", minutes: "", seconds: "" };

export function ReleasesPage({ user }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [duration, setDuration] = useState(emptyDuration);
  const [selectedCoverPreview, setSelectedCoverPreview] = useState("");

  const normalizeCoverUrl = (value) => {
    if (!value) return value;
    const apiOrigin = (api.defaults.baseURL ?? "").replace("/api", "");
    if (value.startsWith("/storage/")) {
      return `${apiOrigin}${value}`;
    }
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

  const getScore = (item) => {
    const values = [
      Number(item.avg_rhymes_images ?? 0),
      Number(item.avg_structure_rhythm ?? 0),
      Number(item.avg_style_execution ?? 0),
      Number(item.avg_individuality_charisma ?? 0),
    ];
    const total = values.reduce((sum, value) => sum + value, 0);
    return total / values.length;
  };

  const canManageRelease = (item) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "artist") {
      return item.artist?.user_id === user.id;
    }
    return false;
  };

  const isOtherGenreSelected = genres.find((genre) => String(genre.id) === String(form.genre_id))?.name === "Other";

  const loadGenres = async () => {
    try {
      const { data } = await api.get("/genres");
      setGenres(data);
    } catch {
      setError("Neizdevas ieladet zanrus.");
    }
  };

  const loadReleases = async () => {
    try {
      const params = Object.fromEntries(Object.entries(filter).filter(([, v]) => v !== ""));
      const { data } = await api.get("/releases", { params });
      setItems(data.data ?? []);
    } catch {
      setError("Neizdevas ieladet relizes.");
    }
  };

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    loadReleases();
  }, [filter]);

  const onCreate = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    const hours = form.type === "single" ? 0 : Number(duration.hours || 0);
    const minutes = Number(duration.minutes || 0);
    const seconds = Number(duration.seconds || 0);
    const totalDuration = (hours * 3600) + (minutes * 60) + seconds;

    const payload = {
      ...form,
      genre_id: Number(form.genre_id),
      custom_genre_name: form.custom_genre_name?.trim() ? form.custom_genre_name.trim() : null,
      duration_seconds: totalDuration > 0 ? totalDuration : null,
      is_published: true,
    };

    try {
      if (!payload.genre_id) {
        setError("Izvelies zanru.");
        return;
      }
      if (isOtherGenreSelected && !payload.custom_genre_name) {
        setError("Ja izvelies Other, ieraksti savu zanru.");
        return;
      }

      if (editId) {
        await api.put(`/releases/${editId}`, payload);
        setMessage("Relize veiksmigi atjaunota.");
        window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "success", message: "Relize atjaunota" } }));
      } else {
        await api.post("/releases", payload);
        setMessage("Relize veiksmigi pievienota.");
        window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "success", message: "Relize pievienota" } }));
      }

      setEditId(null);
      setForm(emptyForm);
      setDuration(emptyDuration);
      setSelectedCoverPreview("");
      loadReleases();
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]?.[0];
        setError(firstError ?? "Neizdevas saglabat relizi.");
      } else {
        setError(requestError?.response?.data?.message ?? "Neizdevas saglabat relizi.");
        window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "error", message: "Kluda: relize netika saglabata" } }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (item) => {
    setEditId(item.id);
    setForm({
      title: item.title ?? "",
      genre_id: String(item.genre_id ?? ""),
      release_date: item.release_date ?? "",
      type: item.type ?? "single",
      cover_url: item.cover_url ?? "",
      custom_genre_name: item.custom_genre_name ?? "",
      description: item.description ?? "",
      duration_seconds: item.duration_seconds ? String(item.duration_seconds) : "",
    });
    const total = Number(item.duration_seconds ?? 0);
    if (total > 0) {
      setDuration({
        hours: String(Math.floor(total / 3600)),
        minutes: String(Math.floor((total % 3600) / 60)),
        seconds: String(total % 60),
      });
    } else {
      setDuration(emptyDuration);
    }
  };

  const onDelete = async (id) => {
    setError("");
    setMessage("");
    try {
      await api.delete(`/releases/${id}`);
      setMessage("Relize dzesta.");
      window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "success", message: "Relize dzesta" } }));
      loadReleases();
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevas dzest relizi.");
    }
  };

  const uploadCoverFile = async (file) => {
    if (!file) return;
    setUploadingCover(true);
    setError("");
    const objectUrl = URL.createObjectURL(file);
    setSelectedCoverPreview(objectUrl);
    try {
      const formData = new FormData();
      formData.append("cover", file);
      const { data } = await api.post("/releases/upload-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, cover_url: data.cover_url }));
      window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "success", message: "Oblozka augshupieladeta" } }));
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevas augshupieladet oblozku.");
    } finally {
      setUploadingCover(false);
    }
  };

  useEffect(() => {
    return () => {
      if (selectedCoverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(selectedCoverPreview);
      }
    };
  }, [selectedCoverPreview]);

  return (
    <section className="panel">
      <h2>Relizu katalogs</h2>
      {message && <p className="ok">{message}</p>}
      {error && <p className="error">{error}</p>}
      <div className="filters">
        <input placeholder="Meklet..." onChange={(e) => setFilter((p) => ({ ...p, q: e.target.value }))} />
        <select onChange={(e) => setFilter((p) => ({ ...p, genre_id: e.target.value }))}>
          <option value="">Visi zanri</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
        <select onChange={(e) => setFilter((p) => ({ ...p, type: e.target.value }))}>
          <option value="">Visi tipi</option>
          <option value="single">Single</option>
          <option value="ep">EP</option>
          <option value="album">Album</option>
        </select>
        <select onChange={(e) => setFilter((p) => ({ ...p, sort_by: e.target.value }))} defaultValue="release_date">
          <option value="release_date">Pec datuma</option>
          <option value="title">Pec nosaukuma</option>
          <option value="created_at">Pec izveides datuma</option>
        </select>
        <select onChange={(e) => setFilter((p) => ({ ...p, sort_dir: e.target.value }))} defaultValue="desc">
          <option value="desc">Dilstoši</option>
          <option value="asc">Augoši</option>
        </select>
      </div>

      <div className="release-grid">
        {items.map((item) => (
          <article
            key={item.id}
            className="card clickable-card"
            onClick={() => navigate(`/releases/${item.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                navigate(`/releases/${item.id}`);
              }
            }}
          >
            <div className="rating-badge-wrap" onClick={(event) => event.stopPropagation()}>
              <div className="rating-badge">{getScore(item).toFixed(1)}</div>
              <div className="rating-tooltip">
                <p>Teksts: {Number(item.avg_rhymes_images ?? 0).toFixed(1)}</p>
                <p>Ritmika: {Number(item.avg_structure_rhythm ?? 0).toFixed(1)}</p>
                <p>Stils: {Number(item.avg_style_execution ?? 0).toFixed(1)}</p>
                <p>Individualitate: {Number(item.avg_individuality_charisma ?? 0).toFixed(1)}</p>
              </div>
            </div>
            {item.cover_url && <CoverImage className="cover-image" src={normalizeCoverUrl(item.cover_url)} alt={item.title} />}
            <h3>{item.title}</h3>
            <p>
              {item.artist?.id ? (
                <Link to={`/artists/${item.artist.id}`} className="releases-artist-link" onClick={(e) => e.stopPropagation()}>
                  {item.artist?.stage_name}
                </Link>
              ) : (
                item.artist?.stage_name
              )}
              {" — "}
              {item.custom_genre_name || item.genre?.name}
            </p>
            <small>{item.release_date} | {item.type.toUpperCase()} | {formatDuration(item.duration_seconds)}</small>
            {item.description && <p className="small-text">{item.description}</p>}
            {canManageRelease(item) && (
              <div className="row-actions">
                <button type="button" onClick={(event) => { event.stopPropagation(); onEdit(item); }}>Rediget</button>
                <button type="button" className="danger" onClick={(event) => { event.stopPropagation(); onDelete(item.id); }}>Dzest</button>
              </div>
            )}
            {user?.role === "listener" && <p className="small-text">Novertejumu un komentaru vari pievienot relizes detalizetaja lapa.</p>}
          </article>
        ))}
      </div>

      {user?.role === "artist" && editId && (
        <>
          <h3>Rediget relizi</h3>
          <form className="form-grid" onSubmit={onCreate}>
            <input placeholder="Nosaukums" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            <input type="date" value={form.release_date} onChange={(e) => setForm((p) => ({ ...p, release_date: e.target.value }))} required />
            <select value={form.genre_id} onChange={(e) => setForm((p) => ({ ...p, genre_id: e.target.value }))} required>
              <option value="">Izveleties zanru</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
            {isOtherGenreSelected && (
              <input
                placeholder="Ieraksti savu zanru"
                value={form.custom_genre_name}
                onChange={(e) => setForm((p) => ({ ...p, custom_genre_name: e.target.value }))}
                required
              />
            )}
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              <option value="single">Single</option>
              <option value="ep">EP</option>
              <option value="album">Album</option>
            </select>
            <input
              placeholder="Oblozkas URL"
              value={form.cover_url}
              onChange={(e) => setForm((p) => ({ ...p, cover_url: e.target.value }))}
              required
            />
            <input type="file" accept="image/*" onChange={(e) => uploadCoverFile(e.target.files?.[0])} />
            {uploadingCover && <p className="small-text">Augshupielade...</p>}
            {(selectedCoverPreview || form.cover_url) && (
              <CoverImage
                className="cover-preview"
                src={selectedCoverPreview || normalizeCoverUrl(form.cover_url)}
                alt="cover preview"
              />
            )}
            <div className="duration-group">
              {form.type !== "single" && (
                <input
                  type="number"
                  min="0"
                  max="24"
                  placeholder="hh"
                  value={duration.hours}
                  onChange={(e) => setDuration((prev) => ({ ...prev, hours: e.target.value }))}
                />
              )}
              <input
                type="number"
                min="0"
                max="59"
                placeholder="mm"
                value={duration.minutes}
                onChange={(e) => setDuration((prev) => ({ ...prev, minutes: e.target.value }))}
              />
              <input
                type="number"
                min="0"
                max="59"
                placeholder="ss"
                value={duration.seconds}
                onChange={(e) => setDuration((prev) => ({ ...prev, seconds: e.target.value }))}
              />
            </div>
            <textarea
              placeholder="Relizes apraksts"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
            />
            <button type="submit" disabled={submitting}>{editId ? "Atjaunot relizi" : "Saglabat relizi"}</button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); setDuration(emptyDuration); setSelectedCoverPreview(""); }}>
                Atcelt redigesanu
              </button>
            )}
          </form>
        </>
      )}

      {user?.role === "artist" && !editId && <p className="muted">Jaunu relizi vari pievienot atseviskaja lapa: <Link to="/artist/drop">Drop Release</Link>.</p>}
      {!user && <p className="muted">Lai pievienotu relizi, piesledzies ka makslinieks.</p>}
    </section>
  );
}
