import React from "react";
import { Link } from "react-router-dom";
import "./EventsList.css";
import EventCard from "./EventCard";

export default function EventsList( { events, setEvent, limit, filterDate, currentPage, setCurrentPage, totalPages }) {

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
  pageNumbers.push(i);
}

  function formatDate(input) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    const [year, month] = input.split("-");
    const monthName = monthNames[parseInt(month, 10) - 1];
  
    return `${monthName} ${year}`;
  }

  const sortedEvents = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const currentEvents = sortedEvents.slice(startIndex, endIndex);

  // group events by month
  const groupEventsByMonth = (events) => {
    return events.reduce((acc, event) => {
      const date = new Date(event.event_date);
      const month = date.toLocaleString("default", { month: "long", year: "numeric" });
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(event);
      return acc;
    }, {});
  };

  const groupedEvents = groupEventsByMonth(currentEvents);

  const displayEvents = filterDate
  ? {
      [formatDate(filterDate)]: groupedEvents[formatDate(filterDate)],
    }
  : groupedEvents;

  return (
    <>
    <div className="events-container">
      {Object.entries(displayEvents).map(([month, monthEvents]) => (
        <div key={month} style={{ color: 'white' }}>
          <h2 className="text-2xl font-medium">{month}</h2>
          {monthEvents.map((event) => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      ))}
    </div>
    <div className="flex items-center justify-center space-x-1 my-4">
  <button 
    onClick={() => setCurrentPage(1)} 
    disabled={currentPage === 1}
    className="px-3 py-1 rounded-md text-white bg-purple-500 hover:bg-purple-700 disabled:bg-purple-300"
  >
    First
  </button>

  {pageNumbers
  .filter(number => (number >= currentPage - 2 && number <= currentPage + 2))
  .map(number => (
    <button 
      key={number} 
      onClick={() => setCurrentPage(number)}
      className={`px-3 py-1 mx-1 rounded-md text-white ${currentPage === number ? 'bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'}`}
      aria-label={`Go to page ${number}`}
    >
      {number}
    </button>
))}

  <button 
    onClick={() => setCurrentPage(currentPage + 1)} 
    disabled={currentPage === totalPages}
    className="px-3 py-1 rounded-md text-white bg-purple-500 hover:bg-purple-700 disabled:bg-purple-300"
  >
    Next
  </button>
  <button 
    onClick={() => setCurrentPage(totalPages)} 
    disabled={currentPage === totalPages}
    className="px-3 py-1 rounded-md text-white bg-purple-500 hover:bg-purple-700 disabled:bg-purple-300"
  >
    Last
  </button>
</div>

    </>
  );
}
