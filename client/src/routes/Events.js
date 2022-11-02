import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/Event/EventList.css';
import axios from 'axios';
import { DateRangePicker } from 'react-date-range';
import EventList from '../components/Event/EventList'
import EventData from '../components/Event/EventData'

export default function Events(props) {
  return (
    <div>
      <table>
        <caption>Results table</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Venue</th>
            <th scope="col">Location</th>
            <th scope="col">Date</th>
          </tr>
        </thead>
        <EventData events={props.state.events} setEvent={props.setEvent} />
      </table>
      <div className="header-box">
        <img className="header-photo" alt="header" />
        <p className="greeting text">Welcome to Festify!</p>
        <p className="greeting text">
          Search for a event below. Festify will generate a Spotify playlist
          based on the event's lineup!
        </p>
      </div>
      <EventList events={props.state.events} setEvent={props.setEvent} />
    </div>
  );
}