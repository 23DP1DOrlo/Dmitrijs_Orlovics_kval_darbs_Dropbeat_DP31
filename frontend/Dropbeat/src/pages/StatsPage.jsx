import { useEffect, useState } from "react";
import { api } from "../api";

export function StatsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/stats/genres").then(({ data }) => setRows(data));
  }, []);

  return (
    <section className="panel">
      <h2>Statistika pa zanriem</h2>
      <table>
        <thead>
          <tr>
            <th>Zanrs</th>
            <th>Streams</th>
            <th>Likes</th>
            <th>Relizu skaits</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.genre}>
              <td>{row.genre}</td>
              <td>{row.total_streams}</td>
              <td>{row.total_likes}</td>
              <td>{row.release_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
