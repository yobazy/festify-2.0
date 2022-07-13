import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';


export default function Event(props)  {
  console.log(props)
  const artists = props.artistList.map((artist) => {
    return <p>{artist.name}</p>
  })
  return (
    <div>
    <h3 class="date-header">{props.date}</h3>
    <Card style={{ width: '18rem' }}>
      {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
      <Card.Body>
        <Card.Title>{props.name}</Card.Title>
        <Card.Text>{props.venueName}</Card.Text>
        <Card.Text>{props.venueLocation}</Card.Text>
        {/* <Button variant="primary">Go somewhere</Button> */}
      </Card.Body>
    </Card>
    </div>
  )
}