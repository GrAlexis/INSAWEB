import React, { useState } from 'react';

import './EventCard.css';
import chevron from '../../assets/icons/Card/chevronN.png';

const EventCard = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="event-card">
      <img src={event.image} alt={event.title} className="event-image" />
      <div className="event-details">
        <h2>{event.title}</h2>
        <p>{event.date}</p>
        <p>{event.participants} inscrits</p>
        <p>{event.sheeshes} Sheeshers</p>
        <button className="inscription-button">s'inscrire</button>
        <button onClick={toggleMenu} className="chevron-btn"><img src={chevron} alt='Chevron icon' className="chevron" /></button>
      </div>
    </div>
  );
};

export default EventCard;
