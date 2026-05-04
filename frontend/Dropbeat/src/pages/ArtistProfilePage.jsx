import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { CoverImage } from "../components/CoverImage";

const normalizeCoverUrl = (value) => {
  if (!value) return value;
  const apiOrigin = (api.defaults.baseURL ?? "").replace("/api", "");
  if (value.startsWith("/storage/")) return `${apiOrigin}${value}`;
  if (/^https?:\/\/localhost(?::\d+)?\/storage\//.test(value)) {
    return value.replace(/^https?:\/\/localhost(?::\d+)?\/storage\//, `${apiOrigin}/storage/`);
  }
  if (/^https?:\/\/127\.0\.0\.1(?::\d+)?\/storage\//.test(value)) {
    return value.replace(/^https?:\/\/127\.0\.0\.1(?::\d+)?\/storage\//, `${apiOrigin}/storage/`);
  }
  return value;
};

const releaseComposite = (item) => {
  const values = [
    Number(item.avg_rhymes_images ?? 0),
    Number(item.avg_structure_rhythm ?? 0),
    Number(item.avg_style_execution ?? 0),
    Number(item.avg_individuality_charisma ?? 0),
  ];
  return values.reduce((a, b) => a + b, 0) / values.length;
};

export function ArtistProfilePage({ t = (key, fallback) => fallback }) {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setError("");
    setPayload(null);
    const id = String(artistId ?? "").trim();
    if (!/^\d+$/.test(id)) {
      setError(t("pages.artist.invalidId", "Nederigs artista ID."));
      return () => {
        cancelled = true;
      };
    }

    api
      .get(`/artists/${id}`)
      .then(({ data }) => {
        if (!cancelled) setPayload(data);
      })
      .catch((err) => {
        if (cancelled) return;
        const apiMsg = err?.response?.data?.message;
        const detail = typeof apiMsg === "string" ? apiMsg : null;
        setError(detail || t("pages.artist.loadError", "Neizdevas ieladet artista profilu."));
      });
    return () => {
      cancelled = true;
    };
  }, [artistId]);

  if (error) {
    return (
      <section className="panel artist-profile-page">
        <p className="error">{error}</p>
        <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>
          {t("pages.artist.back", "Atpakal")}
        </button>
      </section>
    );
  }

  if (!payload) {
    return (
      <section className="panel artist-profile-page">
        <p className="muted">{t("pages.artist.loading", "Ielade...")}</p>
      </section>
    );
  }

  const { stage_name: stageName, country, is_verified: isVerified, profile, releases, stats } = payload;
  const initial = (stageName || "?").trim().charAt(0).toUpperCase() || "?";
  const avatarUrl = normalizeCoverUrl(profile?.avatar_url);
  const avgAll = stats?.average_composite_score;
  const hasAvg = avgAll != null && Number(stats?.rated_releases_count) > 0;

  return (
    <section className="panel artist-profile-page">
      <button type="button" className="ghost-btn artist-profile-back" onClick={() => navigate(-1)}>
        {t("pages.artist.back", "Atpakal")}
      </button>

      <header className="artist-profile-hero">
        <div className="artist-profile-avatar" aria-hidden="true">
          {avatarUrl ? (
            <img className="artist-profile-avatar-image" src={avatarUrl} alt={stageName} />
          ) : (
            <span className="artist-profile-avatar-letter">{initial}</span>
          )}
          {isVerified && <span className="artist-profile-verified" title={t("pages.artist.verified", "Verificets")}>✓</span>}
        </div>
        <div className="artist-profile-intro">
          <p className="tag artist-profile-tag">{t("pages.artist.badge", "Makslinieks")}</p>
          <h1 className="artist-profile-name">{stageName}</h1>
          <div className="artist-profile-meta-row">
            {country && (
              <span className="artist-profile-chip">{country}</span>
            )}
            {profile?.city && (
              <span className="artist-profile-chip">{profile.city}</span>
            )}
            {profile?.label_name && (
              <span className="artist-profile-chip">{profile.label_name}</span>
            )}
          </div>
          {profile?.bio && <p className="artist-profile-bio">{profile.bio}</p>}
          <div className="artist-profile-social">
            {profile?.instagram_url && (
              <a className="artist-profile-social-link" href={profile.instagram_url} target="_blank" rel="noreferrer">
                Instagram
              </a>
            )}
            {profile?.youtube_url && (
              <a className="artist-profile-social-link" href={profile.youtube_url} target="_blank" rel="noreferrer">
                YouTube
              </a>
            )}
          </div>
        </div>
        <aside className="artist-profile-stats" aria-label={t("pages.artist.statsAria", "Statistika")}>
          <div className="artist-profile-stat-card">
            <span className="artist-profile-stat-value">{stats?.published_releases_count ?? 0}</span>
            <span className="artist-profile-stat-label">{t("pages.artist.releasesCount", "Publiskas relizes")}</span>
          </div>
          <div className="artist-profile-stat-card artist-profile-stat-highlight">
            <span className="artist-profile-stat-value">
              {hasAvg ? Number(avgAll).toFixed(1) : "—"}
            </span>
            <span className="artist-profile-stat-label">{t("pages.artist.avgScore", "Videja novertejuma videja")}</span>
            <span className="artist-profile-stat-hint">
              {hasAvg
                ? t("pages.artist.avgHint", "No relizem ar novertejumiem: {n}").replace("{n}", String(stats.rated_releases_count))
                : t("pages.artist.noRatingsYet", "Vel nav apkopojamu novertejumu")}
            </span>
          </div>
        </aside>
      </header>

      <h2 className="artist-profile-section-title">{t("pages.artist.discography", "Diskografija")}</h2>
      {(releases ?? []).length === 0 ? (
        <p className="muted">{t("pages.artist.noReleases", "Sis makslinieks vel nav publicojis relizu.")}</p>
      ) : (
        <ul className="artist-release-grid">
          {(releases ?? []).map((item) => {
            const score = releaseComposite(item);
            const rated = Number(item.ratings_count ?? 0) > 0;
            return (
              <li key={item.id}>
                <Link className="artist-release-card" to={`/releases/${item.id}`}>
                  <div className="artist-release-cover-wrap">
                    <CoverImage className="artist-release-cover" src={normalizeCoverUrl(item.cover_url)} alt={item.title} />
                    <span className="artist-release-type">{String(item.type ?? "single").toUpperCase()}</span>
                  </div>
                  <div className="artist-release-body">
                    <h3 className="artist-release-title">{item.title}</h3>
                    <p className="artist-release-sub">
                      {item.custom_genre_name || item.genre?.name}
                      {" · "}
                      {item.release_date}
                    </p>
                    <div className="artist-release-score-row">
                      <span className={`artist-release-score ${rated ? "" : "is-muted"}`}>
                        ★ {rated ? score.toFixed(1) : "—"}
                      </span>
                      {!rated && (
                        <span className="artist-release-score-note">{t("pages.artist.noVotes", "Nav balsu")}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
