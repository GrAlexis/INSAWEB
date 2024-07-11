import React from 'react';
import './EventCard.css';

const EventCard = ({ event }) => {
  return (
    <div className="event-card">
      <img src={event.image} alt={event.title} className="event-image" />
      <div className="event-details">
        <h2>{event.title}</h2>
        <p>{event.date}</p>
        <p>{event.participants} inscrits</p>
        <p>{event.sheeshes} Sheeshers</p>
        <button className="inscription-button">s'inscrire</button>
        <button className="quest-button">Voir les quêtes</button>
      </div>
    </div>
  );
};

export default EventCard;
