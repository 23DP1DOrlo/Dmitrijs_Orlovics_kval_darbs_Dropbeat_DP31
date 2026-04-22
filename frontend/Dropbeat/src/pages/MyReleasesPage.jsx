import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export function MyReleasesPage({ user }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "artist") {
      return;
    }

    api.get("/me/artist-profile")
      .then(({ data: artist }) => api.get("/releases", { params: { artist_id: artist.id, sort_by: "release_date", sort_dir: "desc" } }))
      .then(({ data }) => setRows(data.data ?? []))
      .catch(() => setError("Neizdevas ieladet tavas relizes."));
  }, [user]);

  if (user?.role !== "artist") {
    return <section className="panel"><h2>My Releases</h2><p>Tikai maksliniekiem.</p></section>;
  }

  return (
    <section className="panel">
      <h2>My Releases</h2>
      {error && <p className="error">{error}</p>}
      <div className="release-grid">
        {rows.map((item) => (
          <article className="card" key={item.id}>
            {item.cover_url && <img className="cover-image" src={item.cover_url} alt={item.title} />}
            <h3>{item.title}</h3>
            <p>{item.genre?.name}</p>
            <small>{item.release_date} | {item.type.toUpperCase()}</small>
            <p><Link to={`/releases/${item.id}`}>Atvert relizi</Link></p>
          </article>
        ))}
      </div>
    </section>
  );
}
