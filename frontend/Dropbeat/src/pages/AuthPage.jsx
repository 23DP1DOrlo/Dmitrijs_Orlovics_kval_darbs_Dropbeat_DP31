import { useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "artist",
    stage_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;
      const { data } = await api.post(endpoint, payload);
      localStorage.setItem("dropbeat_token", data.token);
      localStorage.setItem("dropbeat_user", JSON.stringify(data.user));
      onAuth(data.user);
      window.dispatchEvent(new CustomEvent("dropbeat:toast", {
        detail: {
          type: "success",
          message: mode === "login" ? "Veiksmiga pieslegsanas kontam" : "Konts veiksmigi izveidots",
        },
      }));
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]?.[0];
        setError(firstError ?? "Neizdevas pieslegties.");
      } else {
        setError(requestError?.response?.data?.message ?? "Neizdevas pieslegties.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <section className="panel auth-panel">
        <header className="auth-head">
          <p className="tag">DropBeat Access</p>
          <h2>{mode === "login" ? "Pieslegsanas" : "Registracija"}</h2>
          <p className="muted">{mode === "login" ? "Ienac sava konta un turpini darbu ar relizem." : "Izveido jaunu kontu un izvelies savu lomu platforma."}</p>
        </header>

        <form className="form-grid auth-form-grid" onSubmit={submit}>
          {mode === "register" && (
            <>
              <input placeholder="Vards" value={form.name} onChange={(e) => update("name", e.target.value)} />
              <input
                placeholder="Skatuves vards"
                value={form.stage_name}
                onChange={(e) => update("stage_name", e.target.value)}
              />
              <select value={form.role} onChange={(e) => update("role", e.target.value)}>
                <option value="artist">Makslinieks</option>
                <option value="listener">Klausitajs</option>
              </select>
              <p className="small-text auth-form-note">Izvelies lomu: artist vai listener.</p>
            </>
          )}
          <input type="email" placeholder="E-pasts" value={form.email} onChange={(e) => update("email", e.target.value)} />
          <input type="password" placeholder="Parole" value={form.password} onChange={(e) => update("password", e.target.value)} />
          {mode === "register" && (
            <input
              type="password"
              placeholder="Atkartot paroli"
              value={form.password_confirmation}
              onChange={(e) => update("password_confirmation", e.target.value)}
            />
          )}
          <button type="submit" disabled={loading}>{mode === "login" ? "Ienakt" : "Izveidot kontu"}</button>
        </form>
        {error && <p className="error auth-message">{error}</p>}
        <div className="auth-actions-row">
          {mode === "login" && <Link to="/forgot-password">Aizmirsu paroli</Link>}
          <button className="link-btn" onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}>
            {mode === "login" ? "Nav konta? Registreties" : "Jau ir konts? Pieslegties"}
          </button>
        </div>
      </section>
    </div>
  );
}
