import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";

export function ResetPasswordPage({ t = (key, fallback) => fallback }) {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const email = useMemo(() => searchParams.get("email") ?? "", [searchParams]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage("Parole veiksmigi atjaunota. Tagad vari ienakt ar jauno paroli.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevas atjaunot paroli.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="auth-screen">
        <section className="panel auth-panel compact-auth-panel">
          <h2>{t("auth.resetTitle", "Paroles atjaunosana")}</h2>
          <p className="error auth-message">{t("auth.invalidResetLink", "Nederiga atjaunosanas saite. Pieprasi jaunu saiti velreiz.")}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <section className="panel auth-panel compact-auth-panel">
        <header className="auth-head">
          <p className="tag">{t("auth.security", "Security")}</p>
          <h2>{t("auth.setNewPassword", "Iestati jaunu paroli")}</h2>
          <p className="muted">{email}</p>
        </header>
        <form className="form-grid auth-form-grid single-column" onSubmit={submit}>
          <input
            type="password"
            placeholder={t("auth.newPassword", "Jauna parole")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t("auth.repeatNewPassword", "Atkartot jauno paroli")}
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>{loading ? t("auth.saving", "Saglabaju...") : t("auth.savePassword", "Saglabat paroli")}</button>
        </form>
        {message && <p className="ok auth-message">{message}</p>}
        {error && <p className="error auth-message">{error}</p>}
      </section>
    </div>
  );
}
