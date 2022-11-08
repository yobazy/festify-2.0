import React from 'react';
import EmbedContainer from "react-oembed-container";


export default function EmbedPlayer(src) {
  let playlistEmbed =
    '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/playlist/4OJzv9KUCxcQzjuiR7Klgl?utm_source=generator&theme=0" width="93%" height="380" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>';

  return (
    <EmbedContainer markup={playlistEmbed}>
      <div dangerouslySetInnerHTML={{ __html: playlistEmbed }}></div>
    </EmbedContainer>
  );
}