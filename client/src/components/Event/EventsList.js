import React from "react";
import { Link } from "react-router-dom";
// import Card from 'react-bootstrap/Card';
import "./EventsList.css";
import EventCard from "./EventCard";

export default function EventsList( { events, setEvent, limit, filterDate }) {
  function formatDate(input) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    const [year, month] = input.split("-");
    const monthName = monthNames[parseInt(month, 10) - 1];
  
    return `${monthName} ${year}`;
  }

  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  // group events by month
  const groupEventsByMonth = (events) => {
    return events.reduce((acc, event) => {
      const date = new Date(event.date);
      const month = date.toLocaleString("default", { month: "long", year: "numeric" });
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(event);
      return acc;
    }, {});
  };

  const groupedEvents = groupEventsByMonth(sortedEvents);
  console.log(groupedEvents)
  const displayEvents = filterDate
  ? {
      [formatDate(filterDate)]: groupedEvents[formatDate(filterDate)],
    }
  : groupedEvents;

  return (
    <div className="events-container">
      {Object.entries(displayEvents).map(([month, monthEvents]) => (
        <div key={month}>
          <h2>{month}</h2>
          {monthEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ))}
    </div>
  );
}
