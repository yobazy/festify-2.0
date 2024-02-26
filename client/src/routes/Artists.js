import React, { useEffect, useState } from 'react'
import userIcon from '../images/placeholder-user.png'


export default function Artists({ artists }) {
  console.log(artists)

    // return artist card with img and name
    const artistsCard = artists.map((artist, i) => {
      let artistPic = artist.img_url ? artist.img_url : userIcon;
      return (
        <div className="artist-card">
          <img src={artistPic} width="70px" alt={artist.artist_name}/>
          <p className="artist-name center" key={i}>
            {artist.artist_name}
          </p>
        </div>
      );
    });

  return (
    <div>
      {artistsCard}
    </div>
  );
}