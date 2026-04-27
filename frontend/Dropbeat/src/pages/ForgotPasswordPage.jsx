import { useState } from "react";
import { api } from "../api";

export function ForgotPasswordPage({ t = (key, fallback) => fallback }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api.post("/auth/forgot-password", { email });
      setMessage("Ja e-pasts eksiste sistema, atjaunosanas saite ir nosutita.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevas nosutit saiti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <section className="panel auth-panel compact-auth-panel">
        <header className="auth-head">
          <p className="tag">{t("auth.security", "Security")}</p>
          <h2>{t("auth.forgotTitle", "Paroles atjaunosana")}</h2>
          <p className="muted">{t("auth.forgotSubtitle", "Ievadi e-pastu, un mes nosutisim paroles atjaunosanas saiti.")}</p>
        </header>
        <form className="form-grid auth-form-grid single-column" onSubmit={submit}>
          <input type="email" placeholder={t("auth.email", "E-pasts")} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" disabled={loading}>{t("auth.sendLink", "Nosutit saiti")}</button>
        </form>
        {message && <p className="ok auth-message">{message}</p>}
        {error && <p className="error auth-message">{error}</p>}
      </section>
    </div>
  );
}
