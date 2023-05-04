import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EmbedPlayer from '../components/EmbedPlayer';
import Artist from '../components/Artist/ArtistItem';
import userIcon from '../images/placeholder-user.png'
import './Event.css';

export default function Event({ events, artists }) {

  // get id from url
  const params = useParams();
  const eventID = params['id']

  console.log(events)
  const event = events.find((event) => event.event_id == eventID);
  console.log('event', event)


  // API call to get event details and artist details
    // useEffect(() => {
    //   axios
    //     // .get("/getEvent")
    //     .get("/getArtists")
    //     .then((response) => {
    //       console.log("response.data", response.data)
    //       // const events = response.data.data;
    //       setArtistzzz(response.data);
    //     })
    //     .catch((err) => {
    //       console.log("err");
    //     });
    // }, []);
    
      // call to contact db for information on event [UNUSED]
      // useEffect(() => {
      //   axios.get(`/event/${params.id}`).then((result) => console.log(result.data));
      // }, [params.id]);
  
  // let eventLink = event.link
  // let livestreamInd = event.livestreamInd

  let artistCount = artists.length
  
  // state to store tracks
  const [tracks, setTracks] = useState([]);

  // state to store individual artist information
  const [artist, setArtist] = useState("");

  // state to store array of all artist data
  const [artistsInfo, setArtistsInfo] = useState([]);

  // create event playlist

  const showTopTracks = (e) => {
    console.log('e.target.innerHTML')
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

  const artistList = artists.map((artist) => {
    return artist.name;
  });

  // return img and artist name for each artist in artistList
  const artistsCard = artistList.map((artist, i) => {
    return (
      <div className="artist-card">
        <img src={userIcon} width="100px"/>
        <button 
        // onClick={showTopTracks} 
        className="list-name center" key={i}>
          {artist}
        </button>
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
      <div className="event-header">
          <h1>{event.name}</h1>
          <h2>{event.location}</h2>
          <h2>{event.date}</h2>
          {/* <a>{eventLink}</a> */}
          {/* <Artist className="center" tracks={tracks} artist={artist} artistInfo={artistInfo} /> */}
      </div>
      <div>
        <EmbedPlayer src={null}/>
      </div>
      <div className="center">
        <h1 className="list-name">Acts</h1>
        <p>{artistCount}</p>
        <div className="center artists-container">
          {artistsCard}
        </div>
      </div>
    </div>
  );
}


