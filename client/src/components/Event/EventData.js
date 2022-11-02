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
        <th scope="row">{event.name}</th>
        <td>{venueName}</td>
        <td>{venueLocation}</td>
        <td>{event.date}</td>
      </tr>
    );
  });

  return (
    <tbody>
        {listEvents}
    </tbody>
  );
}
