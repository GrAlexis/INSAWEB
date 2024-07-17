import React, { useState, useEffect } from 'react';
import { useUser, UserProvider } from '../../hooks/commonHooks/UserContext';
import axios from 'axios';

import './InfoBar.css';
import logo from '../../assets/logos/astus.png';
import rankOneIcon from '../../assets/icons/ranks/1_v1.png';
import rankTwoIcon from '../../assets/icons/ranks/2_v1.png';
import rankThreeIcon from '../../assets/icons/ranks/3_v1.svg';


const InfoBar = () => {
  const { user, setUser } = useUser();
  const [users, setUsers] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const handleUserSelect = (selectedUser) => {
    setUser(selectedUser);
    setIsPanelOpen(false);
  };

  return (
    <div className="info-bar">
      <div className="section placeholder">
        <p>User Annex Info</p>
      </div>
      <div className="section astus-logo-container">
        <img src={logo} alt="Association Logo" className="astuce-logo" />
      </div>
      <div className="section user-info">
        <h2 onClick={handleUserClick} style={{ cursor: 'pointer' }}>{user.name}</h2>
        <h2>{user.classYear}</h2>
        <div className="balance-rank">
        {user.rank === 1 ? (
            <img src={rankOneIcon} alt="Rank 1 Icon" className="rank-icon" />
          ) : user.rank === 2 ? (
            <img src={rankTwoIcon} alt="Rank 2 Icon" className="rank-icon" />
          ) : user.rank === 3 ? (
            <img src={rankThreeIcon} alt="Rank 3 Icon" className="rank-icon" />
          ) : (
            <p>Rank: {user.rank}</p>
          )}
            <p>{user.balance} Sh</p>
        </div>
      </div>
      {isPanelOpen && (
        <div className="user-panel">
          {users.map((u) => (
            <div key={u._id} onClick={() => handleUserSelect(u)} className="user-item">
              <p>{u.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InfoBar;
