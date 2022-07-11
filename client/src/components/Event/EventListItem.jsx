import React from 'react'


export default function Event(props)  {
  console.log(props)
  const artists = props.artistList.map((artist) => {
    return <p>{artist.name}</p>
  })
  return (
    <div>
      <article className="event">Event</article>
      <h1>{props.name}</h1>
      <h1>{props.date}</h1>
      <p>{artists}</p>
    </div>
  )
}