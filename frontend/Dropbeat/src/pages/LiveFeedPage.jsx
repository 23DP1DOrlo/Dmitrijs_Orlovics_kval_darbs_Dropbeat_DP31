import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { CoverImage } from "../components/CoverImage";
import { ArtistIdentity } from "../components/ArtistIdentity";

export function LiveFeedPage({ t = (key, fallback) => fallback }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/releases", { params: { sort_by: "created_at", sort_dir: "desc" } })
      .then(({ data }) => setRows(data.data ?? []))
      .catch(() => {});
  }, []);

  return (
    <section className="panel">
      <h2>{t("pages.liveFeed.title", "Aktivitāšu plūsma")}</h2>
      <p className="muted">{t("pages.liveFeed.subtitle", "Jaunākās aktivitātes platformā.")}</p>
      <div className="timeline">
        {rows.slice(0, 12).map((item) => (
          <article className="card clickable-card" key={item.id} onClick={() => navigate(`/releases/${item.id}`)}>
            {item.cover_url && <CoverImage className="cover-image" src={item.cover_url} alt={item.title} />}
            <p className="tag">{item.type}</p>
            <h3>{item.title}</h3>
            <p><ArtistIdentity artist={item.artist} unknown={t("common.unknownArtist", "Nezināms mākslinieks")} /></p>
            <small>{t("pages.liveFeed.published", "Publicēts")}: {item.created_at?.slice(0, 10) ?? "n/a"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
