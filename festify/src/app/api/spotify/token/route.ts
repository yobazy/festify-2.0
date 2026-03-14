import { NextResponse } from "next/server";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function POST() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return NextResponse.json({ access_token: cachedToken.token });
  }

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return NextResponse.json(
      { error: "Missing Spotify credentials" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });

    if (!response.ok) {
      throw new Error(`Spotify auth failed: ${response.statusText}`);
    }

    const data = await response.json();

    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000,
    };

    return NextResponse.json({ access_token: data.access_token });
  } catch (error) {
    console.error("Error fetching Spotify token:", error);
    return NextResponse.json(
      { error: "Failed to get Spotify token" },
      { status: 500 }
    );
  }
}
