import React from 'react'
import { Link } from 'react-router-dom';
import EventListItem from './EventListItem'

export default function EventList(props)  {
  console.log('EventList props', props.events);
  const listEvents = props.events.map((event) => {
    return ( 
      <Link key={event.id} to={`/events/${event.id}`}>{event.name}</Link>
      // <EventListItem
      // key={event.id}
      // id={event.id}
      // name={event.name}
      // date={event.date}
      // artistList={event.artistList}
      // />
    )
  })

  return (
    <section className="events">
      <h4 className="events__header text--light">Events</h4>
      <ul className="events__list">{listEvents}</ul>
    </section>
  );
}