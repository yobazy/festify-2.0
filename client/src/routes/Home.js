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
              <input type="dropdown" placeholder="Alberta, CA"></input>
            </p>
            <h3> Date Range : 
              <input type="month" id="start" name="date-range"
              min="2022-10" value="2022-12" />
            </h3>
            <h3>
            <Link to="/events">
            <button>Search Events!</button></Link>
            </h3>
        </div>
      </div>
    );
  }