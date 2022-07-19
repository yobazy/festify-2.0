import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Artist from '../Artist/ArtistItem';
import Banner2 from '../../../src/images/banner2.jpeg';

export default function Event() {
  const params = useParams();

  const [events, setEvents] = useState([]);

  // const [artist, setArtist] = useState([]);

  const [tracks, setTracks] = useState([]);


  useEffect(() => {
    axios.get(`/events/${params.id}`)
      .then(result => setEvents(result.data))
  }, [params.id]);

  const artistList = events.map(event => {
    return event.artist_name;
  });
  // console.log("artistList", artistList);

  // console.log(events);
  const showTopTracks = (e) => {
    // console.log("e", e.target.innerHTML);
    axios.post('/tracks', { data: e.target.innerHTML })
      .then(result => setTracks(result.data.tracks))
  }

  const artists = artistList.map((artist, i) => {
    return <button onClick={showTopTracks} className='list-name' key={i}>{artist}</button>
  })
  // console.log("EVENTS", events);
  return (
    <div>
      <div className='header-box'>
        <img src={Banner2} className="header-photo" alt="header" />
        <div className="event-header">
          <>{events[0] && <h1 className="event_header_name">{events[0].event_name}</h1>}
          </>
          {events[0] && <h2 className="event_header_date">{events[0].event_date}</h2>}
        </div>
      </div>
      <div className='event-info'>
        <Card className='artist-card' style={{ width: '18rem' }}>
          {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
          <Card.Body className='artist-list'>
            {artists}
          </Card.Body>
        </Card>
        <Artist tracks={tracks} />
      </div>
    </div>
  )
}


