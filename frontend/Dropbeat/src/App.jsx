import './App.css'
import { NavLink, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthPage } from "./pages/AuthPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { LiveFeedPage } from "./pages/LiveFeedPage";
import { MyReleasesPage } from "./pages/MyReleasesPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReleaseRadarPage } from "./pages/ReleaseRadarPage";
import { ReleaseDetailsPage } from "./pages/ReleaseDetailsPage";
import { ReleasesPage } from "./pages/ReleasesPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { StudioPage } from "./pages/StudioPage";
import { StatsPage } from "./pages/StatsPage";
import { UserCommentsPage } from "./pages/UserCommentsPage";
import { UserProfileInsightsPage } from "./pages/UserProfileInsightsPage";

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
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("dropbeat_theme") ?? "dark");

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

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("dropbeat_theme", theme);
  }, [theme]);

  useEffect(() => {
    const onToast = (event) => {
      setToast(event.detail);
      window.clearTimeout(window.__dropbeatToastTimer);
      window.__dropbeatToastTimer = window.setTimeout(() => setToast(null), 2600);
    };
    window.addEventListener("dropbeat:toast", onToast);
    return () => window.removeEventListener("dropbeat:toast", onToast);
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo-badge">DB</div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard"><span>📊</span><span>Dashboard</span></NavLink>
          <NavLink to="/discover"><span>✨</span><span>Discover</span></NavLink>
          <NavLink to="/"><span>🎵</span><span>Relizes</span></NavLink>
          <NavLink to="/live-feed"><span>🛰️</span><span>Live Feed</span></NavLink>
          <NavLink to="/leaderboard"><span>🏆</span><span>Leaderboard</span></NavLink>
          <NavLink to="/radar"><span>📡</span><span>Release Radar</span></NavLink>
          <NavLink to="/onboarding"><span>🚀</span><span>Onboarding</span></NavLink>
          {user?.role === "artist" && <NavLink to="/my-releases"><span>🗂️</span><span>My Releases</span></NavLink>}
          {user?.role === "artist" && <NavLink to="/studio"><span>🎛️</span><span>Studio</span></NavLink>}
          <NavLink to="/stats"><span>📈</span><span>Statistika</span></NavLink>
          <NavLink to="/users"><span>👥</span><span>User Insights</span></NavLink>
          {user?.role === "admin" && <NavLink to="/admin/users"><span>🛡️</span><span>Admin Users</span></NavLink>}
          <NavLink to="/profile"><span>🧑</span><span>Profils</span></NavLink>
        </nav>
      </aside>

      <main className="page">
        <header className="hero">
          <div>
            <p className="tag">DropBeat</p>
            <h1>Muzikas relizu platforma</h1>
            <p className="subtitle">Publice, parvaldi un analize relizes vienota tumsa stila paneli.</p>
          </div>
          <div className="top-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            {user ? (
              <div className="user-block">
                <span className="muted">{user.name} ({user.role})</span>
                <button onClick={logout}>Iziet</button>
              </div>
            ) : (
              <div className="auth-actions">
                <NavLink className="ghost-btn" to="/auth">Ienakt</NavLink>
                <NavLink className="primary-btn" to="/auth">Registracija</NavLink>
              </div>
            )}
          </div>
        </header>

        <section className="content-wrap">
          {sessionError && <p className="error">{sessionError}</p>}
          <Routes>
            <Route path="/dashboard" element={<DashboardPage user={user} />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/" element={<ReleasesPage user={user} />} />
            <Route path="/live-feed" element={<LiveFeedPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/radar" element={<ReleaseRadarPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/releases/:releaseId" element={<ReleaseDetailsPage user={user} />} />
            <Route path="/my-releases" element={<MyReleasesPage user={user} />} />
            <Route path="/studio" element={<StudioPage user={user} />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/users" element={<UserCommentsPage />} />
            <Route path="/users/:userId" element={<UserProfileInsightsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage user={user} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/auth" element={<AuthPage onAuth={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </section>
      </main>
      {toast && <div className={`toast ${toast.type ?? "info"}`}>{toast.message}</div>}
    </div>
  )
}

export default App
