import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/commonHooks/UserContext';
import axios from 'axios';
import './InfoBar.css';

import logo from '../../assets/logos/astus.png';
import rankOneIcon from '../../assets/icons/ranks/1_v1.png';
import rankTwoIcon from '../../assets/icons/ranks/2_v1.png';
import rankThreeIcon from '../../assets/icons/ranks/3_v1.svg';

const InfoBar = () => {
  const { user, setUser, updateUserTeamName } = useUser();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [rankedUsers, setRankedUsers] = useState([]);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    if (user && user.teamId) {
      updateUserTeamName(user);
    }
  }, [user?.teamId, updateUserTeamName]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/getUsersTotalPoints');
        const users = response.data;
        
        setRankedUsers(users);
        const rank = users.findIndex(u => u._id === user._id) + 1;
        setUserRank(rank);
      } catch (error) {
        console.error('Error fetching user rankings:', error);
      }
    };

    if (user) {
      fetchRankings();
    }
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="info-bar">
      {/* Rank displayed at the top-left of the navbar */}
      <div className="rank-display">
        {userRank !== null ? (
          <div className="rank-container">
            <span className="rank-label">Rank:</span>
            {userRank === 1 ? (
              <img src={rankOneIcon} alt="Rank 1 Icon" className="rank-icon" />
            ) : userRank === 2 ? (
              <img src={rankTwoIcon} alt="Rank 2 Icon" className="rank-icon" />
            ) : userRank === 3 ? (
              <img src={rankThreeIcon} alt="Rank 3 Icon" className="rank-icon" />
            ) : (
              <span>{userRank}</span>
            )}
          </div>
        ) : (
          <div>Loading Rank...</div>
        )}
      </div>

      <div className="section badge-container">
        {/* Badges */}
        {/* Map through badges if necessary */}
      </div>
      <div className="section astus-logo-container">
        <img src={logo} alt="Association Logo" className="astuce-logo" />
      </div>
      <div className="section user-info">
        <h2 onClick={() => setIsPanelOpen(!isPanelOpen)}>{user.name.charAt(0).toUpperCase() + user.name.slice(1)} ({user.teamName ?? 'No team'})</h2>
        <h2>{user.balance} Sh</h2>
      </div>
      {isPanelOpen && (
        <div className="user-panel">
          {/* User selection panel */}
          {rankedUsers.map((u) => (
            <div key={u._id} onClick={() => setUser(u)} className="user-item">
              <p>{u.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InfoBar;
