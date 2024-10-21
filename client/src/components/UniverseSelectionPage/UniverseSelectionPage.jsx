import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/commonHooks/UserContext';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext';

const UniverseSelectionPage = ({ showNavBar }) => {
  const [universes, setUniverses] = useState([]);
  const { user } = useUser();
  const { saveUniverse } = useUniverse();
  const [selectedUniverse, setSelectedUniverseLocal] = useState(null);

  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchUniverses = async () => {
      try {
        const response = await axios.get(config.backendAPI + '/universes');
        setUniverses(response.data);
      } catch (error) {
        console.error('Error fetching universes:', error);
      }
    };

    fetchUniverses();
  }, [user]);

  const handleJoinUniverse = async () => {
    try {
      // Find the selected universe object from the list
      const universeToJoin = universes.find(universe => universe._id === selectedUniverse);
      
      await axios.post(`${config.backendAPI}/users/join-universe`, { userId: user._id, universeId: selectedUniverse });

      // Save the selected universe object in context and local storage
      saveUniverse(universeToJoin);

      // Redirect to home page after joining
      showNavBar();
      navigate('/home');
    } catch (error) {
      console.error('Error joining universe:', error);
    }
  };

  return (
    <div>
      <h2>Select a Universe to Join</h2>
      <ul>
        {universes.map(universe => (
          <li key={universe._id}>
            {universe.name}
            <button onClick={() => setSelectedUniverseLocal(universe._id)}>Select</button>
          </li>
        ))}
      </ul>
      {selectedUniverse && (
        <button onClick={handleJoinUniverse}>Join Universe</button>
      )}
    </div>
  );
};

export default UniverseSelectionPage;
