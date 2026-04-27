import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { CoverImage } from "../components/CoverImage";

export function MyReleasesPage({ user, t = (key, fallback) => fallback }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "artist") {
      return;
    }

    api.get("/me/artist-profile")
      .then(({ data: artist }) => api.get("/releases", { params: { artist_id: artist.id, sort_by: "release_date", sort_dir: "desc" } }))
      .then(({ data }) => setRows(data.data ?? []))
      .catch(() => setError(t("pages.myReleases.loadError", "Neizdevas ieladet tavas relizes.")));
  }, [user]);

  if (user?.role !== "artist") {
    return <section className="panel"><h2>{t("pages.myReleases.title", "My Releases")}</h2><p>{t("pages.myReleases.onlyArtists", "Tikai maksliniekiem.")}</p></section>;
  }

  return (
    <section className="panel">
      <h2>{t("pages.myReleases.title", "My Releases")}</h2>
      {error && <p className="error">{error}</p>}
      <div className="release-grid">
        {rows.map((item) => (
          <article className="card clickable-card" key={item.id} onClick={() => navigate(`/releases/${item.id}`)}>
            {item.cover_url && <CoverImage className="cover-image" src={item.cover_url} alt={item.title} />}
            <h3>{item.title}</h3>
            <p>{item.genre?.name}</p>
            <small>{item.release_date} | {item.type.toUpperCase()}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
