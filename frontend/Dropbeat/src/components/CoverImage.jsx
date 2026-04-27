import { useMemo, useState } from "react";
import { api } from "../api";

export function CoverImage({ src, alt, className }) {
  const [attemptIndex, setAttemptIndex] = useState(0);

  const candidates = useMemo(() => {
    if (!src) return [];
    const apiOrigin = (api.defaults.baseURL ?? "").replace("/api", "");
    const list = new Set([src]);

    if (src.startsWith("/storage/")) {
      list.add(`${apiOrigin}${src}`);
      list.add(`http://127.0.0.1:8000${src}`);
      list.add(`http://localhost:8000${src}`);
    }

    if (/^https?:\/\/127\.0\.0\.1(?::\d+)?\/storage\//.test(src)) {
      list.add(src.replace(/^https?:\/\/127\.0\.0\.1(?::\d+)?/, "http://localhost:8000"));
    }

    if (/^https?:\/\/localhost(?::\d+)?\/storage\//.test(src)) {
      list.add(src.replace(/^https?:\/\/localhost(?::\d+)?/, "http://127.0.0.1:8000"));
    }

    const parsedPath = (() => {
      try {
        return new URL(src).pathname;
      } catch {
        return "";
      }
    })();
    if (parsedPath.startsWith("/storage/")) {
      list.add(`${apiOrigin}${parsedPath}`);
      list.add(`http://127.0.0.1:8000${parsedPath}`);
      list.add(`http://localhost:8000${parsedPath}`);
    }

    return Array.from(list);
  }, [src]);

  if (!candidates.length) return null;

  return (
    <img
      className={className}
      src={candidates[Math.min(attemptIndex, candidates.length - 1)]}
      alt={alt}
      onError={() => {
        setAttemptIndex((prev) => (prev + 1 < candidates.length ? prev + 1 : prev));
      }}
    />
  );
}
