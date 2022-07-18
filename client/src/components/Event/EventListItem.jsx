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

  useEffect(() => {
    axios.get(`/events/${params.id}`)
      .then(result => setEvents(result.data))
  }, [params.id]);

  const artistList = events.map(event => {
    return event.artist_name;
  });
  // console.log("artistList", artistList);

  const artists = artistList.map((artist, i) => {
    return <h3 className='list-name' key={i}>{artist}</h3>
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
            {/* <Card.Text>{events.venueName}</Card.Text> */}
            {/* <Card.Text>{events.venueLocation}</Card.Text> */}
            {artists}
            {/* <Button variant="primary">Go somewhere</Button> */}
          </Card.Body>
        </Card>
        <Artist />
      </div>
    </div>
  )
}


