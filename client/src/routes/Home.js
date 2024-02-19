import React, { useState } from "react";
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

  const eventsPerPage = 5;
  const totalPages = Math.ceil(events.length / eventsPerPage);


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
            <div class="search-container">
              <div class="search-icon-container">
                <svg class="search-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input 
                type="search" 
                id="default-search" 
                class="search-input" 
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
        totalPages={totalPages}      />
    </div>
  );
}
