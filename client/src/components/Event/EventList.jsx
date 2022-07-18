import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import '../../.././src/EventList.css';
import axios from 'axios';
import chasingPoster from '../../images/chasing-summer.jpeg';
import friendzyPoster from '../../images/friendzy-fest.jpeg'
import hardWest from '../../images/hard-west.jpeg';

export default function EventList(props) {
  console.log('EventList props', props.events);

  const listEvents = props.events.map((event) => {
    // console.log(event.id);
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
    const eventPoster = getPoster();

    return (
      <Card className='event-card'>
        <div className='event-info'>
          <Link key={event.id} to={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'black' }}><h2 className='event-name'>{event.name}</h2></Link>
          <h3 className='event-date'>{event.date}</h3>
          <div className='event-location'>
            {/* <h3>{event.venue.name}</h3>
            <h3>{event.venue.location}</h3> */}
          </div>
        </div>
        {eventPoster}
      </Card>
    )
  })

  return (
    <section className="events">
      <h1 className="events__header text--light">All Events</h1>
      <ul className="events__list">{listEvents}</ul>
    </section>
  );
}