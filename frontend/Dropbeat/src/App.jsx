import './App.css'
import { NavLink, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { MyReleasesPage } from "./pages/MyReleasesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReleaseDetailsPage } from "./pages/ReleaseDetailsPage";
import { ReleasesPage } from "./pages/ReleasesPage";
import { StudioPage } from "./pages/StudioPage";
import { StatsPage } from "./pages/StatsPage";

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("dropbeat_token");
    const raw = localStorage.getItem("dropbeat_user");
    if (!token || !raw) {
      return null;
    }
    return JSON.parse(raw);
  });
  const [sessionError, setSessionError] = useState("");

  const logout = () => {
    localStorage.removeItem("dropbeat_token");
    localStorage.removeItem("dropbeat_user");
    setUser(null);
  };

  useEffect(() => {
    const onUnauthenticated = () => {
      logout();
      setSessionError("Sesija beidzas. Ludzu, piesledzies velreiz.");
    };

    window.addEventListener("dropbeat:unauthenticated", onUnauthenticated);
    return () => window.removeEventListener("dropbeat:unauthenticated", onUnauthenticated);
  }, []);

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="tag">DropBeat</p>
          <h1>Muzikas relizu platforma</h1>
          <p className="subtitle">Publice, parvaldi un analize relizes vienota tumsa stila paneli.</p>
        </div>
        <div className="top-actions">
          {user ? (
            <div className="user-block">
              <span className="muted">{user.name} ({user.role})</span>
              <button onClick={logout}>Iziet</button>
            </div>
          ) : (
            <span className="muted">Viesu rezims</span>
          )}
        </div>
      </header>

      <nav className="nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/discover">Discover</NavLink>
        <NavLink to="/">Relizes</NavLink>
        {user?.role === "artist" && <NavLink to="/my-releases">My Releases</NavLink>}
        {user?.role === "artist" && <NavLink to="/studio">Studio</NavLink>}
        <NavLink to="/stats">Statistika</NavLink>
        <NavLink to="/profile">Profils</NavLink>
        {!user && <NavLink to="/auth">Ienakt</NavLink>}
      </nav>

      <section className="content-wrap">
        {sessionError && <p className="error">{sessionError}</p>}
        <Routes>
          <Route path="/dashboard" element={<DashboardPage user={user} />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/" element={<ReleasesPage user={user} />} />
          <Route path="/releases/:releaseId" element={<ReleaseDetailsPage user={user} />} />
          <Route path="/my-releases" element={<MyReleasesPage user={user} />} />
          <Route path="/studio" element={<StudioPage user={user} />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/auth" element={<AuthPage onAuth={setUser} />} />
        </Routes>
      </section>
    </div>
  )
}

export default App
