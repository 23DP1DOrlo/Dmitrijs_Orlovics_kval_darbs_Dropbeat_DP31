import './App.css'
import { NavLink, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { AuthPage } from "./pages/AuthPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReleasesPage } from "./pages/ReleasesPage";
import { StatsPage } from "./pages/StatsPage";

function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("dropbeat_user");
    return raw ? JSON.parse(raw) : null;
  });

  const logout = () => {
    localStorage.removeItem("dropbeat_token");
    localStorage.removeItem("dropbeat_user");
    setUser(null);
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="tag">DropBeat</p>
          <h1>Muzikas relizu platforma</h1>
        </div>
        <div className="top-actions">
          {user ? <button onClick={logout}>Iziet</button> : <span className="muted">Viesu rezims</span>}
        </div>
      </header>

      <nav className="nav">
        <NavLink to="/">Relizes</NavLink>
        <NavLink to="/stats">Statistika</NavLink>
        <NavLink to="/profile">Profils</NavLink>
        {!user && <NavLink to="/auth">Ienakt</NavLink>}
      </nav>

      <Routes>
        <Route path="/" element={<ReleasesPage user={user} />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        <Route path="/auth" element={<AuthPage onAuth={setUser} />} />
      </Routes>
    </div>
  )
}

export default App
