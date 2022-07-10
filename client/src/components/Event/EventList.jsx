import React from 'react'
import EventListItem from './EventListItem'

export default function EventList(props)  {
  console.log(props.events);
  const listEvents = props.events.map((event) => {
    return (
      <EventListItem/>
    )
  })

  return (
    <section className="events">
      <h4 className="events__header text--light">Events</h4>
      <ul className="events__list">{listEvents}</ul>
    </section>
  );
}