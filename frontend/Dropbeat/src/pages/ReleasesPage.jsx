import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

const defaultFilter = { q: "", genre_id: "", type: "", sort_by: "release_date", sort_dir: "desc" };
const emptyForm = {
  title: "",
  genre_id: "",
  release_date: "",
  type: "single",
  cover_url: "",
  description: "",
  duration_seconds: "",
};

export function ReleasesPage({ user }) {
  const [items, setItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState({});
  const [ratedReleaseIds, setRatedReleaseIds] = useState([]);

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
    const payload = {
      ...form,
      genre_id: Number(form.genre_id),
      duration_seconds: form.duration_seconds ? Number(form.duration_seconds) : null,
      is_published: true,
    };

    try {
      if (!payload.genre_id) {
        setError("Izvelies zanru.");
        return;
      }

      if (editId) {
        await api.put(`/releases/${editId}`, payload);
        setMessage("Relize veiksmigi atjaunota.");
      } else {
        await api.post("/releases", payload);
        setMessage("Relize veiksmigi pievienota.");
      }

      setEditId(null);
      setForm(emptyForm);
      loadReleases();
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]?.[0];
        setError(firstError ?? "Neizdevas saglabat relizi.");
      } else {
        setError(requestError?.response?.data?.message ?? "Neizdevas saglabat relizi.");
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
      description: item.description ?? "",
      duration_seconds: item.duration_seconds ? String(item.duration_seconds) : "",
    });
  };

  const onDelete = async (id) => {
    setError("");
    setMessage("");
    try {
      await api.delete(`/releases/${id}`);
      setMessage("Relize dzesta.");
      loadReleases();
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevas dzest relizi.");
    }
  };

  const updateRatingField = (releaseId, key, value) => {
    setRatings((prev) => ({
      ...prev,
      [releaseId]: {
        rhymes_images: 5,
        structure_rhythm: 5,
        style_execution: 5,
        individuality_charisma: 5,
        ...(prev[releaseId] ?? {}),
        [key]: Number(value),
      },
    }));
  };

  const submitRating = async (releaseId) => {
    setError("");
    setMessage("");
    try {
      const payload = ratings[releaseId] ?? {
        rhymes_images: 5,
        structure_rhythm: 5,
        style_execution: 5,
        individuality_charisma: 5,
      };
      await api.post(`/releases/${releaseId}/rate`, payload);
      setMessage("Novertejums saglabats.");
      setRatedReleaseIds((prev) => [...new Set([...prev, releaseId])]);
      loadReleases();
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevas saglabat novertejumu.");
    }
  };

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
          <article key={item.id} className="card">
            {item.cover_url && <img className="cover-image" src={item.cover_url} alt={item.title} />}
            <h3>{item.title}</h3>
            <Link to={`/releases/${item.id}`}>Atvert relizes lapu</Link>
            <p>{item.artist?.stage_name} - {item.genre?.name}</p>
            <small>{item.release_date} | {item.type.toUpperCase()}</small>
            <p className="small-text">
              Reitings ({item.ratings_count ?? 0}): R/O {Number(item.avg_rhymes_images ?? 0).toFixed(1)}, S/R {Number(item.avg_structure_rhythm ?? 0).toFixed(1)}, Stils {Number(item.avg_style_execution ?? 0).toFixed(1)}, Harizma {Number(item.avg_individuality_charisma ?? 0).toFixed(1)}
            </p>
            {item.description && <p className="small-text">{item.description}</p>}
            {user && (user.role === "admin" || user.role === "artist") && (
              <div className="row-actions">
                <button type="button" onClick={() => onEdit(item)}>Rediget</button>
                <button type="button" className="danger" onClick={() => onDelete(item.id)}>Dzest</button>
              </div>
            )}
            {user?.role === "listener" && (
              <div className="rating-grid">
                <label>Rifmas / Obrazi <input type="range" min="1" max="10" defaultValue="5" onChange={(e) => updateRatingField(item.id, "rhymes_images", e.target.value)} /></label>
                <label>Struktura / Ritmika <input type="range" min="1" max="10" defaultValue="5" onChange={(e) => updateRatingField(item.id, "structure_rhythm", e.target.value)} /></label>
                <label>Stila realizacija <input type="range" min="1" max="10" defaultValue="5" onChange={(e) => updateRatingField(item.id, "style_execution", e.target.value)} /></label>
                <label>Individualitate / Harizma <input type="range" min="1" max="10" defaultValue="5" onChange={(e) => updateRatingField(item.id, "individuality_charisma", e.target.value)} /></label>
                <button type="button" disabled={ratedReleaseIds.includes(item.id)} onClick={() => submitRating(item.id)}>
                  {ratedReleaseIds.includes(item.id) ? "Jau novertets" : "Saglabat novertejumu"}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {user?.role === "artist" && (
        <>
          <h3>{editId ? "Rediget relizi" : "Jauns relize"}</h3>
          <form className="form-grid" onSubmit={onCreate}>
            <input placeholder="Nosaukums" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            <input type="date" value={form.release_date} onChange={(e) => setForm((p) => ({ ...p, release_date: e.target.value }))} required />
            <select value={form.genre_id} onChange={(e) => setForm((p) => ({ ...p, genre_id: e.target.value }))} required>
              <option value="">Izveleties zanru</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
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
            <input
              placeholder="Ilgums sekundes (piemeram 180)"
              value={form.duration_seconds}
              onChange={(e) => setForm((p) => ({ ...p, duration_seconds: e.target.value }))}
            />
            <textarea
              placeholder="Relizes apraksts"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
            />
            <button type="submit" disabled={submitting}>{editId ? "Atjaunot relizi" : "Saglabat relizi"}</button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); }}>
                Atcelt redigesanu
              </button>
            )}
          </form>
        </>
      )}

      {!user && <p className="muted">Lai pievienotu relizi, piesledzies ka makslinieks.</p>}
    </section>
  );
}
