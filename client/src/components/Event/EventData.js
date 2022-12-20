import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import Card from 'react-bootstrap/Card';
import "./EventList.css";
import axios from "axios";
import { DateRangePicker } from "react-date-range";


export default function EventData(props) {

  console.log("eventData props", props.events);
  const eventsList = [];

  const listEvents = props.events.map((event) => {
    if (!eventsList.includes(event.name)) {
      eventsList.push(event.name);
      console.log("event", event);
      let venueLocation = null;
      let venueName = null;

      let id = event.id;
      console.log("id", id);

      if (typeof event.location !== "undefined") {
        venueLocation = event.location;
        // venueName = event.venue.name;
      }

      const setEvent = () => {
        console.log("set event called");
        props.setEvent(event, event.artistList);
      };

      return (
        <tr>
          <td scope="row">
            <Link key={event.id} onClick={setEvent} to={`/event/${event.edmtrain_event_id}`} className='fest-name'>
              {event.name}
            </Link>
          </td>
          <td>{venueName}</td>
          <td>{venueLocation}</td>
          <td>{event.date}</td>
        </tr>
      );
    }
  });

  return (
    <table className="center">
      <thead className="">
        <tr className="">
          <th scope="col">Name</th>
          <th scope="col">Venue</th>
          <th scope="col">Location</th>
          <th scope="col">Start Date</th>
        </tr>
      </thead>
      <tbody>{listEvents}</tbody>
    </table>
  );
}
