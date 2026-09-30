interface SpotifyEmbedProps {
  playlistId: string;
}

export function SpotifyEmbed({ playlistId }: SpotifyEmbedProps) {
  return (
    <div className="border border-line bg-ink-2">
      <iframe
        src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
        width="100%"
        height="352"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="block"
        title="Spotify playlist"
      />
    </div>
  );
}
