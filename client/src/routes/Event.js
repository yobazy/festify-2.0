import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EmbedPlayer from '../components/EmbedPlayer';
import Artist from '../components/Artist/ArtistItem';
import userIcon from '../images/placeholder-user.png'
import { getEventById, getEventInfo } from '../utils/api'
import './Event.css';

export default function Event({ events, artists }) {

  // get event id from url parameter
  const params = useParams();
  const eventID = params['id']

  const event = events.find((event) => event.event_id == eventID);

// get event information from db
  const eventInfo = getEventById(eventID);

  console.log("EVENT", eventInfo);













  //filter artists by artistID
  // const eventArtistsArr = event.artists

  let filteredArtists = artists.filter(artist => event.artists.includes(artist.artist_id));

  let artistCount = filteredArtists.length

  const artistList = filteredArtists.map((artist) => {
    return artist.name;
  });

  // return artist card with img and name
  const artistsCard = artistList.map((artist, i) => {
    return (
      <div className="artist-card">
        <img src={userIcon} width="70px"/>
        <p className="artist-name center" key={i}>
          {artist}
        </p>
      </div>
    );
  });

  return (
    <div>
      <div className="header-box">
        {/* <img className="header-photo" alt="header" /> */}
        {/* <div className="event-header">
          <>
            {events[0] && (
              <h1 className="event_header_name">{events[0].event_name}</h1>
            )}
          </>
          {events[0] && (
            <h2 className="event_header_date">{events[0].event_date}</h2>
          )}
        </div> */}
      </div>
      <div className="event-header white border">
        <h1>{event.name}</h1>
        <h2>{event.location}</h2>
        <h2>{event.date}</h2>
        {/* <a>{eventLink}</a> */}
        {/* <Artist className="center" tracks={tracks} artist={artist} artistInfo={artistInfo} /> */}
      </div>
      <div>
        <EmbedPlayer src={null} />
      </div>
      <div className="center">
        <div className="artists-section-header">
          <h1 className="list-name border">LINEUP</h1>
          <p className="border">Total Artists: {artistCount}</p>
        </div>
        <div className="center artists-container ">{artistsCard}</div>
      </div>
    </div>
  );
}


