import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../../config';
import axios from 'axios';

// Create UniverseContext
const UniverseContext = createContext(null);

export const UniverseProvider = ({ children }) => {
  const [selectedUniverse, setSelectedUniverse] = useState(null);

  // Method to fetch the universe by its ID (default from localStorage)
  const fetchUniverseById = async (universeId) => {
    try {
      
      // Fetch the universe by ID from the backend
      const response = await axios.get(`${config.backendAPI}/universes/${universeId}`);
      const universe = response.data;

      // Ensure the universe object is valid before storing it
      if (universe && typeof universe === 'object') {
        // Store the universe data in state and localStorage
        setSelectedUniverse(universe);
        localStorage.setItem('universe', JSON.stringify(universe)); // Ensure valid JSON format
      } else {
        console.error('Fetched universe is not a valid object');
      }
    } catch (error) {
      console.error('Error fetching universe:', error);
    }
  };

// Method to save universe to localStorage and set it in the state
const saveUniverse = (universe) => {
    if (universe && typeof universe === 'object') {
        setSelectedUniverse(universe); // Set universe in state
        localStorage.setItem('universe', JSON.stringify(universe)); // Save to localStorage
        console.log('Saved universe to localStorage:', universe);
    } else {
        console.error('Invalid universe object for saving');
    }
};

  // Check localStorage for a stored universe and fetch it on load
  useEffect(() => {
    const storedUniverse = localStorage.getItem('universe');
    if (storedUniverse) {
      try {
        const parsedUniverse = JSON.parse(storedUniverse); // Try parsing the JSON
        if (parsedUniverse && typeof parsedUniverse === 'object') {
          setSelectedUniverse(parsedUniverse); // Set selected universe from localStorage
          console.log('Loaded universe from localStorage:', parsedUniverse);
        } else {
          console.error('Parsed universe is not a valid object');
        }
      } catch (error) {
        console.error('Error parsing stored universe from localStorage:', error);
      }
    } else {
      console.log('No universe in localStorage');
    }
  }, []);

  return (
    <UniverseContext.Provider value={{ selectedUniverse, fetchUniverseById, saveUniverse }}>
      {children}
    </UniverseContext.Provider>
  );
};

// Custom hook to use UniverseContext
export const useUniverse = () => useContext(UniverseContext);
