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
    avatar_url: "",
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
        avatar_url: data.profile?.avatar_url ?? "",
      });
    });
  }, [user]);

  const normalizeImageUrl = (value) => {
    if (!value) return "";
    const apiOrigin = (api.defaults.baseURL ?? "").replace("/api", "");
    if (value.startsWith("/storage/")) return `${apiOrigin}${value}`;
    if (/^https?:\/\/localhost(?::\d+)?\/storage\//.test(value)) {
      return value.replace(/^https?:\/\/localhost(?::\d+)?\/storage\//, `${apiOrigin}/storage/`);
    }
    if (/^https?:\/\/127\.0\.0\.1(?::\d+)?\/storage\//.test(value)) {
      return value.replace(/^https?:\/\/127\.0\.0\.1(?::\d+)?\/storage\//, `${apiOrigin}/storage/`);
    }
    return value;
  };

  const normalizeSocialUrl = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  };

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
      setError(requestError?.response?.data?.message ?? "Neizdevās atjaunot profilu.");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const { data } = await api.put("/me/artist-profile", form);
      setProfile(data);
      setMessage("Mākslinieka profils veiksmīgi atjaunots.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevās atjaunot mākslinieka profilu.");
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    setError("");
    setMessage("");
    setUploadingAvatar(true);
    try {
      const payload = new FormData();
      payload.append("avatar", file);
      const { data } = await api.post("/me/artist-profile/upload-avatar", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, avatar_url: data.avatar_url }));
      setProfile((prev) => (prev ? { ...prev, profile: { ...(prev.profile ?? {}), avatar_url: data.avatar_url } } : prev));
      setMessage("Avatars saglabāts. Neaizmirsti atjaunot profilu.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevās augšupielādēt avataru.");
    } finally {
      setUploadingAvatar(false);
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
          <h3>{baseForm.name || "Lietotājs"}</h3>
          <p className="muted">Konts: {baseProfile?.email ?? user?.email}</p>
        </div>
      </div>
      <form className="form-grid" onSubmit={submitBase}>
        <input value={baseForm.name} onChange={(e) => setBaseForm((p) => ({ ...p, name: e.target.value }))} placeholder="Vārds" />
        <input value={baseForm.email} onChange={(e) => setBaseForm((p) => ({ ...p, email: e.target.value }))} placeholder="E-pasts" />
        <button type="submit">Saglabāt pamata profilu</button>
      </form>

      {user?.role === "artist" && (
        <>
          <h3>Mākslinieka profils</h3>
          <div className="profile-head">
            {form.avatar_url ? (
              <img className="avatar avatar-image" src={normalizeImageUrl(form.avatar_url)} alt="Artist avatar" />
            ) : (
              <div className="avatar">{(form.stage_name || "A").slice(0, 1).toUpperCase()}</div>
            )}
            <div>
              <h3>{form.stage_name || "Mākslinieks"}</h3>
              <p className="muted">Konts: {profile?.user?.email ?? user.email}</p>
              {(form.instagram_url?.trim() || form.youtube_url?.trim()) && (
                <div className="artist-profile-social">
                  {form.instagram_url?.trim() && (
                    <a
                      className="artist-profile-social-link"
                      href={normalizeSocialUrl(form.instagram_url)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Instagram
                    </a>
                  )}
                  {form.youtube_url?.trim() && (
                    <a
                      className="artist-profile-social-link"
                      href={normalizeSocialUrl(form.youtube_url)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      YouTube
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          <form className="form-grid" onSubmit={submit}>
            <input value={form.stage_name} onChange={(e) => setForm((p) => ({ ...p, stage_name: e.target.value }))} placeholder="Skatuves vārds" />
            <input value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} placeholder="Valsts kods" />
            <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="Pilsēta" />
            <input value={form.label_name} onChange={(e) => setForm((p) => ({ ...p, label_name: e.target.value }))} placeholder="Leibls" />
            <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Bio" rows={4} />
            <input value={form.instagram_url} onChange={(e) => setForm((p) => ({ ...p, instagram_url: e.target.value }))} placeholder="Instagram URL" />
            <input value={form.youtube_url} onChange={(e) => setForm((p) => ({ ...p, youtube_url: e.target.value }))} placeholder="YouTube URL" />
            <input value={form.avatar_url} onChange={(e) => setForm((p) => ({ ...p, avatar_url: e.target.value }))} placeholder="Avatar URL" />
            <input type="file" accept="image/*" onChange={(e) => uploadAvatar(e.target.files?.[0])} />
            {uploadingAvatar && <p className="small-text">Augšupielādēju avataru...</p>}
            <button type="submit">Atjaunot mākslinieka profilu</button>
          </form>
        </>
      )}
    </section>
  );
}
