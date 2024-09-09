import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import '../components/Event/EventList.css'
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
// import DateRange from '../components/DateRangePicker'
import EventsList from "../components/Event/EventsList";
import '../App.css'
import Header from '../components/Header';

export default function Home({ events, setEvent, query, setQuery }) {
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1)

  console.log(events)

  const eventsPerPage = 5;

  useEffect(() => {
    // Properly check for null or undefined and for non-empty array
    if (events && events.length > 0) {
      setPagesCount(Math.ceil(events.length / eventsPerPage));
    } else {
      setPagesCount(1); // Default value when there are no events
    }
  }, [events]);

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  return (
    <div className="body">
      <Header />
      <div className="flex flex-row justify-around p-2 py-4">
        <div className="flex flex-col">
          <form>
            {/* <label for="default-search" class="search-label">Search</label> */}
            <div className="search-container">
              <div className="search-icon-container">
                <svg className="search-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input 
                type="search" 
                id="default-search" 
                className="search-input" 
                placeholder="Search events, locations..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
                {/* <button type="submit" class="search-button">Search</button> */}
            </div>
          </form>
        </div>
      </div>
      <EventsList
        events={events}
        setEvent={setEvent}
        filterDate={filterDate}
        limit={eventsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={pagesCount}      />
    </div>
  );
}
