import React from "react";
import './EventCard.css'

const EventCard = ({ imageUrl, eventName, eventLocation }) => {
  return (
    <div className="event-card">
      <img className="event-image" src={imageUrl} alt={eventName} />
      <div className="event-info">
        <h3 className="event-name">{eventName}</h3>
        <p className="event-location">{eventLocation}</p>
      </div>
    </div>
  );
};

export default EventCard;