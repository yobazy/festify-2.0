import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Artist from '../components/Artist/ArtistItem';
// import Banner2 from '../../../src/images/banner2.jpeg';
// import './EventListItem.css';

export default function Event(props) {
  
  console.log('props', props)
  let event = props.event
  let eventName = event.name
  let eventLocation = event.venue.location
  let eventDate = event.date
  let eventLink = event.link
  let livestreamInd = event.livestreamInd

  let allArtists = props.artists
  let artistCount = allArtists.length

  const params = useParams();

  // state to store all events
  const [events, setEvents] = useState([]);

  // state to store tracks
  const [tracks, setTracks] = useState([]);

  // state to store individual artist information
  const [artist, setArtist] = useState("");

  // state to store array of all artist data
  const [artistsInfo, setArtistsInfo] = useState([]);

  // call to contact db for information on event [UNUSED]
    // useEffect(() => {
    //   axios.get(`/event/${params.id}`).then((result) => console.log(result.data));
    // }, [params.id]);

  console.log('events results', events)

  const showTopTracks = (e) => {
    setArtist(e.target.innerHTML);
    axios
      .post("/tracks", { data: e.target.innerHTML })
      .then((result) => {
        setTracks(result.data.tracks);
      })
      .then(
        axios
          .post("/artistInfo", { data: e.target.innerHTML })
          .then((result) => {
            // console.log('result.data', result.data)
            setArtistsInfo(result.data);
          })
      );
  };

  const artistList = allArtists.map((artist) => {
    return artist.name;
  });

  const artists = artistList.map((artist, i) => {
    return (
      <button 
      // onClick={showTopTracks} 
      className="list-name" key={i}>
        {artist}
      </button>
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
      <div className="">
        <div className="center border">
          <h1>{eventName}</h1>
          <h1>{eventLocation}</h1>
          <h2>{eventDate}</h2>
          <a>{eventLink}</a>
          {/* <Artist className="center" tracks={tracks} artist={artist} artistInfo={artistInfo} /> */}
        </div>
      </div>
      <h1>Artists ({artistCount})</h1>
      <div>
        {artists}
      </div>
    </div>
  );
}


