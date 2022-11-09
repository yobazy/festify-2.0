import React from 'react'
import { Link } from 'react-router-dom';
import '../components/Event/EventList.css'
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
// import DateRange from '../components/DateRangePicker'


export default function Home(props) {
    return (
      <div className="body">
        <div className="header-box">
          {/* <img className="header-photo" alt="header" /> */}
          <p className="greeting text">Welcome to Festify!</p>
          <p className="greeting text">
            Search for a event below. Festify will generate a Spotify playlist
            based on the event's lineup!
          </p>
        </div>
        <div className="row">
            <p> Location : 
              {/* <input type="dropdown"></input> */}
              Alberta, CA</p>
            <p> Date Range : All</p>
        </div>
        <Link to="/events">
            <button>Search for Events!</button></Link>
      </div>
    );
  }