import { useState } from "react";
import { api } from "../api";

export function ForgotPasswordPage() {
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
    <section className="panel auth-panel">
      <h2>Paroles atjaunosana</h2>
      <p className="muted">Ievadi savu e-pastu, un mes nosutisim paroles atjaunosanas saiti.</p>
      <form className="form-grid" onSubmit={submit}>
        <input type="email" placeholder="E-pasts" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit" disabled={loading}>Nosutit saiti</button>
      </form>
      {message && <p className="ok">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
