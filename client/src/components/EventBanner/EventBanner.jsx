import React from 'react';
import './EventBanner.css';

const EventBanner = ({ events }) => {
  return (
    <div className="banner-container">
      <div className="banner-content">
        {events.map((event, index) => (
          <div className="banner-item" key={index}>
            {event}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventBanner;
