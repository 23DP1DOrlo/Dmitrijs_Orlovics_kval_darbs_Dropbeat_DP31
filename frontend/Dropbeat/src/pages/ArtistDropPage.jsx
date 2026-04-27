import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { CoverImage } from "../components/CoverImage";

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

export function ArtistDropPage({ user }) {
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [collaboratorIds, setCollaboratorIds] = useState([]);
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

  useEffect(() => {
    api.get("/genres")
      .then(({ data }) => setGenres(data))
      .catch(() => setError("Neizdevas ieladet zanrus."));

    api.get("/artists")
      .then(({ data }) => setArtists(data))
      .catch(() => setError("Neizdevas ieladet maksliniekus."));
  }, []);

  useEffect(() => {
    if (!artists.length || !user?.id) {
      return;
    }

    const currentArtist = artists.find((artist) => artist.user_id === user.id);
    if (currentArtist) {
      setCollaboratorIds((prev) => (prev.includes(currentArtist.id) ? prev : [currentArtist.id, ...prev].slice(0, 7)));
    }
  }, [artists, user?.id]);

  const isOtherGenreSelected = genres.find((genre) => String(genre.id) === String(form.genre_id))?.name === "Other";

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
      artist_ids: collaboratorIds,
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
      if (!payload.artist_ids.length) {
        setError("Pievieno vismaz vienu makslinieku relizei.");
        return;
      }

      await api.post("/releases", payload);
      setMessage("Relize veiksmigi pievienota.");
      setForm(emptyForm);
      setSelectedArtistId("");
      const currentArtist = artists.find((artist) => artist.user_id === user?.id);
      setCollaboratorIds(currentArtist ? [currentArtist.id] : []);
      setDuration(emptyDuration);
      setSelectedCoverPreview("");
      window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "success", message: "Relize pievienota" } }));
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

  if (user?.role !== "artist") {
    return (
      <section className="panel">
        <h2>Drop Release</h2>
        <p className="muted">Saja lapa relizes var pievienot tikai artists.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Drop Release</h2>
      <p className="muted">Atseviska studijas lapa jaunam relizam - no idejas lidz publicesanai.</p>
      {message && <p className="ok">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form className="form-grid" onSubmit={onCreate}>
        <input placeholder="Nosaukums" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
        <input type="date" value={form.release_date} onChange={(e) => setForm((p) => ({ ...p, release_date: e.target.value }))} required />
        <select value={form.genre_id} onChange={(e) => setForm((p) => ({ ...p, genre_id: e.target.value }))} required>
          <option value="">Izveleties zanru</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </select>
        <div className="collaborator-picker">
          <label htmlFor="artist-collab-select">Kopdarba makslinieki (lidz 7)</label>
          <div className="collaborator-picker-row">
            <select
              id="artist-collab-select"
              value={selectedArtistId}
              onChange={(e) => setSelectedArtistId(e.target.value)}
            >
              <option value="">Izvelies makslinieku</option>
              {artists
                .filter((artist) => !collaboratorIds.includes(artist.id))
                .map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.stage_name}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (!selectedArtistId || collaboratorIds.length >= 7) return;
                setCollaboratorIds((prev) => [...prev, Number(selectedArtistId)]);
                setSelectedArtistId("");
              }}
              disabled={!selectedArtistId || collaboratorIds.length >= 7}
            >
              + Pievienot artistu
            </button>
          </div>
          <div className="collaborator-tags">
            {collaboratorIds.map((artistId, index) => {
              const artist = artists.find((item) => item.id === artistId);
              if (!artist) return null;
              return (
                <span className="collaborator-tag" key={artistId}>
                  {index === 0 ? "Primary: " : ""}{artist.stage_name}
                  <button
                    type="button"
                    onClick={() => setCollaboratorIds((prev) => prev.filter((id) => id !== artistId))}
                    disabled={index === 0 && artist.user_id === user?.id}
                    title={index === 0 && artist.user_id === user?.id ? "Galveno autoru nevar noņemt" : "Noņemt"}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
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
        <button type="submit" disabled={submitting}>Drop release</button>
      </form>

      <p className="small-text">Pec publicesanas relize paradisies kataloga. <Link to="/">Atvert katalogu</Link></p>
    </section>
  );
}
