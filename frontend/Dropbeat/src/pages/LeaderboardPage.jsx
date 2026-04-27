import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { CoverImage } from "../components/CoverImage";

export function LeaderboardPage({ t = (key, fallback) => fallback }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [period, setPeriod] = useState("this_month");
  const [sortMode, setSortMode] = useState("score");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getDateRange = (value) => {
    const now = new Date();
    const yyyyMmDd = (date) => date.toISOString().slice(0, 10);

    if (value === "all") return {};
    if (value === "this_month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from_date: yyyyMmDd(start), to_date: yyyyMmDd(end) };
    }
    if (value === "last_month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from_date: yyyyMmDd(start), to_date: yyyyMmDd(end) };
    }
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from_date: yyyyMmDd(start), to_date: yyyyMmDd(end) };
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const params = {
          sort_by: "release_date",
          sort_dir: "desc",
          ...getDateRange(period),
        };
        const { data } = await api.get("/releases", { params });
        const enriched = (data.data ?? []).map((item) => {
          const average =
            (Number(item.avg_rhymes_images ?? 0)
            + Number(item.avg_structure_rhythm ?? 0)
            + Number(item.avg_style_execution ?? 0)
            + Number(item.avg_individuality_charisma ?? 0)) / 4;
          const votes = Number(item.ratings_count ?? 0);
          return {
            ...item,
            average,
            weightedScore: average * Math.log10(votes + 1.4),
          };
        });
        setRows(enriched);
      } catch {
        setError(t("pages.leaderboard.loadError", "Neizdevas ieladet leaderboard."));
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  const rankedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      if (sortMode === "votes") return Number(b.ratings_count ?? 0) - Number(a.ratings_count ?? 0);
      if (sortMode === "fresh") return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      return b.weightedScore - a.weightedScore;
    });
    return sorted.slice(0, 20);
  }, [rows, sortMode]);

  const singlesRows = useMemo(
    () => rankedRows.filter((item) => item.type === "single").slice(0, 10),
    [rankedRows],
  );
  const albumsRows = useMemo(
    () => rankedRows.filter((item) => item.type === "album").slice(0, 10),
    [rankedRows],
  );

  return (
    <section className="panel">
      <div className="leaderboard-head">
        <div>
          <h2>{t("pages.leaderboard.title", "Leaderboard")}</h2>
          <p className="muted">{t("pages.leaderboard.subtitle", "Top relizes pec auditorijas novertejuma.")}</p>
        </div>
        <div className="leaderboard-filters">
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="this_month">{t("pages.leaderboard.thisMonth", "Sis menesis")}</option>
            <option value="last_month">{t("pages.leaderboard.lastMonth", "Ieprieksejais menesis")}</option>
            <option value="last_3_months">{t("pages.leaderboard.last3Months", "Pedejie 3 menesi")}</option>
            <option value="all">{t("pages.leaderboard.allTime", "Visu laiku")}</option>
          </select>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="score">{t("pages.leaderboard.byScore", "Pec score")}</option>
            <option value="votes">{t("pages.leaderboard.byVotes", "Pec vote skaita")}</option>
            <option value="fresh">{t("pages.leaderboard.byFresh", "Pec svaiguma")}</option>
          </select>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="small-text">{t("pages.leaderboard.loading", "Ieladejam top relizes...")}</p>}

      <div className="leaderboard-lanes">
        <section className="leaderboard-lane">
          <h3>{t("pages.leaderboard.singles", "Singles Leaderboard")}</h3>
          <div className="leaderboard-grid">
            {singlesRows.map((item, idx) => (
              <article className={`card leaderboard-card clickable-card ${idx < 3 ? `leaderboard-top-${idx + 1}` : ""}`} key={item.id} onClick={() => navigate(`/releases/${item.id}`)}>
                <div className="leaderboard-rank">#{idx + 1}</div>
                {item.cover_url && <CoverImage className="leaderboard-cover" src={item.cover_url} alt={item.title} />}
                <div className="leaderboard-meta">
                  <strong>{item.title}</strong>
                  <p>{item.artist?.stage_name ?? t("common.unknownArtist", "Unknown artist")}</p>
                  <div className="leaderboard-rating-wrap">
                    <div className="leaderboard-rating-badge">{item.average.toFixed(1)}</div>
                    <div className="leaderboard-rating-tooltip">
                      <p>{t("common.textMetric", "Teksts")}: {Number(item.avg_rhymes_images ?? 0).toFixed(1)}</p>
                      <p>{t("common.rhythmMetric", "Ritmika")}: {Number(item.avg_structure_rhythm ?? 0).toFixed(1)}</p>
                      <p>{t("common.styleMetric", "Stils")}: {Number(item.avg_style_execution ?? 0).toFixed(1)}</p>
                      <p>{t("common.individualityMetric", "Individualitate")}: {Number(item.avg_individuality_charisma ?? 0).toFixed(1)}</p>
                    </div>
                  </div>
                  <small>{t("pages.leaderboard.votes", "Votes")}: {item.ratings_count ?? 0}</small>
                </div>
              </article>
            ))}
          </div>
          {!loading && singlesRows.length === 0 && <p className="muted">{t("pages.leaderboard.noSingles", "Nav single datu saja perioda.")}</p>}
        </section>

        <section className="leaderboard-lane">
          <h3>{t("pages.leaderboard.albums", "Albums Leaderboard")}</h3>
          <div className="leaderboard-grid">
            {albumsRows.map((item, idx) => (
              <article className={`card leaderboard-card clickable-card ${idx < 3 ? `leaderboard-top-${idx + 1}` : ""}`} key={item.id} onClick={() => navigate(`/releases/${item.id}`)}>
                <div className="leaderboard-rank">#{idx + 1}</div>
                {item.cover_url && <CoverImage className="leaderboard-cover" src={item.cover_url} alt={item.title} />}
                <div className="leaderboard-meta">
                  <strong>{item.title}</strong>
                  <p>{item.artist?.stage_name ?? t("common.unknownArtist", "Unknown artist")}</p>
                  <div className="leaderboard-rating-wrap">
                    <div className="leaderboard-rating-badge">{item.average.toFixed(1)}</div>
                    <div className="leaderboard-rating-tooltip">
                      <p>{t("common.textMetric", "Teksts")}: {Number(item.avg_rhymes_images ?? 0).toFixed(1)}</p>
                      <p>{t("common.rhythmMetric", "Ritmika")}: {Number(item.avg_structure_rhythm ?? 0).toFixed(1)}</p>
                      <p>{t("common.styleMetric", "Stils")}: {Number(item.avg_style_execution ?? 0).toFixed(1)}</p>
                      <p>{t("common.individualityMetric", "Individualitate")}: {Number(item.avg_individuality_charisma ?? 0).toFixed(1)}</p>
                    </div>
                  </div>
                  <small>{t("pages.leaderboard.votes", "Votes")}: {item.ratings_count ?? 0}</small>
                </div>
              </article>
            ))}
          </div>
          {!loading && albumsRows.length === 0 && <p className="muted">{t("pages.leaderboard.noAlbums", "Nav album datu saja perioda.")}</p>}
        </section>
      </div>

      {!loading && singlesRows.length === 0 && albumsRows.length === 0 && (
        <p className="muted">{t("pages.leaderboard.noData", "Saja perioda nav datu leaderboardam.")}</p>
      )}
    </section>
  );
}
