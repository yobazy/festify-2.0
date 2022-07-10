import React from 'react'


export default function Event(props)  {
  return (
    <div>
      <article className="event">Event</article>
      <h1>{props.eventName}</h1>
      <h1>{props.eventDate}</h1>
    </div>
  )
}