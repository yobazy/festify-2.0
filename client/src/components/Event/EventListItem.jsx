import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Artist from '../Artist/ArtistItem';

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
    return <h3 key={i}>{artist}</h3>
  })
  // console.log("EVENTS", events);
  return (
    <div>
      <div className="event-header">
        <Card.Title>{events[0] && <h1>{events[0].event_name}</h1>}</Card.Title>
        {events[0] && <h1>{events[0].event_date}</h1>}
      </div>
      <div className='event-info'>
      <Card style={{ width: '18rem' }}>
        {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
        <Card.Body>
          {/* <Card.Text>{events.venueName}</Card.Text> */}
          {/* <Card.Text>{events.venueLocation}</Card.Text> */}
          {artists}
          {/* <Button variant="primary">Go somewhere</Button> */}
        </Card.Body>
      </Card>
        <Artist/>
      </div>
    </div>
  )
}


