import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useParams } from 'react-router-dom'


export default function Event() {
  // console.log(props)
  const params = useParams();

  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`/events/${params.id}`)
      .then(result => setEvents(result.data))
  }, [params.id]);


  const artistList = events.map(event => {
    return event.artist_name;
  });
  console.log("artistList", artistList);

  const artists = artistList.map((artist) => {
    return <h3 key={events.artist_id}>{artist}</h3>
  })
  console.log("EVENTS", events);
  return (
    <div>
      <article className="event">Event</article>

      {events[0] && <h1>{events[0].event_name}</h1>}
      {events[0] && <h1>{events[0].event_date}</h1>}
      { artists }

    </div>
  )
}