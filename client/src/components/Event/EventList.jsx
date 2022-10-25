import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
// import Card from 'react-bootstrap/Card';
import './EventList.css';
import axios from 'axios';
import { DateRangePicker } from 'react-date-range';

export default function EventList(props) {
  console.log('props', props)

  const listEvents = props.events.map((event) => {
    let venueLocation = null
    let venueName = null

    let id = event.id 
    console.log('id', id)

    if(typeof event.venue !== 'undefined'){
      venueLocation = event.venue.location
      venueName = event.venue.name
    }

    const eventPoster = () => {
      return (
        <>
          <img width={250} className="border"></img>
        </>
      )
    }
    return (
      <div className="event-card border">
        <div className="event-date">{event.date}</div>
        <div className="event-information event-text">
          <Link
            key={event.id}
            onClick = {props.setEvent(event)}
            to={`/events/${event.id}`}
            style={{ textDecoration: "none", color: "white" }}
          >
            {event.name}
          </Link>
          <div className="event-location">
              {venueName} - {venueLocation}
          </div>
        </div>
        {/* {eventPoster} */}
      </div>
    );
  })

  return (
    <section className="events">
      <h1 className="events__header text--light">Events</h1>
      <div className="events-filters">
        <div className="events-filters event-text"><p>Location: </p><p>Alberta</p></div>
        
        <div className="events-filters event-text"><p>Date Range: </p><p>October 2022-Feb 2023</p></div>
        {/* <DateRangePicker/> */}
      </div>
      <ul className="events__list">{listEvents}</ul>
    </section>
  );
}