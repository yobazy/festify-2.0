import React from "react";
import imageUrl from "../../images/banner3.jpeg";
import "./EventsList.css";
import { Link } from "react-router-dom";
import artists_data from '../../artists.json'


const EventCard = ({ event }) => {
  const dateObject = new Date(event.date);

  const year = dateObject.getFullYear();
  const monthIndex = dateObject.getMonth(); // getMonth() returns a zero-based index (0-11)
  const date = dateObject.getDate();

  const monthAbbreviations = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = monthAbbreviations[monthIndex];

  // get artists for event
  console.log('artists', event.artists)

  return (
    <div>
      <Link to={`/event/${event.id}`} className="event-card-link">
        <div className="event-card">
          <div className="event-hover">
            <div className="event-details">
              <img className="event-image" src={imageUrl} alt={event.name} />
              <div className="event-info">
                <div className="event-name text">{event.name}</div>
                <div className="event-location event-text">{event.name}</div>

                <div className="event-location event-text">
                  {event.location}
                </div>
              </div>
              <div className="event-artists">
                <div className="event-text">{event.artists}</div>
              </div>
            </div>
          </div>
          <div className="event-date">
            <div className="event-text">{month}</div>
            <div className="text">{date}</div>
            <div className="event-text">{year}</div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default EventCard;
