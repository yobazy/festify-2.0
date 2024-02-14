import React from "react";
import { Link } from "react-router-dom";
import "./EventsList.css";
import EventCard from "./EventCard";

export default function EventsList({ events, setEvent, limit, filterDate, currentPage, setCurrentPage, totalPages }) {

  const getPageRange = (currentPage, totalPages) => {
    let start = currentPage - 2;
    let end = currentPage + 2;

    if (start < 1) {
      start = 1;
      end = Math.min(5, totalPages); // Ensure we don't go beyond the total pages
    }

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, totalPages - 4); // Adjust to always show 5 pages when possible
    }

    return Array.from({ length: (end - start) + 1 }, (_, i) => start + i);
  };
  const pageNumbers = getPageRange(currentPage, totalPages);


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

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`px-3 py-1 mx-1 rounded-md text-white ${currentPage === number ? 'bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'}`}
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
