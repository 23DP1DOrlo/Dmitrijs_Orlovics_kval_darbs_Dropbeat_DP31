import { useEffect, useState } from "react";
import { api } from "../api";

const defaultFilter = { q: "", genre_id: "", type: "", sort_by: "release_date", sort_dir: "desc" };

export function ReleasesPage({ user }) {
  const [items, setItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [form, setForm] = useState({ title: "", genre_id: "", release_date: "", type: "single" });

  const loadGenres = async () => {
    const { data } = await api.get("/genres");
    setGenres(data);
  };

  const loadReleases = async () => {
    const params = Object.fromEntries(Object.entries(filter).filter(([, v]) => v !== ""));
    const { data } = await api.get("/releases", { params });
    setItems(data.data ?? []);
  };

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    loadReleases();
  }, [filter]);

  const onCreate = async (event) => {
    event.preventDefault();
    const profile = await api.get("/me/artist-profile");
    await api.post("/releases", {
      ...form,
      artist_id: profile.data.id,
      genre_id: Number(form.genre_id),
      is_published: true,
    });
    setForm({ title: "", genre_id: "", release_date: "", type: "single" });
    loadReleases();
  };

  return (
    <section className="panel">
      <h2>Relizu katalogs</h2>
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
      </div>

      <div className="release-grid">
        {items.map((item) => (
          <article key={item.id} className="card">
            <h3>{item.title}</h3>
            <p>{item.artist?.stage_name} - {item.genre?.name}</p>
            <small>{item.release_date} | {item.type}</small>
          </article>
        ))}
      </div>

      {user?.role === "artist" && (
        <>
          <h3>Jauns relize</h3>
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
            <button type="submit">Saglabat relizi</button>
          </form>
        </>
      )}
    </section>
  );
}
