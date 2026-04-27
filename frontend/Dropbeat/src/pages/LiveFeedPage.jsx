import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { CoverImage } from "../components/CoverImage";

export function LiveFeedPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/releases", { params: { sort_by: "created_at", sort_dir: "desc" } })
      .then(({ data }) => setRows(data.data ?? []))
      .catch(() => {});
  }, []);

  return (
    <section className="panel">
      <h2>Live Feed</h2>
      <p className="muted">Jaunakas aktivitates platforma.</p>
      <div className="timeline">
        {rows.slice(0, 12).map((item) => (
          <article className="card clickable-card" key={item.id} onClick={() => navigate(`/releases/${item.id}`)}>
            {item.cover_url && <CoverImage className="cover-image" src={item.cover_url} alt={item.title} />}
            <p className="tag">{item.type}</p>
            <h3>{item.title}</h3>
            <p>{item.artist?.stage_name}</p>
            <small>Publicets: {item.created_at?.slice(0, 10) ?? "n/a"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
