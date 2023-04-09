import React from "react";
import { Link } from "react-router-dom";
// import Card from 'react-bootstrap/Card';
import "./EventsList.css";
import EventCard from "./EventCard";

export default function EventsList( { events, setEvent }) {
  
  const listEvents = events.map((event) => {
    console.log(event)
    return (
      <EventCard event={event}/>
    )
  })

  return (
    <div className="events-container">
      {listEvents}
    </div>
  );
}
