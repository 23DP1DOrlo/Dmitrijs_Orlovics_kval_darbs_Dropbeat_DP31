import { useState } from "react";
import { api } from "../api";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function AuthPage({ onAuth, t = (key, fallback) => fallback }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoverShowPassword, setHoverShowPassword] = useState(false);
  const [hoverShowPasswordConfirm, setHoverShowPasswordConfirm] = useState(false);
  const [pinShowPassword, setPinShowPassword] = useState(false);
  const [pinShowPasswordConfirm, setPinShowPasswordConfirm] = useState(false);
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
      const redirectParam = new URLSearchParams(location.search).get("redirect") ?? "";
      const safeRedirect = redirectParam.startsWith("/") ? redirectParam : "/dashboard";
      navigate(safeRedirect, { replace: true });
      window.dispatchEvent(new CustomEvent("dropbeat:toast", {
        detail: {
          type: "success",
          message: mode === "login" ? "Veiksmīga pieslēgšanās kontam" : "Konts veiksmīgi izveidots",
        },
      }));
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]?.[0];
        setError(firstError ?? "Neizdevās pieslēgties.");
      } else {
        setError(requestError?.response?.data?.message ?? "Neizdevās pieslēgties.");
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
          <p className="tag">{t("auth.accessTag", "DropBeat piekļuve")}</p>
          <h1>{t("auth.heroTitle", "Relīžu platforma jaunā līmenī")}</h1>
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
            <h2>{mode === "login" ? t("auth.loginTitle", "Pieslēgšanās") : t("auth.registerTitle", "Reģistrācija")}</h2>
            <p className="muted">{mode === "login" ? t("auth.loginSubtitle", "Ienāc savā kontā un turpini darbu ar relīzēm.") : t("auth.registerSubtitle", "Izveido jaunu kontu un izvēlies savu lomu platformā.")}</p>
          </header>

          <form className="form-grid auth-form-grid" onSubmit={submit}>
            {mode === "register" && (
              <>
                <input placeholder={t("auth.name", "Vārds")} value={form.name} onChange={(e) => update("name", e.target.value)} />
                <input
                  placeholder={t("auth.stageName", "Skatuves vārds")}
                  value={form.stage_name}
                  onChange={(e) => update("stage_name", e.target.value)}
                />
                <select value={form.role} onChange={(e) => update("role", e.target.value)}>
                  <option value="artist">{t("auth.artistRole", "Mākslinieks")}</option>
                  <option value="listener">{t("auth.listenerRole", "Klausītājs")}</option>
                </select>
                <p className="small-text auth-form-note">{t("auth.roleHint", "Izvēlies lomu: mākslinieks vai klausītājs.")}</p>
              </>
            )}
            <input type="email" placeholder={t("auth.email", "E-pasts")} value={form.email} onChange={(e) => update("email", e.target.value)} />
            <div className="auth-password-field">
              <input
                type={hoverShowPassword || pinShowPassword ? "text" : "password"}
                placeholder={t("auth.password", "Parole")}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
              <div className="auth-password-actions">
                <span
                  className="auth-password-hover-hint"
                  onMouseEnter={() => setHoverShowPassword(true)}
                  onMouseLeave={() => setHoverShowPassword(false)}
                  onFocus={() => setHoverShowPassword(true)}
                  onBlur={() => setHoverShowPassword(false)}
                  onClick={() => setPinShowPassword((prev) => !prev)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setPinShowPassword((prev) => !prev);
                    }
                  }}
                  tabIndex={0}
                >
                  show password
                </span>
              </div>
            </div>
            {mode === "register" && (
              <div className="auth-password-field">
                <input
                  type={hoverShowPasswordConfirm || pinShowPasswordConfirm ? "text" : "password"}
                  placeholder={t("auth.repeatPassword", "Atkartot paroli")}
                  value={form.password_confirmation}
                  onChange={(e) => update("password_confirmation", e.target.value)}
                />
                <div className="auth-password-actions">
                  <span
                    className="auth-password-hover-hint"
                    onMouseEnter={() => setHoverShowPasswordConfirm(true)}
                    onMouseLeave={() => setHoverShowPasswordConfirm(false)}
                    onFocus={() => setHoverShowPasswordConfirm(true)}
                    onBlur={() => setHoverShowPasswordConfirm(false)}
                    onClick={() => setPinShowPasswordConfirm((prev) => !prev)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setPinShowPasswordConfirm((prev) => !prev);
                      }
                    }}
                    tabIndex={0}
                  >
                    show password
                  </span>
                </div>
              </div>
            )}
            <button type="submit" disabled={loading}>{mode === "login" ? t("auth.signIn", "Ienākt") : t("auth.createAccount", "Izveidot kontu")}</button>
          </form>
          {error && <p className="error auth-message">{error}</p>}
          <div className="auth-actions-row">
            {mode === "login" && <Link to="/forgot-password">{t("auth.forgotPassword", "Aizmirsu paroli")}</Link>}
            <button className="link-btn" onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}>
              {mode === "login" ? t("auth.noAccount", "Nav konta? Reģistrēties") : t("auth.haveAccount", "Jau ir konts? Pieslēgties")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
