import { useState } from "react";
import { api } from "../api";

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

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
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
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? "Neizdevas pieslegties.");
    }
  };

  return (
    <section className="panel">
      <h2>{mode === "login" ? "Pieslegsanas" : "Registracija"}</h2>
      <form className="form-grid" onSubmit={submit}>
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
        <button type="submit">{mode === "login" ? "Ienakt" : "Izveidot kontu"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <button className="link-btn" onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}>
        {mode === "login" ? "Nav konta? Registreties" : "Jau ir konts? Pieslegties"}
      </button>
    </section>
  );
}
