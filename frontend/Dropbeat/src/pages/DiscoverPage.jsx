import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export function DiscoverPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/releases", { params: { sort_by: "release_date", sort_dir: "desc" } }).then(({ data }) => {
      setRows(data.data ?? []);
    }).catch(() => {});
  }, []);

  return (
    <section className="panel">
      <h2>Discover</h2>
      <p className="muted">Atlasito relizu izlase klausitajiem un A&R komandai.</p>
      <div className="release-grid">
        {rows.map((item) => (
          <article className="card" key={item.id}>
            <p className="tag">{item.type}</p>
            <h3>{item.title}</h3>
            <Link to={`/releases/${item.id}`}>Skatit detalas</Link>
            <p>{item.artist?.stage_name}</p>
            <small>{item.genre?.name} | {item.release_date}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
