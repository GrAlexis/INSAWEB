// DropdownMenu.jsx
import React, { useState } from 'react';
import './Roulant.css'; // Importez le CSS pour le style du menu

const Roulant = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown-menu">
      <button onClick={toggleMenu} className="dropdown-button">
        Menu
      </button>
      {isOpen && (
        <div className="dropdown-content">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>
      )}
    </div>
  );
};

export default Roulant;
