import { useState } from "react";
import { api } from "../api";
import { Link, useNavigate } from "react-router-dom";

export function AuthPage({ onAuth, t = (key, fallback) => fallback }) {
  const navigate = useNavigate();
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
      navigate("/dashboard", { replace: true });
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
      <div className="auth-backdrop" />
      <section className="auth-panel auth-panel-modern">
        <aside className="auth-visual">
          <p className="tag">{t("auth.accessTag", "DropBeat Access")}</p>
          <h1>{t("auth.heroTitle", "Release platforma jaunam limenim")}</h1>
          <p>
            {t("auth.heroSubtitle", "Publice relizes, sadarbojies ar citiem artistiem un redzi realu statistiku viena moderna paneli.")}
          </p>
          <div className="auth-visual-bullets">
            <span>AI-ready studio workflow</span>
            <span>Live release analytics</span>
            <span>Collab-first publishing</span>
          </div>
        </aside>

        <div className="auth-form-shell">
          <header className="auth-head">
            <h2>{mode === "login" ? t("auth.loginTitle", "Pieslegsanas") : t("auth.registerTitle", "Registracija")}</h2>
            <p className="muted">{mode === "login" ? t("auth.loginSubtitle", "Ienac sava konta un turpini darbu ar relizem.") : t("auth.registerSubtitle", "Izveido jaunu kontu un izvelies savu lomu platforma.")}</p>
          </header>

          <form className="form-grid auth-form-grid" onSubmit={submit}>
            {mode === "register" && (
              <>
                <input placeholder={t("auth.name", "Vards")} value={form.name} onChange={(e) => update("name", e.target.value)} />
                <input
                  placeholder={t("auth.stageName", "Skatuves vards")}
                  value={form.stage_name}
                  onChange={(e) => update("stage_name", e.target.value)}
                />
                <select value={form.role} onChange={(e) => update("role", e.target.value)}>
                  <option value="artist">{t("auth.artistRole", "Makslinieks")}</option>
                  <option value="listener">{t("auth.listenerRole", "Klausitajs")}</option>
                </select>
                <p className="small-text auth-form-note">{t("auth.roleHint", "Izvelies lomu: artist vai listener.")}</p>
              </>
            )}
            <input type="email" placeholder={t("auth.email", "E-pasts")} value={form.email} onChange={(e) => update("email", e.target.value)} />
            <input type="password" placeholder={t("auth.password", "Parole")} value={form.password} onChange={(e) => update("password", e.target.value)} />
            {mode === "register" && (
              <input
                type="password"
                placeholder={t("auth.repeatPassword", "Atkartot paroli")}
                value={form.password_confirmation}
                onChange={(e) => update("password_confirmation", e.target.value)}
              />
            )}
            <button type="submit" disabled={loading}>{mode === "login" ? t("auth.signIn", "Ienakt") : t("auth.createAccount", "Izveidot kontu")}</button>
          </form>
          {error && <p className="error auth-message">{error}</p>}
          <div className="auth-actions-row">
            {mode === "login" && <Link to="/forgot-password">{t("auth.forgotPassword", "Aizmirsu paroli")}</Link>}
            <button className="link-btn" onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}>
              {mode === "login" ? t("auth.noAccount", "Nav konta? Registreties") : t("auth.haveAccount", "Jau ir konts? Pieslegties")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
