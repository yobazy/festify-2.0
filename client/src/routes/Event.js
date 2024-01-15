import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EmbedPlayer from '../components/EmbedPlayer';
import Artist from '../components/Artist/ArtistItem';
import userIcon from '../images/placeholder-user.png'
import { getEventById, getArtistsForEvent } from '../utils/api'
import './Event.css';

export default function Event() {

  // get event id from url parameter
  const params = useParams();
  const eventID = params['id']

  // const event = events.find((event) => event.event_id == eventID);
  const [eventInfo, setEventInfo] = useState(null);
  const [artists, setArtists] = useState([]);
  const [artistCount, setArtistCount] = useState(null);
  const [isLoadingArtists, setIsLoadingArtists] = useState(true);


  // get event information from db
  useEffect(() => {
    // Fetch event information
    const fetchEvent = async () => {
      try {
        const data = await getEventById(eventID);
        setEventInfo(data);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchEvent();
  }, [eventID]); // The effect will run again if eventID changes

  useEffect(() => {
    setIsLoadingArtists(true);
    getArtistsForEvent(eventID)
      .then(fetchedArtists => {
        setArtists(fetchedArtists);
        console.log(fetchedArtists)
        setIsLoadingArtists(false);
      })
      .catch(error => {
        console.error("Error fetching artists for event:", error);
        setIsLoadingArtists(false); // Finish loading even if there is an error

      });
  }, [eventID]);

  useEffect(() => {
    setArtistCount(artists.length)
  }, [artists])

  // return artist card with img and name
  const artistsCard = artists.map((artist, i) => {
    return (
      <div className="artist-card">
        <img src={userIcon} width="70px"/>
        <p className="artist-name center" key={i}>
          {artist.artist_name}
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
        {eventInfo ? (
          <>
        <h1>{eventInfo.event_name}</h1>
        <h2>{eventInfo.event_location}</h2>
        <h2>{eventInfo.event_date}</h2>
        {/* <a>{eventLink}</a> */}
        {/* <Artist className="center" tracks={tracks} artist={artist} artistInfo={artistInfo} /> */}
        </>
        ) : (
          <h1></h1>
        )}
      </div>
      <div>
        {/* <EmbedPlayer src={null} /> */}
      </div>
      <div className="center">
        <div className="artists-section-header">
          <h1 className="list-name border">LINEUP</h1>
          { isLoadingArtists ? (
            <p className="border">Total Artists: Loading...</p>
            ) : (
            <p className="border">Total Artists: {artistCount}</p>
            )}
        </div>
        { isLoadingArtists ? (
          <div className="center artists-container">Loading...</div>
          ) : (
          <div className="center artists-container ">{artistsCard}</div>
          )}
      </div>
    </div>
  );
}


