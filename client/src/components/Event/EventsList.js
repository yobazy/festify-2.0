import React from "react";
import { Link } from "react-router-dom";
// import Card from 'react-bootstrap/Card';
import "./EventsList.css";
import EventCard from "./EventCard";

export default function EventsList( { events, setEvent, limit }) {
  
  const listEvents = events.map((event) => {
    console.log(event.id)
    const path = "/event/" + event.id
    return (
      <Link to={path}>
        <EventCard event={event}/>
      </Link>
    )
  })

  return (
    <div className="events-container">
      {listEvents}
    </div>
  );
}