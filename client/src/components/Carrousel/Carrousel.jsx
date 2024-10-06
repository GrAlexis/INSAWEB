import React, { useState } from 'react';
import './Carrousel.css';

const PhotoCarousel = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Vérifier que `items` est bien un tableau, sinon afficher un message d'erreur
  if (!Array.isArray(items) || items.length === 0) {
    return <p>No media available</p>; // Message en cas d'absence de données
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="carousel-container">
      <div
        className="carousel-track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {items.map((item, index) => (
          <img
            key={index}
            className="carousel-photo"
            src={item}
            alt={`Photo ${index + 1}`}
          />
        ))}
      </div>

      {/* Boutons de navigation */}
      <button className="carousel-button left" onClick={handlePrev}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-left">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button className="carousel-button right" onClick={handleNext}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-right">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <div className="carousel-indicators">
        {items.map((_, index) => (
          <span
            key={index}
            className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default PhotoCarousel;
