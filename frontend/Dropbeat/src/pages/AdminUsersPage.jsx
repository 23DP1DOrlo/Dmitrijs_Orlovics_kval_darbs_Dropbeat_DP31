import { useEffect, useState } from "react";
import { api } from "../api";

const initialForm = {
  name: "",
  email: "",
  role: "listener",
  stage_name: "",
  country: "LV",
  city: "",
  label_name: "",
  bio: "",
  instagram_url: "",
  youtube_url: "",
};

export function AdminUsersPage({ user }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async (search = "") => {
    try {
      setError("");
      const { data } = await api.get("/admin/users", { params: { query: search } });
      setUsers(data.data ?? []);
    } catch {
      setError("Neizdevās ielādēt lietotājus.");
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers();
    }
  }, [user]);

  const selectUser = async (target) => {
    try {
      const { data } = await api.get(`/admin/users/${target.id}`);
      setSelected(data);
      setForm({
        name: data.name ?? "",
        email: data.email ?? "",
        role: data.role ?? "listener",
        stage_name: data.artist?.stage_name ?? "",
        country: data.artist?.country ?? "LV",
        city: data.artist?.profile?.city ?? "",
        label_name: data.artist?.profile?.label_name ?? "",
        bio: data.artist?.profile?.bio ?? "",
        instagram_url: data.artist?.profile?.instagram_url ?? "",
        youtube_url: data.artist?.profile?.youtube_url ?? "",
      });
    } catch {
      setError("Neizdevās ielādēt pilnu lietotāja profilu.");
    }
  };

  const save = async (event) => {
    event.preventDefault();
    if (!selected) return;
    try {
      await api.put(`/admin/users/${selected.id}`, form);
      setMessage("Profils atjaunots.");
      loadUsers(query);
      selectUser(selected);
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevās saglabāt izmaiņas.");
    }
  };

  const remove = async () => {
    if (!selected) return;
    try {
      await api.delete(`/admin/users/${selected.id}`);
      setMessage("Lietotājs dzēsts.");
      setSelected(null);
      setForm(initialForm);
      loadUsers(query);
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevās dzēst lietotāju.");
    }
  };

  const removeArtistAvatar = async () => {
    if (!selected?.artist?.id) return;
    try {
      setError("");
      await api.delete(`/admin/artists/${selected.artist.id}/avatar`);
      setMessage("Avatars dzēsts.");
      await selectUser(selected);
      loadUsers(query);
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevās dzēst avataru.");
    }
  };

  if (user?.role !== "admin") {
    return <section className="panel"><h2>Admin panelis</h2><p>Pieeja tikai administratoram.</p></section>;
  }

  return (
    <section className="panel">
      <h2>Admin User Manager</h2>
      {message && <p className="ok">{message}</p>}
      {error && <p className="error">{error}</p>}
      <div className="filters">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Meklēt pēc vārda vai nika" />
        <button type="button" onClick={() => loadUsers(query)}>Meklēt</button>
      </div>
      <div className="kpi-grid">
        {users.map((u) => (
          <article key={u.id} className={`card clickable-card ${selected?.id === u.id ? "active-card" : ""}`} onClick={() => selectUser(u)}>
            <h3>{u.name}</h3>
            <p>{u.email}</p>
            <small>{u.role}</small>
          </article>
        ))}
      </div>

      {selected && (
        <form className="form-grid" onSubmit={save}>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Vārds" />
          <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="E-pasts" />
          <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
            <option value="listener">listener</option>
            <option value="artist">artist</option>
            <option value="admin">admin</option>
          </select>
          <input value={form.stage_name} onChange={(e) => setForm((p) => ({ ...p, stage_name: e.target.value }))} placeholder="Skatuves vārds" />
          <input value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} placeholder="Valsts kods" />
          <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="Pilsēta" />
          <input value={form.label_name} onChange={(e) => setForm((p) => ({ ...p, label_name: e.target.value }))} placeholder="Leibls" />
          <input value={form.instagram_url} onChange={(e) => setForm((p) => ({ ...p, instagram_url: e.target.value }))} placeholder="Instagram URL" />
          <input value={form.youtube_url} onChange={(e) => setForm((p) => ({ ...p, youtube_url: e.target.value }))} placeholder="YouTube URL" />
          {selected.artist?.profile?.avatar_url && (
            <>
              <img
                src={selected.artist.profile.avatar_url}
                alt="Artist avatar"
                style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "999px", border: "1px solid var(--border)" }}
              />
              <button type="button" className="danger" onClick={removeArtistAvatar}>Dzēst avataru</button>
            </>
          )}
          <textarea rows={4} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Bio" />
          <button type="submit">Saglabāt</button>
          <button type="button" className="danger" onClick={remove}>Dzēst lietotāju</button>
        </form>
      )}
    </section>
  );
}
