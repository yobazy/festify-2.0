"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { disconnectSpotifyConnection } from "@/lib/spotify-server";

export async function disconnectSpotify() {
  const user = await requireUser();

  try {
    await disconnectSpotifyConnection(user.id);
  } catch (error) {
    console.error("Failed to disconnect Spotify", error);
    redirect("/settings/music?spotify=error");
  }

  redirect("/settings/music?spotify=disconnected");
}
