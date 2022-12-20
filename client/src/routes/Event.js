import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EmbedPlayer from '../components/EmbedPlayer';
import Artist from '../components/Artist/ArtistItem';
import userIcon from '../images/placeholder-user.png'
// import Banner2 from '../../../src/images/banner2.jpeg';
import '../Event.css';

export default function Event(props) {
  console.log('props', props)

  // create state 
  const [currEvent, setCurrEvent] = useState()
  const [artistzzz, setArtistzzz] = useState([{}])

  // API call to get event details 
    useEffect(() => {
      // console.log('Event triggered')
      axios
        // .get("/getEvent")
        .get("/getArtists")
        .then((response) => {
          console.log("response.data", response.data)
          // const events = response.data.data;
          setArtistzzz(response.data);
        })
        .catch((err) => {
          console.log("err");
        });
    }, []);
    
      // call to contact db for information on event [UNUSED]
      // useEffect(() => {
      //   axios.get(`/event/${params.id}`).then((result) => console.log(result.data));
      // }, [params.id]);
  
  let event = props.event
  let eventName = event.name
  let eventLocation = event.location
  let eventDate = event.date
  let eventLink = event.link
  let livestreamInd = event.livestreamInd

  
  let allArtists = artistzzz
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

  const artistList = allArtists.map((artist) => {
    return artist.name;
  });

  // return img and artist name for each artist in artistList
  const artists = artistList.map((artist, i) => {
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
      <div className="center">
          <h1>{eventName}</h1>
          <h1>{eventLocation}</h1>
          <h2>{eventDate}</h2>
          <a>{eventLink}</a>
          {/* <Artist className="center" tracks={tracks} artist={artist} artistInfo={artistInfo} /> */}
      </div>
      <div>
        <EmbedPlayer src={null}/>
      </div>
      <div className="center">
        <h1 className="list-name">Artists ({artistCount})</h1>
        <div className="center artists-container">
          {artists}
        </div>
      </div>
    </div>
  );
}


