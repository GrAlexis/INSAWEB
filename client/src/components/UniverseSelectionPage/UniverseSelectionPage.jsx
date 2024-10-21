import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/commonHooks/UserContext';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext';
import bcrypt from 'bcryptjs';

const UniverseSelectionPage = ({ showNavBar }) => {
  const [universes, setUniverses] = useState([]);
  const { user } = useUser();
  const { saveUniverse } = useUniverse();
  const [selectedUniverse, setSelectedUniverseLocal] = useState(null);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      const universeToJoin = universes.find(universe => universe._id === selectedUniverse);

      // Check if the user has already joined the universe
      if (user.joinedUniverses.includes(selectedUniverse)) {
        // User has already joined, proceed with joining directly
        await axios.post(`${config.backendAPI}/users/join-universe`, { userId: user._id, universeId: selectedUniverse });
        saveUniverse(universeToJoin);
        showNavBar();
        navigate('/home');
      } else if (universeToJoin.hashedPassword) {
        // Universe has a password, show the password modal
        setPasswordModalVisible(true);
      } else {
        // No password required, join directly
        await axios.post(`${config.backendAPI}/users/join-universe`, { userId: user._id, universeId: selectedUniverse });
        saveUniverse(universeToJoin);
        showNavBar();
        navigate('/home');
      }
    } catch (error) {
      console.error('Error joining universe:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const universeToJoin = universes.find(universe => universe._id === selectedUniverse);
      
      // Compare the hashed password
      const passwordMatch = await bcrypt.compare(password, universeToJoin.hashedPassword);
      
      if (passwordMatch) {
        // Password matches, allow the user to join the universe
        await axios.post(`${config.backendAPI}/users/join-universe`, { userId: user._id, universeId: selectedUniverse });
        saveUniverse(universeToJoin);
        setPasswordModalVisible(false);  // Close modal
        showNavBar();
        navigate('/home');
      } else {
        // If password doesn't match, show an error
        setErrorMessage('Incorrect password');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
    }
  };

  return (
    <div>
      <h2>Sélectionner un univers à rejoindre</h2>
      <ul>
        {universes.map(universe => (
          <li key={universe._id}>
            {universe.name}
            <button onClick={() => setSelectedUniverseLocal(universe._id)}>Sélectionner</button>
          </li>
        ))}
      </ul>
      {selectedUniverse && (
        <button onClick={handleJoinUniverse}>Join Universe</button>
      )}

      {/* Password Modal */}
      {isPasswordModalVisible && (
        <div className="modal">
          <h3>Mot de passe ? {universes.find(u => u._id === selectedUniverse)?.name}</h3>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <button onClick={handlePasswordSubmit}>Valider</button>
          <button onClick={() => setPasswordModalVisible(false)}>Annuler</button>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default UniverseSelectionPage;
