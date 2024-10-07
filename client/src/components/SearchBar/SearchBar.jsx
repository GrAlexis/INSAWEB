import React, { useState } from 'react';
import './SearchBar.css'; 

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false); // État pour gérer l'ouverture de la barre

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (onSearch) {
      onSearch(newQuery);
    }
  };

  const toggleSearchBar = () => {
    setIsOpen(!isOpen); // Ouvre ou ferme la barre de recherche
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        className={`search-input ${isOpen ? 'open' : ''}`} // Ajout d'une classe conditionnelle
        placeholder="Cherche ton sheeesh my G"
      />
      <button onClick={toggleSearchBar} className="search-button">
        🔍
      </button>
    </div>
  );
};

export default SearchBar;
