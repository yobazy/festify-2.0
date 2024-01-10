import React from 'react';
// import '../components/Event/EventList.css';
import EventList from '../components/Event/EventsList'

export default function Events(props) {
  console.log('Events log', props)
  return (
    <div className='body'>

      <div className="header-box">
        {/* <img className="header-photo" alt="header" /> */}
        <p className="greeting text">Welcome to Festify!</p>
        <p className="greeting text">
          Search for a event below. Festify will generate a Spotify playlist
          based on the event's lineup!
        </p>
      </div>
      <div className="row">
      </div>
        <EventList events={props.state.events} />
    </div>
  );
}