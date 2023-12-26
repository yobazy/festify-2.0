import React, { useState } from "react";
import { Link } from "react-router-dom";
// import '../components/Event/EventList.css'
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
// import DateRange from '../components/DateRangePicker'
import EventsList from "../components/Event/EventsList";
import '../App.css'
import Header from '../components/Header';
import Select from 'react-select'


export default function Home({ events, setEvent, query, setQuery }) {
  const [filterDate, setFilterDate] = useState("");

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  return (
    <div className="body">
      <Header />
      <div className="filter-row">
        <div className="filter-item">
          <p> Location: </p>
          <input type="dropdown" placeholder="Alberta, CA"></input>
        </div>
        <div className="filter-item">
          <p> Month-Year: </p>
          <input
            type="month"
            id="start"
            name="date-range"
            min="2023-01"
            value={filterDate}
            onChange={handleDateChange}
          />
        </div>
        <div className="filter-item">
          <p> Search: </p>
          <input 
            type="search" 
            name="search-form"
            id="search-form"
            className="search-input"
            placeholder="Search an event"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <EventsList
        events={events}
        setEvent={setEvent}
        filterDate={filterDate}
        limit={10}
      />
    </div>
  );
}
