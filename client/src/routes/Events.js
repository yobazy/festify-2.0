import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/Event/EventList.css';
import axios from 'axios';
import { DateRangePicker } from 'react-date-range';
import EventList from '../components/Event/EventList'
import EventData from '../components/Event/EventData'

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
            <p> Location : Alberta, CA</p>
            <p> Date Range : Default</p>
        </div>
        <EventData events={props.state.events} setEvent={props.setEvent} />
    </div>
  );
}