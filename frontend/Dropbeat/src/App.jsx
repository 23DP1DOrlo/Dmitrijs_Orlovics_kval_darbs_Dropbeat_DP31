import './App.css'
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
import { ArtistProfilePage } from "./pages/ArtistProfilePage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReleaseRadarPage } from "./pages/ReleaseRadarPage";
import { ReleaseDetailsPage } from "./pages/ReleaseDetailsPage";
import { ReleasesPage } from "./pages/ReleasesPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { StudioPage } from "./pages/StudioPage";
import { StatsPage } from "./pages/StatsPage";
import { UserCommentsPage } from "./pages/UserCommentsPage";
import { UserProfileInsightsPage } from "./pages/UserProfileInsightsPage";

function NavIcon({ type }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    dashboard: <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-10h8V3h-8v8Z" />,
    about: <><circle cx="12" cy="12" r="9" /><path d="M12 10v6" /><path d="M12 7h.01" /></>,
    discover: <><path d="M12 3l2.2 4.8L19 10l-4.8 2.2L12 17l-2.2-4.8L5 10l4.8-2.2L12 3Z" /></>,
    leaderboard: <><path d="M5 20V10" /><path d="M12 20V4" /><path d="M19 20v-7" /></>,
    releases: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6M9 13h6M9 17h4" /></>,
    myReleases: <><path d="M4 6h16M4 12h16M4 18h10" /></>,
    studio: <><path d="M4 7h16" /><path d="M7 7v10" /><path d="M12 7v6" /><path d="M17 7v12" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="3" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a3 3 0 0 1 0 5.75" /></>,
    admin: <><path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4Z" /><path d="M9 12l2 2 4-4" /></>,
  };

  return (
    <svg {...common} aria-hidden="true">
      {icons[type] ?? icons.dashboard}
    </svg>
  );
}

function HeaderActionIcon({ type }) {
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    login: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></>,
    register: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="3" /><path d="M20 8v6" /><path d="M17 11h6" /></>,
    themeDark: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
    themeLight: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    create: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    logout: <><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
  };

  return (
    <svg {...common} aria-hidden="true">
      {icons[type] ?? icons.login}
    </svg>
  );
}

