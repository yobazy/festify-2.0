import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import Card from 'react-bootstrap/Card';
import "./EventList.css";
import axios from "axios";
import { DateRangePicker } from "react-date-range";

export default function EventData(props) {
  console.log("props", props.events);

  const listEvents = props.events.map((event) => {
    let venueLocation = null;
    let venueName = null;

    let id = event.id;
    console.log("id", id);

    if (typeof event.venue !== "undefined") {
      venueLocation = event.venue.location;
      venueName = event.venue.name;
    }

    return (
      <tr>
        <th scope="row">
            <Link
                key={event.id}
                onClick = {props.setEvent(event)}
                to={`/events/${event.id}`}>                
            {event.name}
            </Link></th>
        <td>{venueName}</td>
        <td>{venueLocation}</td>
        <td>{event.date}</td>
      </tr>
    );
  });

  return (
    <table className="center">
    <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Venue</th>
      <th scope="col">Location</th>
      <th scope="col">Date</th>
    </tr>
  </thead>
    <tbody>
        {listEvents}
    </tbody>
    </table>
  );
}
