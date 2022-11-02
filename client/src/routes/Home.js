import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import '../components/Event/EventList.css'

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
            <p> Location : Alberta, CA</p>
            <p> Date Range : All</p>
        </div>
        <Link to="/events">
            <button>Go</button></Link>
      </div>
    );
  }