const translations = {
  lv: {
    common: {
      guest: "viesis",
      unknownArtist: "Unknown artist",
      textMetric: "Teksts",
      rhythmMetric: "Ritmika",
      styleMetric: "Stils",
      individualityMetric: "Individualitate",
    },
    nav: {
      dashboard: "Galvena",
      about: "Par mums",
      discover: "Discover",
      leaderboard: "Leaderboard",
      releases: "Relizes",
      myReleases: "My Releases",
      studio: "Studio",
      users: "User Insights",
      admin: "Admin Users",
    },
    pages: {
      about: {
        title: "Par mums",
        subtitle: "Seit vari ielikt savu tekstu par projektu, komandu un platformas merkjiem.",
      },
      discover: {
        title: "Discover",
        subtitle: "Atlasito relizu izlase klausitajiem un A&R komandai.",
        details: "Skatit detalas",
      },
      liveFeed: {
        title: "Live Feed",
        subtitle: "Jaunakas aktivitates platforma.",
        published: "Publicets",
      },
      dashboard: {
        title: "Dashboard",
        welcome: "Sveiks",
        subtitle: "Seit ir projekta galvena atskaite.",
        kpiReleases: "Kopējais relīžu skaits",
        kpiUsers: "Lietotaji platforma",
        kpiComments: "Komentari",
        kpiRatings: "Novertejumi",
        loading: "Ieladejam realo statistiku no datubazes...",
        loadError: "Neizdevas ieladet statistiku no datubazes.",
        upcoming: "Upcoming Releases",
        noUpcoming: "Pagaidam nav relizu ar nakotnes datumu.",
        latest: "Jaunākās relīzes",
      },
      leaderboard: {
        title: "Leaderboard",
        subtitle: "Top relizes pec auditorijas novertejuma.",
        thisMonth: "Sis menesis",
        lastMonth: "Ieprieksejais menesis",
        last3Months: "Pedejie 3 menesi",
        allTime: "Visu laiku",
        byScore: "Pec score",
        byVotes: "Pec vote skaita",
        byFresh: "Pec svaiguma",
        loading: "Ieladejam top relizes...",
        singles: "Singles Leaderboard",
        albums: "Albums Leaderboard",
        votes: "Votes",
        noSingles: "Nav single datu saja perioda.",
        noAlbums: "Nav album datu saja perioda.",
        noData: "Saja perioda nav datu leaderboardam.",
        loadError: "Neizdevas ieladet leaderboard.",
      },
      myReleases: {
        title: "My Releases",
        onlyArtists: "Tikai maksliniekiem.",
        loadError: "Neizdevas ieladet tavas relizes.",
      },
      studio: {
        title: "Studio",
        onlyArtists: "Tikai maksliniekiem.",
        artistTitle: "Artist Studio",
        subtitle: "Produkcijas darba panelis, kas atdarina lielu platformu.",
        roadmap: "Roadmap",
        roadmapText: "Upload audio failiem un cover menedzments.",
        campaigns: "Campaigns",
        campaignsText: "Relizu promo kampanas un statistikas salidzinajums.",
        distribution: "Distribution",
        distributionText: "Eksports uz Spotify/Apple Music metadatu schema.",
      },
      artist: {
        loading: "Ielade...",
        loadError: "Neizdevas ieladet artista profilu.",
        invalidId: "Nederigs artista ID.",
        back: "Atpakal",
        badge: "Makslinieks",
        verified: "Verificets",
        statsAria: "Statistika",
        releasesCount: "Publiskas relizes",
        avgScore: "Videja novertejuma videja",
        avgHint: "No relizem ar novertejumiem: {n}",
        noRatingsYet: "Vel nav apkopojamu novertejumu",
        discography: "Diskografija",
        noReleases: "Sis makslinieks vel nav publicojis relizu.",
        noVotes: "Nav balsu",
      },
    },
    header: {
      title: "Muzikas relizu platforma",
      subtitle: "Publice, parvaldi un analize relizes vienota profesionala paneli.",
      menu: "Menu",
      profile: "Profils",
      dropRelease: "Drop Release",
      login: "Ienakt",
      register: "Registracija",
      logout: "Iziet",
      light: "Light",
      dark: "Dark",
      searchPlaceholder: "Meklet artistu vai relizi...",
      searchLoading: "Mekleju...",
      searchEmpty: "Nekas nav atrasts",
      searchArtists: "Artists",
      searchTracks: "Tracks",
    },
    auth: {
      accessTag: "DropBeat Access",
      heroTitle: "Release platforma jaunam limenim",
      heroSubtitle: "Publice relizes, sadarbojies ar citiem artistiem un redzi realu statistiku viena moderna paneli.",
      loginTitle: "Pieslegsanas",
      registerTitle: "Registracija",
      loginSubtitle: "Ienac sava konta un turpini darbu ar relizem.",
      registerSubtitle: "Izveido jaunu kontu un izvelies savu lomu platforma.",
      name: "Vards",
      stageName: "Skatuves vards",
      artistRole: "Makslinieks",
      listenerRole: "Klausitajs",
      roleHint: "Izvelies lomu: artist vai listener.",
      email: "E-pasts",
      password: "Parole",
      repeatPassword: "Atkartot paroli",
      signIn: "Ienakt",
      createAccount: "Izveidot kontu",
      forgotPassword: "Aizmirsu paroli",
      noAccount: "Nav konta? Registreties",
      haveAccount: "Jau ir konts? Pieslegties",
      security: "Security",
      forgotTitle: "Paroles atjaunosana",
      forgotSubtitle: "Ievadi e-pastu, un mes nosutisim paroles atjaunosanas saiti.",
      sendLink: "Nosutit saiti",
      resetTitle: "Paroles atjaunosana",
      invalidResetLink: "Nederiga atjaunosanas saite. Pieprasi jaunu saiti velreiz.",
      setNewPassword: "Iestati jaunu paroli",
      newPassword: "Jauna parole",
      repeatNewPassword: "Atkartot jauno paroli",
      saving: "Saglabaju...",
      savePassword: "Saglabat paroli",
    },
    misc: {
      unknownArtist: "Unknown artist",
      latestDrops: "Latest Drops",
      liveWave: "Live Wave",
      closeMenu: "Aizvert izvelni",
      openMenu: "Atvert izvelni",
    },
  },
  ru: {
    common: {
      guest: "гость",
      unknownArtist: "Неизвестный артист",
      textMetric: "Текст",
      rhythmMetric: "Ритмика",
      styleMetric: "Стиль",
      individualityMetric: "Индивидуальность",
    },
    nav: {
      dashboard: "Главная",
      about: "О проекте",
      discover: "Открытия",
      leaderboard: "Рейтинг",
      releases: "Релизы",
      myReleases: "Мои релизы",
      studio: "Студия",
      users: "Пользователи",
      admin: "Админ",
    },
    pages: {
      about: {
        title: "О проекте",
        subtitle: "Здесь можно разместить описание проекта, команды и целей платформы.",
      },
      discover: {
        title: "Открытия",
        subtitle: "Подборка релизов для слушателей и A&R команды.",
        details: "Смотреть детали",
      },
      liveFeed: {
        title: "Лента",
        subtitle: "Последняя активность на платформе.",
        published: "Опубликовано",
      },
      dashboard: {
        title: "Панель",
        welcome: "Привет",
        subtitle: "Здесь находится основная сводка проекта.",
        kpiReleases: "Всего релизов",
        kpiUsers: "Пользователи",
        kpiComments: "Комментарии",
        kpiRatings: "Оценки",
        loading: "Загружаем статистику из базы данных...",
        loadError: "Не удалось загрузить статистику из базы данных.",
        upcoming: "Ближайшие релизы",
        noUpcoming: "Пока нет релизов с будущей датой.",
        latest: "Последние релизы",
      },
      leaderboard: {
        title: "Рейтинг",
        subtitle: "Топ релизов по оценке аудитории.",
        thisMonth: "Этот месяц",
        lastMonth: "Прошлый месяц",
        last3Months: "Последние 3 месяца",
        allTime: "За всё время",
        byScore: "По score",
        byVotes: "По голосам",
        byFresh: "По свежести",
        loading: "Загружаем топ релизы...",
        singles: "Рейтинг синглов",
        albums: "Рейтинг альбомов",
        votes: "Голоса",
        noSingles: "Нет данных по синглам за период.",
        noAlbums: "Нет данных по альбомам за период.",
        noData: "За этот период нет данных для рейтинга.",
        loadError: "Не удалось загрузить рейтинг.",
      },
      myReleases: {
        title: "Мои релизы",
        onlyArtists: "Только для артистов.",
        loadError: "Не удалось загрузить твои релизы.",
      },
      studio: {
        title: "Студия",
        onlyArtists: "Только для артистов.",
        artistTitle: "Студия артиста",
        subtitle: "Рабочая панель продакшна в стиле крупной платформы.",
        roadmap: "План",
        roadmapText: "Загрузка аудио и управление обложками.",
        campaigns: "Кампании",
        campaignsText: "Промо релизов и сравнение статистики.",
        distribution: "Дистрибуция",
        distributionText: "Экспорт метаданных для Spotify/Apple Music.",
      },
      artist: {
        loading: "Загрузка...",
        loadError: "Не удалось загрузить профиль артиста.",
        invalidId: "Некорректный ID артиста.",
        back: "Назад",
        badge: "Артист",
        verified: "Верифицирован",
        statsAria: "Статистика",
        releasesCount: "Опубликованные релизы",
        avgScore: "Средняя оценка по релизам",
        avgHint: "По релизам с оценками: {n}",
        noRatingsYet: "Пока нет оценок для расчёта",
        discography: "Дискография",
        noReleases: "У этого артиста пока нет опубликованных релизов.",
        noVotes: "Нет голосов",
      },
    },
    header: {
      title: "Платформа музыкальных релизов",
      subtitle: "Публикуй, управляй и анализируй релизы в единой профессиональной панели.",
      menu: "Меню",
      profile: "Профиль",
      dropRelease: "Новый релиз",
      login: "Вход",
      register: "Регистрация",
      logout: "Выйти",
      light: "Светлая",
      dark: "Темная",
      searchPlaceholder: "Найти артиста или трек...",
      searchLoading: "Ищу...",
      searchEmpty: "Ничего не найдено",
      searchArtists: "Артисты",
      searchTracks: "Треки",
    },
    auth: {
      accessTag: "Доступ DropBeat",
      heroTitle: "Платформа релизов нового уровня",
      heroSubtitle: "Публикуй релизы, сотрудничай с артистами и смотри аналитику в одной панели.",
      loginTitle: "Вход",
      registerTitle: "Регистрация",
      loginSubtitle: "Войди в аккаунт и продолжай работу с релизами.",
      registerSubtitle: "Создай аккаунт и выбери роль на платформе.",
      name: "Имя",
      stageName: "Сценическое имя",
      artistRole: "Артист",
      listenerRole: "Слушатель",
      roleHint: "Выбери роль: артист или слушатель.",
      email: "E-mail",
      password: "Пароль",
      repeatPassword: "Повторите пароль",
      signIn: "Войти",
      createAccount: "Создать аккаунт",
      forgotPassword: "Забыл пароль",
      noAccount: "Нет аккаунта? Зарегистрироваться",
      haveAccount: "Уже есть аккаунт? Войти",
      security: "Безопасность",
      forgotTitle: "Восстановление пароля",
      forgotSubtitle: "Введи e-mail, и мы отправим ссылку для восстановления пароля.",
      sendLink: "Отправить ссылку",
      resetTitle: "Восстановление пароля",
      invalidResetLink: "Ссылка недействительна. Запроси новую ссылку.",
      setNewPassword: "Установи новый пароль",
      newPassword: "Новый пароль",
      repeatNewPassword: "Повтори новый пароль",
      saving: "Сохраняем...",
      savePassword: "Сохранить пароль",
    },
    misc: {
      unknownArtist: "Неизвестный артист",
      latestDrops: "Новые релизы",
      liveWave: "Live Wave",
      closeMenu: "Закрыть меню",
      openMenu: "Открыть меню",
    },
  },
  en: {
    common: {
      guest: "guest",
      unknownArtist: "Unknown artist",
      textMetric: "Lyrics",
      rhythmMetric: "Rhythm",
      styleMetric: "Style",
      individualityMetric: "Individuality",
    },
    nav: {
      dashboard: "Home",
      about: "About",
      discover: "Discover",
      leaderboard: "Leaderboard",
      releases: "Releases",
      myReleases: "My Releases",
      studio: "Studio",
      users: "User Insights",
      admin: "Admin Users",
    },
    pages: {
      about: {
        title: "About",
        subtitle: "Use this section to describe the project, team, and platform goals.",
      },
      discover: {
        title: "Discover",
        subtitle: "Curated release selection for listeners and A&R teams.",
        details: "View details",
      },
      liveFeed: {
        title: "Live Feed",
        subtitle: "Latest platform activity.",
        published: "Published",
      },
      dashboard: {
        title: "Dashboard",
        welcome: "Welcome",
        subtitle: "This is the main project overview.",
        kpiReleases: "Total releases",
        kpiUsers: "Platform users",
        kpiComments: "Comments",
        kpiRatings: "Ratings",
        loading: "Loading live stats from database...",
        loadError: "Failed to load stats from database.",
        upcoming: "Upcoming Releases",
        noUpcoming: "No releases with future date yet.",
        latest: "Latest Releases",
      },
      leaderboard: {
        title: "Leaderboard",
        subtitle: "Top releases by audience score.",
        thisMonth: "This month",
        lastMonth: "Last month",
        last3Months: "Last 3 months",
        allTime: "All time",
        byScore: "By score",
        byVotes: "By votes",
        byFresh: "By freshness",
        loading: "Loading top releases...",
        singles: "Singles Leaderboard",
        albums: "Albums Leaderboard",
        votes: "Votes",
        noSingles: "No singles data for this period.",
        noAlbums: "No albums data for this period.",
        noData: "No leaderboard data for this period.",
        loadError: "Failed to load leaderboard.",
      },
      myReleases: {
        title: "My Releases",
        onlyArtists: "Artists only.",
        loadError: "Failed to load your releases.",
      },
      studio: {
        title: "Studio",
        onlyArtists: "Artists only.",
        artistTitle: "Artist Studio",
        subtitle: "Production workspace inspired by large platforms.",
        roadmap: "Roadmap",
        roadmapText: "Audio upload and cover management.",
        campaigns: "Campaigns",
        campaignsText: "Release promo campaigns and stats comparison.",
        distribution: "Distribution",
        distributionText: "Metadata export for Spotify/Apple Music.",
      },
      artist: {
        loading: "Loading...",
        loadError: "Could not load artist profile.",
        invalidId: "Invalid artist ID.",
        back: "Back",
        badge: "Artist",
        verified: "Verified",
        statsAria: "Stats",
        releasesCount: "Published releases",
        avgScore: "Average score across releases",
        avgHint: "Based on releases with ratings: {n}",
        noRatingsYet: "No ratings to aggregate yet",
        discography: "Discography",
        noReleases: "This artist has not published any releases yet.",
        noVotes: "No votes yet",
      },
    },
    header: {
      title: "Music Release Platform",
      subtitle: "Publish, manage, and analyze releases in one professional workspace.",
      menu: "Menu",
      profile: "Profile",
      dropRelease: "Drop Release",
      login: "Sign in",
      register: "Register",
      logout: "Logout",
      light: "Light",
      dark: "Dark",
      searchPlaceholder: "Search artist or track...",
      searchLoading: "Searching...",
      searchEmpty: "Nothing found",
      searchArtists: "Artists",
      searchTracks: "Tracks",
    },
    auth: {
      accessTag: "DropBeat Access",
      heroTitle: "Next-level release platform",
      heroSubtitle: "Publish releases, collaborate with artists, and track analytics in one modern panel.",
      loginTitle: "Sign in",
      registerTitle: "Register",
      loginSubtitle: "Sign in and continue your release workflow.",
      registerSubtitle: "Create an account and choose your platform role.",
      name: "Name",
      stageName: "Stage name",
      artistRole: "Artist",
      listenerRole: "Listener",
      roleHint: "Choose role: artist or listener.",
      email: "Email",
      password: "Password",
      repeatPassword: "Repeat password",
      signIn: "Sign in",
      createAccount: "Create account",
      forgotPassword: "Forgot password",
      noAccount: "No account? Register",
      haveAccount: "Already have an account? Sign in",
      security: "Security",
      forgotTitle: "Password recovery",
      forgotSubtitle: "Enter your email and we will send a password reset link.",
      sendLink: "Send link",
      resetTitle: "Password reset",
      invalidResetLink: "Invalid reset link. Request a new one.",
      setNewPassword: "Set new password",
      newPassword: "New password",
      repeatNewPassword: "Repeat new password",
      saving: "Saving...",
      savePassword: "Save password",
    },
    misc: {
      unknownArtist: "Unknown artist",
      latestDrops: "Latest Drops",
      liveWave: "Live Wave",
      closeMenu: "Close menu",
      openMenu: "Open menu",
    },
  },
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthLayout = ["/auth", "/forgot-password", "/reset-password"].includes(location.pathname);
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
  const [lang, setLang] = useState(() => localStorage.getItem("dropbeat_lang") ?? "lv");
  const [releaseFeed, setReleaseFeed] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightLogoMissing, setLightLogoMissing] = useState(false);
  const [feedReleaseModal, setFeedReleaseModal] = useState(null);
  const [headerSearch, setHeaderSearch] = useState("");
  const [searchingHeader, setSearchingHeader] = useState(false);
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [headerSearchResults, setHeaderSearchResults] = useState({ releases: [], artists: [] });
  const headerSearchRef = useRef(null);
  const t = translations[lang] ?? translations.lv;
  const headerLogo = theme === "light" && !lightLogoMissing ? "/dropbeatlogo_light.png" : "/dropbeatlogo.png";
  const langIndex = { ru: 0, en: 1, lv: 2 }[lang] ?? 2;
  const tr = (key, fallback = "") => {
    const value = key.split(".").reduce((acc, part) => (acc && typeof acc === "object" ? acc[part] : undefined), t);
    return typeof value === "string" ? value : fallback;
  };

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
    if (theme === "light") {
      setLightLogoMissing(false);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("dropbeat_lang", lang);
  }, [lang]);

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
    setHeaderSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const term = headerSearch.trim();
    if (term.length < 2) {
      setHeaderSearchResults({ releases: [], artists: [] });
      setSearchingHeader(false);
      return;
    }

    let cancelled = false;
    setSearchingHeader(true);

    const timer = window.setTimeout(async () => {
      try {
        const { data } = await api.get("/releases", {
          params: { q: term, sort_by: "release_date", sort_dir: "desc" },
        });

        if (cancelled) return;
        const rows = data?.data ?? [];
        const artistsMap = new Map();
        rows.forEach((item) => {
          const list = [item.artist, ...(item.artists ?? [])].filter(Boolean);
          list.forEach((artist) => {
            if (artist?.id && artist?.stage_name && !artistsMap.has(artist.id)) {
              artistsMap.set(artist.id, artist);
            }
          });
        });

        setHeaderSearchResults({
          releases: rows.slice(0, 6),
          artists: Array.from(artistsMap.values()).slice(0, 6),
        });
      } catch {
        if (!cancelled) {
          setHeaderSearchResults({ releases: [], artists: [] });
        }
      } finally {
        if (!cancelled) {
          setSearchingHeader(false);
        }
      }
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [headerSearch]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!headerSearchRef.current?.contains(event.target)) {
        setHeaderSearchOpen(false);
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!feedReleaseModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setFeedReleaseModal(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [feedReleaseModal]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll("[data-reveal]"));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );

    nodes.forEach((node, index) => {
      node.style.setProperty("--reveal-delay", `${Math.min(index * 60, 320)}ms`);
      node.classList.add("reveal-on-scroll");
      observer.observe(node);
    });

    return () => observer.disconnect();
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

  const metricScore = (value) => Number(value ?? 0).toFixed(1);

  const openReleaseFromSearch = (releaseId) => {
    setHeaderSearchOpen(false);
    setHeaderSearch("");
    navigate(`/releases/${releaseId}`);
  };

  const openArtistFromSearch = (artistId) => {
    setHeaderSearchOpen(false);
    setHeaderSearch("");
    navigate(`/artists/${artistId}`);
  };

  const submitHeaderSearch = (event) => {
    event.preventDefault();
    const firstRelease = headerSearchResults.releases[0];
    const firstArtist = headerSearchResults.artists[0];
    if (firstRelease?.id) {
      openReleaseFromSearch(firstRelease.id);
      return;
    }
    if (firstArtist?.id) {
      openArtistFromSearch(firstArtist.id);
    }
  };

  if (isAuthLayout) {
    return (
      <div className="auth-layout-shell">
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage onAuth={setUser} lang={lang} t={tr} />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage lang={lang} t={tr} />} />
          <Route path="/reset-password" element={user ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage lang={lang} t={tr} />} />
        </Routes>
        {toast && <div className={`toast ${toast.type ?? "info"}`}>{toast.message}</div>}
      </div>
    );
  }

  return (
    <div className={`app-shell ${mobileMenuOpen ? "mobile-nav-open" : ""}`}>
      <aside id="mobile-sidebar" className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="logo-badge">
          <span className="sidebar-dot" aria-hidden="true" />
        </div>
        <nav className="sidebar-nav" onClick={() => setMobileMenuOpen(false)}>
          <NavLink to="/dashboard"><span className="nav-mark" aria-hidden="true"><NavIcon type="dashboard" /></span><span>{t.nav.dashboard}</span></NavLink>
          <NavLink to="/about"><span className="nav-mark" aria-hidden="true"><NavIcon type="about" /></span><span>{t.nav.about}</span></NavLink>
          <div className="sidebar-separator" />
          <NavLink to="/discover"><span className="nav-mark" aria-hidden="true"><NavIcon type="discover" /></span><span>{t.nav.discover}</span></NavLink>
          <NavLink to="/leaderboard"><span className="nav-mark" aria-hidden="true"><NavIcon type="leaderboard" /></span><span>{t.nav.leaderboard}</span></NavLink>
          <NavLink to="/"><span className="nav-mark" aria-hidden="true"><NavIcon type="releases" /></span><span>{t.nav.releases}</span></NavLink>
          {user?.role === "artist" && <NavLink to="/my-releases"><span className="nav-mark" aria-hidden="true"><NavIcon type="myReleases" /></span><span>{t.nav.myReleases}</span></NavLink>}
          {user?.role === "artist" && <NavLink to="/studio"><span className="nav-mark" aria-hidden="true"><NavIcon type="studio" /></span><span>{t.nav.studio}</span></NavLink>}
          <NavLink to="/users"><span className="nav-mark" aria-hidden="true"><NavIcon type="users" /></span><span>{t.nav.users}</span></NavLink>
          {user?.role === "admin" && <NavLink to="/admin/users"><span className="nav-mark" aria-hidden="true"><NavIcon type="admin" /></span><span>{t.nav.admin}</span></NavLink>}
        </nav>
      </aside>
      {mobileMenuOpen && <button className="sidebar-backdrop" type="button" aria-label={t.misc.closeMenu} onClick={() => setMobileMenuOpen(false)} />}

      <main className="page">
        <div className="page-inner">
          <header className="liquid-header" data-reveal>
            <span className="liquid-header-glow" aria-hidden="true" />
            <NavLink to="/dashboard" className="liquid-brand">
              <img
                src={headerLogo}
                alt="DropBeat"
                className="liquid-logo"
                onError={() => setLightLogoMissing(true)}
              />
              <div className="liquid-brand-copy">
                <strong>DropBeat</strong>
                <small>{tr("header.title", "Music Release Platform")}</small>
              </div>
            </NavLink>

            <div className="liquid-search" ref={headerSearchRef}>
              <form className="liquid-search-form" onSubmit={submitHeaderSearch}>
                <span className="liquid-search-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </span>
                <input
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  onFocus={() => setHeaderSearchOpen(true)}
                  className="liquid-search-input"
                  placeholder={tr("header.searchPlaceholder", "Search artist or track")}
                />
              </form>
              {headerSearchOpen && headerSearch.trim().length >= 2 && (
                <div className="liquid-search-popover">
                  {searchingHeader && <p className="liquid-search-state">{tr("header.searchLoading", "Searching...")}</p>}
                  {!searchingHeader && headerSearchResults.releases.length === 0 && headerSearchResults.artists.length === 0 && (
                    <p className="liquid-search-state">{tr("header.searchEmpty", "Nothing found")}</p>
                  )}
                  {headerSearchResults.artists.length > 0 && (
                    <div className="liquid-search-group">
                      <small>{tr("header.searchArtists", "Artists")}</small>
                      {headerSearchResults.artists.map((artist) => (
                        <button
                          key={`artist-${artist.id}`}
                          type="button"
                          className="liquid-search-item"
                          onClick={() => openArtistFromSearch(artist.id)}
                        >
                          @{artist.stage_name}
                        </button>
                      ))}
                    </div>
                  )}
                  {headerSearchResults.releases.length > 0 && (
                    <div className="liquid-search-group">
                      <small>{tr("header.searchTracks", "Tracks")}</small>
                      {headerSearchResults.releases.map((item) => (
                        <button
                          key={`release-${item.id}`}
                          type="button"
                          className="liquid-search-item"
                          onClick={() => openReleaseFromSearch(item.id)}
                        >
                          <span>{item.title}</span>
                          <em>{item.artist?.stage_name ?? tr("common.unknownArtist", "Unknown artist")}</em>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="liquid-actions">
              <div className="lang-switch" role="group" aria-label="Language" style={{ "--lang-index": langIndex }}>
                <span className="lang-switch-indicator" aria-hidden="true" />
                {["ru", "en", "lv"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    className={`lang-switch-btn ${lang === code ? "active" : ""}`}
                    onClick={() => setLang(code)}
                  >
                    {code === "en" ? "ENG" : code.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                className="liquid-icon-btn"
                type="button"
                aria-label={theme === "dark" ? t.header.light : t.header.dark}
                onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              >
                <HeaderActionIcon type={theme === "dark" ? "themeLight" : "themeDark"} />
              </button>

              {user?.role === "artist" && (
                <NavLink className="liquid-pill-btn liquid-accent-btn" to="/artist/drop">
                  <span className="btn-icon" aria-hidden="true"><HeaderActionIcon type="create" /></span>
                  <span>{t.header.dropRelease}</span>
                </NavLink>
              )}

              {user && (
                <NavLink className="liquid-pill-btn" to="/profile">
                  <span className="btn-icon" aria-hidden="true"><HeaderActionIcon type="profile" /></span>
                  <span>{t.header.profile}</span>
                </NavLink>
              )}

              {!user && (
                <div className="liquid-auth-actions">
                  <NavLink className="liquid-pill-btn" to="/auth">
                    <span className="btn-icon" aria-hidden="true"><HeaderActionIcon type="login" /></span>
                    <span>{t.header.login}</span>
                  </NavLink>
                  <NavLink className="liquid-pill-btn liquid-accent-btn" to="/auth">
                    <span className="btn-icon" aria-hidden="true"><HeaderActionIcon type="register" /></span>
                    <span>{t.header.register}</span>
                  </NavLink>
                </div>
              )}

              {user && (
                <button className="liquid-pill-btn" type="button" onClick={logout}>
                  <span className="btn-icon" aria-hidden="true"><HeaderActionIcon type="logout" /></span>
                  <span>{t.header.logout}</span>
                </button>
              )}

              <button
                className={`liquid-menu-btn ${mobileMenuOpen ? "open" : ""}`}
                type="button"
                aria-label={mobileMenuOpen ? t.misc.closeMenu : t.misc.openMenu}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-sidebar"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              >
                <span className="liquid-menu-icon" aria-hidden="true">
                  <span className="liquid-menu-line top" />
                  <span className="liquid-menu-line mid" />
                  <span className="liquid-menu-line bot" />
                </span>
              </button>
            </div>
          </header>

          {releaseFeed.length > 0 && (
            <section className="release-feed-strip" data-reveal>
              <div className="feed-strip-head">
                <p className="feed-title">{t.misc.latestDrops}</p>
                <span className="feed-head-pill">{t.misc.liveWave} • {releaseFeed.length}</span>
              </div>
            <div className="feed-row-scroll">
              <div className="feed-row">
                {releaseFeed.map((item) => (
                  <div key={item.id} className="feed-item">
                    <div
                      className="feed-cover-link"
                      role="button"
                      tabIndex={0}
                      aria-label={`${item.title} — ${tr("pages.discover.details", "Skatit detalas")}`}
                      onClick={() => setFeedReleaseModal(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setFeedReleaseModal(item);
                        }
                      }}
                    >
                      <CoverImage className="feed-cover" src={item.cover_url} alt={item.title} />
                      <article className="feed-inline-meta">
                        <h4>{item.title}</h4>
                        <p>
                          {item.artist?.id ? (
                            <Link
                              to={`/artists/${item.artist.id}`}
                              className="feed-artist-link"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            >
                              {item.artist?.stage_name ?? t.misc.unknownArtist}
                            </Link>
                          ) : (
                            item.artist?.stage_name ?? t.misc.unknownArtist
                          )}
                        </p>
                        <small>
                          <span className="feed-type-pill">{String(item.type ?? "single").toUpperCase()}</span>
                          <span className="feed-score-pill">★ {averageScore(item).toFixed(1)}</span>
                        </small>
                      </article>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </section>
          )}

          <section className="content-wrap" data-reveal>
            {sessionError && <p className="error">{sessionError}</p>}
            <Routes>
              <Route path="/dashboard" element={<DashboardPage user={user} lang={lang} t={tr} />} />
              <Route path="/about" element={<AboutPage lang={lang} t={tr} />} />
              <Route path="/discover" element={<DiscoverPage lang={lang} t={tr} />} />
              <Route path="/" element={<ReleasesPage user={user} lang={lang} t={tr} />} />
              <Route path="/artist/drop" element={<ArtistDropPage user={user} lang={lang} t={tr} />} />
              <Route path="/live-feed" element={<LiveFeedPage lang={lang} t={tr} />} />
              <Route path="/leaderboard" element={<LeaderboardPage lang={lang} t={tr} />} />
              <Route path="/radar" element={<ReleaseRadarPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/releases/:releaseId" element={<ReleaseDetailsPage user={user} lang={lang} t={tr} />} />
              <Route path="/artists/:artistId" element={<ArtistProfilePage t={tr} />} />
              <Route path="/my-releases" element={<MyReleasesPage user={user} lang={lang} t={tr} />} />
              <Route path="/studio" element={<StudioPage user={user} lang={lang} t={tr} />} />
              <Route path="/stats" element={<StatsPage lang={lang} t={tr} />} />
              <Route path="/users" element={<UserCommentsPage lang={lang} t={tr} />} />
              <Route path="/users/:userId" element={<UserProfileInsightsPage lang={lang} t={tr} />} />
              <Route path="/admin/users" element={<AdminUsersPage user={user} lang={lang} t={tr} />} />
              <Route path="/profile" element={<ProfilePage user={user} lang={lang} t={tr} />} />
              <Route path="/auth" element={<AuthPage onAuth={setUser} lang={lang} t={tr} />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage lang={lang} t={tr} />} />
              <Route path="/reset-password" element={<ResetPasswordPage lang={lang} t={tr} />} />
            </Routes>
          </section>
        </div>
      </main>
      {feedReleaseModal && (
        <>
          <div
            className="feed-modal-backdrop"
            onClick={() => setFeedReleaseModal(null)}
          />
          <section className="feed-release-modal" role="dialog" aria-modal="true" aria-label={feedReleaseModal.title}>
            <button type="button" className="feed-modal-close" onClick={() => setFeedReleaseModal(null)}>×</button>
            <CoverImage className="feed-modal-cover" src={feedReleaseModal.cover_url} alt={feedReleaseModal.title} />
            <div className="feed-modal-main">
              <p className="tag">{String(feedReleaseModal.type ?? "single").toUpperCase()}</p>
              <h3>{feedReleaseModal.title}</h3>
              <p className="muted">
                {feedReleaseModal.artist?.stage_name ?? t.misc.unknownArtist} • {feedReleaseModal.release_date}
              </p>
              <div className="feed-modal-kpi-row">
                <span className="feed-modal-kpi">★ {averageScore(feedReleaseModal).toFixed(1)}</span>
                <span className="feed-modal-kpi">{tr("pages.leaderboard.votes", "Votes")}: {Number(feedReleaseModal.ratings_count ?? 0)}</span>
                <span className="feed-modal-kpi">{tr("pages.dashboard.kpiComments", "Komentari")}: {Number(feedReleaseModal.comments_count ?? 0)}</span>
              </div>
            </div>
            <div className="feed-modal-metrics">
              <article><strong>{tr("common.textMetric", "Teksts")}</strong><span>{metricScore(feedReleaseModal.avg_rhymes_images)}</span></article>
              <article><strong>{tr("common.rhythmMetric", "Ritmika")}</strong><span>{metricScore(feedReleaseModal.avg_structure_rhythm)}</span></article>
              <article><strong>{tr("common.styleMetric", "Stils")}</strong><span>{metricScore(feedReleaseModal.avg_style_execution)}</span></article>
              <article><strong>{tr("common.individualityMetric", "Individualitate")}</strong><span>{metricScore(feedReleaseModal.avg_individuality_charisma)}</span></article>
            </div>
            <div className="feed-modal-actions">
              <button type="button" className="liquid-pill-btn" onClick={() => setFeedReleaseModal(null)}>
                {tr("misc.closeMenu", "Aizvert")}
              </button>
              <button
                type="button"
                className="liquid-pill-btn liquid-accent-btn"
                onClick={() => {
                  const targetId = feedReleaseModal.id;
                  setFeedReleaseModal(null);
                  navigate(`/releases/${targetId}`);
                }}
              >
                {tr("pages.discover.details", "Skatit detalas")}
              </button>
            </div>
          </section>
        </>
      )}
      {toast && <div className={`toast ${toast.type ?? "info"}`}>{toast.message}</div>}
    </div>
  )
}

export default App
