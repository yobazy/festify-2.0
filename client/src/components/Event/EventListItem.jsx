import React from 'react'


export default function Event(props)  {
  return (
    <div>
      <article className="event">Event</article>
      <h1>{props.name}</h1>
      <h1>{props.date}</h1>
    </div>
  )
}