import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
// import Card from 'react-bootstrap/Card';
import './EventList.css';
import axios from 'axios';
import chasingPoster from '../../images/chasing-summer.jpeg';
import friendzyPoster from '../../images/friendzy-fest.jpeg';
import hardWest from '../../images/hard-west.jpeg';
import { DateRangePicker } from 'react-date-range';

export default function EventList(props) {
  
  // console.log('EventList props', props.events);

  console.log('props',props)
  
  const listEvents = props.events.map((event) => {
    console.log(event.id);
    let venueLocation = null
    let venueName = null

    console.log('event.venue',event.venue)
    console.log('bool check == false', typeof event.venue !== 'undefined')

    if(typeof event.venue !== 'undefined'){
      venueLocation = event.venue.location
      venueName = event.venue.name
    }

    const getPoster = () => {
      let evntImg;
      if (event.id === 206106 || event.id === 206107) {
        evntImg = chasingPoster;
      }
      else if (event.id === 204248 || event.id === 204249 || event.id === 204250 || event.id === 204251) {
        evntImg = friendzyPoster;
      }
      if (event.id === 197250 || event.id === 197251) {
        evntImg = hardWest;
      }
      return (
        <img className='event-poster' src={evntImg} />
      )
    }
    // const eventPoster = getPoster()
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
        <div className="events-filters"><p>Location</p><input></input></div>
        
        <div className="events-filters"><p>Date</p><input></input></div>
        {/* <DateRangePicker/> */}
      </div>
      <ul className="events__list">{listEvents}</ul>
    </section>
  );
}