import React from "react";
// import imageUrl from "../../images/banner3.jpeg";
import "./EventsList.css";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  const dateObject = new Date(event.event_date);

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

  const getArtistNames = event => event.artists.map(artist => artist.artist_name);

  const artistsArray = getArtistNames(event)

  const artists = () => {
      const slicedArr = artistsArray.slice(0, 3)
      const artistDivs = slicedArr.map((artist, index) => <div key={index}>{artist}</div>);

      if (artistsArray.length >= 4) {
        artistDivs.push(<div key="more">...</div>);
      }
  
      return artistDivs;
  };

  let eventImage = ""

  if (event.use_alt === true) {
    eventImage = event.alt_img
  } else {
    eventImage = event.img_url
  }


  return (
    <div>
      <Link to={`/event/${event.event_id}`} className="event-card-link">
        <div className="event-card">
          <div className="event-hover">
            <div className="event-details">
              <img className="event-image" src={eventImage} alt={event.event_name} />
              <div className="event-info">
                <div className="event-name text-bold">{event.event_name}</div>
                <div className="event-info-box">
                  <div className="event-location event-text">{event.event_venue} - {event.event_location}</div>
                </div>
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
