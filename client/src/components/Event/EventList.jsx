import React from 'react'
import { Link } from 'react-router-dom';
import EventListItem from './EventListItem'

export default function EventList(props)  {
  console.log('EventList props', props.events);
  const listEvents = props.events.map((event) => {
    return (
      <>
      <Link key={event.id} to={`/events/${event.id}`} style={{textDecoration: 'none', color: 'black' }}><h2>{event.name}</h2></Link>
      <EventListItem
      // name={event.name}
      date={event.date}
      // venueName={event.venue.name}
      // venueLocation={event.venue.location}
      artistList={event.artistList}/>
      </>
    )
  })

  return (
    <section className="events">
      <h2 className="events__header text--light">All Events</h2>
      <ul className="events__list">{listEvents}</ul>
    </section>
  );
}