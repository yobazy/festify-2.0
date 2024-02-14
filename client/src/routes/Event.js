import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EmbedPlayer from '../components/EmbedPlayer';
import Artist from '../components/Artist/ArtistItem';
import userIcon from '../images/placeholder-user.png'
import { getEventById, getArtistsForEvent } from '../utils/api'
import './Event.css';
import axios from 'axios';
import { getSpotifyToken, searchPlaylists } from '../utils/api';

// import ../output.css;

export default function Event() {

  // get event id from url parameter
  const params = useParams();
  const eventID = params['id']

  // const event = events.find((event) => event.event_id == eventID);
  const [eventInfo, setEventInfo] = useState(null);
  const [artists, setArtists] = useState([]);
  const [artistCount, setArtistCount] = useState(null);
  const [isLoadingArtists, setIsLoadingArtists] = useState(true);
  const [accessToken, setAccessToken] = useState('');
  const [playlists, setPlaylists] = useState([]);

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

  // format date from 2022-02-02 to February, 2, 2022
  function formatDate(dateString) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${month}, ${day}, ${year}`;
}

useEffect(() => {
  const fetchSpotifyToken = async () => {
    const token = await getSpotifyToken();
    setAccessToken(token);
  };

  fetchSpotifyToken();
}, []);

useEffect(() => {
  if (eventInfo && eventInfo.event_name && accessToken) {
    searchPlaylists(eventInfo.event_name, accessToken)
      .then(playlists => {
        setPlaylists(playlists);
        // Handle the playlists as needed
        console.log(playlists)
      })
      .catch(error => {
        console.error("Error searching playlists:", error);
      });
  }
}, [eventInfo, accessToken]);

const formattedDate = eventInfo ? formatDate(eventInfo.event_date) : null;

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
      <div className='white'>
        {eventInfo ? (
          <>
            <section id="event-header" className="flex flex-row justify-between">
              <div className='event-header-text px-10 align-middle'>
                <h1 className="text-6xl easeIn easeIn-1">{eventInfo.event_name}</h1>
                <h2 className="text-3xl easeIn easeIn-2">{eventInfo.event_venue}</h2>
                <h2 className="text-3xl easeIn easeIn-3">{eventInfo.event_location}</h2>
                <h2 className="text-3xl easeIn easeIn-4">{formattedDate}</h2>
              </div>
              <div>
                <img src={eventInfo.img_url} alt="event" className='max-h-72 px-20'/>
              </div>
            </section>
        <section id="spotify-playlists">
          <div className="border flex flex-col justify-center">
            <h2 className="text-3xl">View spotify playlists:</h2>
            <div>
              <p>This is where the playlists will go...</p>
            </div>
            <h2 className="text-3xl">Generate a playlist for me!</h2>
          </div>
        {/* <a>{eventLink}</a> */}
        {/* <Artist className="center" tracks={tracks} artist={artist} artistInfo={artistInfo} /> */}
        </section>
        </>
        ) : (
          <h1>LOADING DATA</h1>
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


