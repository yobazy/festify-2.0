"use client";

import { useState, useEffect } from "react";

export function useSpotifyToken() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/spotify/token", { method: "POST" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch token");
        return r.json();
      })
      .then((d) => setToken(d.access_token))
      .catch((e) => setError(e.message));
  }, []);

  return { token, error };
}
