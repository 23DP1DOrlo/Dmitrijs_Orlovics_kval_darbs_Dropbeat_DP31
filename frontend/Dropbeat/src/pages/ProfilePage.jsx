import { useEffect, useState } from "react";
import { api } from "../api";

export function ProfilePage({ user }) {
  const [baseProfile, setBaseProfile] = useState(null);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [baseForm, setBaseForm] = useState({
    name: "",
    email: "",
  });
  const [form, setForm] = useState({
    stage_name: "",
    country: "LV",
    city: "",
    label_name: "",
    bio: "",
    instagram_url: "",
    youtube_url: "",
  });

  useEffect(() => {
    api.get("/me/profile").then(({ data }) => {
      setBaseProfile(data);
      setBaseForm({
        name: data.name ?? "",
        email: data.email ?? "",
      });
    }).catch(() => {});

    if (user?.role !== "artist") {
      return;
    }

    api.get("/me/artist-profile").then(({ data }) => {
      setProfile(data);
      setForm({
        stage_name: data.stage_name ?? "",
        country: data.country ?? "LV",
        city: data.profile?.city ?? "",
        label_name: data.profile?.label_name ?? "",
        bio: data.profile?.bio ?? "",
        instagram_url: data.profile?.instagram_url ?? "",
        youtube_url: data.profile?.youtube_url ?? "",
      });
    });
  }, [user]);

  const submitBase = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const { data } = await api.put("/me/profile", baseForm);
      setBaseProfile(data);
      localStorage.setItem("dropbeat_user", JSON.stringify(data));
      setMessage("Pamata profils atjaunots.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevas atjaunot profilu.");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const { data } = await api.put("/me/artist-profile", form);
      setProfile(data);
      setMessage("Makslinieka profils veiksmigi atjaunots.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevas atjaunot makslinieka profilu.");
    }
  };

  return (
    <section className="panel">
      <h2>Profils</h2>
      {message && <p className="ok">{message}</p>}
      {error && <p className="error">{error}</p>}
      <div className="profile-head">
        <div className="avatar">{(baseForm.name || "U").slice(0, 1).toUpperCase()}</div>
        <div>
          <h3>{baseForm.name || "Lietotajs"}</h3>
          <p className="muted">Konts: {baseProfile?.email ?? user?.email}</p>
        </div>
      </div>
      <form className="form-grid" onSubmit={submitBase}>
        <input value={baseForm.name} onChange={(e) => setBaseForm((p) => ({ ...p, name: e.target.value }))} placeholder="Vards" />
        <input value={baseForm.email} onChange={(e) => setBaseForm((p) => ({ ...p, email: e.target.value }))} placeholder="E-pasts" />
        <button type="submit">Saglabat pamata profilu</button>
      </form>

      {user?.role === "artist" && (
        <>
          <h3>Makslinieka profils</h3>
          <div className="profile-head">
            <div className="avatar">{(form.stage_name || "A").slice(0, 1).toUpperCase()}</div>
            <div>
              <h3>{form.stage_name || "Makslinieks"}</h3>
              <p className="muted">Konts: {profile?.user?.email ?? user.email}</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={submit}>
            <input value={form.stage_name} onChange={(e) => setForm((p) => ({ ...p, stage_name: e.target.value }))} placeholder="Skatuves vards" />
            <input value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} placeholder="Valsts kods" />
            <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="Pilseta" />
            <input value={form.label_name} onChange={(e) => setForm((p) => ({ ...p, label_name: e.target.value }))} placeholder="Leibls" />
            <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Bio" rows={4} />
            <input value={form.instagram_url} onChange={(e) => setForm((p) => ({ ...p, instagram_url: e.target.value }))} placeholder="Instagram URL" />
            <input value={form.youtube_url} onChange={(e) => setForm((p) => ({ ...p, youtube_url: e.target.value }))} placeholder="YouTube URL" />
            <button type="submit">Atjaunot makslinieka profilu</button>
          </form>
        </>
      )}
    </section>
  );
}
