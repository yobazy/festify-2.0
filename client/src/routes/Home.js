import React from 'react'
import { Link } from 'react-router-dom';
// import '../components/Event/EventList.css'
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
// import DateRange from '../components/DateRangePicker'
import EventsList from '../components/Event/EventsList'



export default function Home( { events, setEvent }) {
  console.log('events', events)
    return (
      <div className="body">
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
        <EventsList events={events} setEvent={setEvent} limit={10}/>
      </div>
    );
  }