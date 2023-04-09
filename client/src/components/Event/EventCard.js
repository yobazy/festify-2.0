import React from "react";
import imageUrl from '../../images/banner3.jpeg'
import './EventsList.css'

const EventCard = ( { event }) => {
  return (
    <div className="event-card">
      <div className="event-details">
      <img className="event-image" src={imageUrl} alt={event.name} />
        <div className="event-info">
          <div className="event-name text">{event.name}</div>
          <div className="event-location event-text">{event.name}</div>

          <div className="event-location event-text">{event.location}</div>
        </div>
      <div className="event-artists">
        <div className="event-text">{event.artists}</div>
      </div>
      </div>
      <div className="event-date">
        <div className="event-text">Sept</div>
        <div className="text">14</div>
        <div className="event-text">2022</div>
      </div>
    </div>
  );
};

export default EventCard;