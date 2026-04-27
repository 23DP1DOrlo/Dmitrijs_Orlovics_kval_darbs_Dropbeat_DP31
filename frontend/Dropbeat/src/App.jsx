import './App.css'
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "./api";
import { CoverImage } from "./components/CoverImage";
import { AuthPage } from "./pages/AuthPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { ArtistDropPage } from "./pages/ArtistDropPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { LiveFeedPage } from "./pages/LiveFeedPage";
import { MyReleasesPage } from "./pages/MyReleasesPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { AboutPage } from "./pages/AboutPage";
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
  const location = useLocation();
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
  const [releaseFeed, setReleaseFeed] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("dropbeat_token");
    localStorage.removeItem("dropbeat_user");
    setUser(null);
    window.dispatchEvent(new CustomEvent("dropbeat:toast", { detail: { type: "success", message: "Tu veiksmigi izgaji no konta" } }));
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

  useEffect(() => {
    api.get("/releases", { params: { sort_by: "created_at", sort_dir: "desc" } })
      .then(({ data }) => setReleaseFeed((data.data ?? []).slice(0, 14)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const averageScore = (item) => {
    const values = [
      Number(item.avg_rhymes_images ?? 0),
      Number(item.avg_structure_rhythm ?? 0),
      Number(item.avg_style_execution ?? 0),
      Number(item.avg_individuality_charisma ?? 0),
    ];
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  return (
    <div className={`app-shell ${mobileMenuOpen ? "mobile-nav-open" : ""}`}>
      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="logo-badge">DB</div>
        <nav className="sidebar-nav" onClick={() => setMobileMenuOpen(false)}>
          <NavLink to="/dashboard"><span>🏠</span><span>Galvena</span></NavLink>
          <NavLink to="/about"><span>ℹ️</span><span>Par mums</span></NavLink>
          <div className="sidebar-separator" />
          <NavLink to="/discover"><span>✨</span><span>Discover</span></NavLink>
          <NavLink to="/leaderboard"><span>🏆</span><span>Leaderboard</span></NavLink>
          <NavLink to="/"><span>🎵</span><span>Relizes</span></NavLink>
          {user?.role === "artist" && <NavLink to="/my-releases"><span>🗂️</span><span>My Releases</span></NavLink>}
          {user?.role === "artist" && <NavLink to="/studio"><span>🎛️</span><span>Studio</span></NavLink>}
          <NavLink to="/users"><span>👥</span><span>User Insights</span></NavLink>
          {user?.role === "admin" && <NavLink to="/admin/users"><span>🛡️</span><span>Admin Users</span></NavLink>}
        </nav>
      </aside>
      {mobileMenuOpen && <button className="sidebar-backdrop" type="button" aria-label="Aizvert izvelni" onClick={() => setMobileMenuOpen(false)} />}

      <main className="page">
        <header className="hero">
          <div>
            <p className="tag">DropBeat</p>
            <h1>Muzikas relizu platforma</h1>
            <p className="subtitle">Publice, parvaldi un analize relizes vienota tumsa stila paneli.</p>
          </div>
          <div className="top-actions">
            <button
              className="mobile-menu-btn"
              type="button"
              aria-label={mobileMenuOpen ? "Aizvert izvelni" : "Atvert izvelni"}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              ☰ Menu
            </button>
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            {user && <NavLink className="ghost-btn profile-header-btn" to="/profile">🧑 Profils</NavLink>}
            {user?.role === "artist" && <NavLink className="create-release-btn" to="/artist/drop">＋ Drop Release</NavLink>}
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

        {releaseFeed.length > 0 && (
          <section className="release-feed-strip">
            <div className="feed-strip-head">
              <p className="feed-title">Latest Drops</p>
              <span className="feed-head-pill">Live Wave • {releaseFeed.length}</span>
            </div>
            <div className="feed-row">
              {releaseFeed.map((item) => (
                <NavLink key={item.id} to={`/releases/${item.id}`} className="feed-cover-link">
                  <CoverImage className="feed-cover" src={item.cover_url} alt={item.title} />
                  <article className="feed-inline-meta">
                    <h4>{item.title}</h4>
                    <p>{item.artist?.stage_name ?? "Unknown artist"}</p>
                    <small>
                      <span className="feed-type-pill">{String(item.type ?? "single").toUpperCase()}</span>
                      <span className="feed-score-pill">★ {averageScore(item).toFixed(1)}</span>
                    </small>
                  </article>
                </NavLink>
              ))}
            </div>
          </section>
        )}

        <section className="content-wrap">
          {sessionError && <p className="error">{sessionError}</p>}
          <Routes>
            <Route path="/dashboard" element={<DashboardPage user={user} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/" element={<ReleasesPage user={user} />} />
            <Route path="/artist/drop" element={<ArtistDropPage user={user} />} />
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
