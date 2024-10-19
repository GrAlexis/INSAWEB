import React, { useState, useEffect } from 'react';
import config from '../../config';
import { useUser } from '../../hooks/commonHooks/UserContext';
import axios from 'axios';
import './InfoBar.css';

import logo from '../../assets/logos/astus.png';
import rankOneIcon from '../../assets/icons/ranks/1_v1.png';
import rankTwoIcon from '../../assets/icons/ranks/2_v1.png';
import rankThreeIcon from '../../assets/icons/ranks/3_v1.svg';

const InfoBar = ({ selectedEvent }) => {
  const { user, setUser, updateUserTeamName } = useUser();
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [teamName, setTeamName] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);

  const universeId = config.universe

  useEffect(() => {
    if (user && user.universes) {
      updateUserTeamName(user);
    }
  }, [user?.teamId, updateUserTeamName]);


  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        let url, params;

        // Determine the correct URL and params based on whether an event is selected
        if (selectedEvent) {
          url = `${config.backendAPI}/getUsersTotalPoints/${selectedEvent.id}`; // Event-specific points
        } else {
          url = `${config.backendAPI}/getUsersTotalPoints`; // Global points across all events
        }
        params = { universeId };

        const response = await axios.get(url, {params});
        const users = response.data;

        // Find the current user in the returned user list
        const currentUser = users.find(u => u._id === user?._id);

        if (currentUser) {
          const points = currentUser.totalPoints; // Points for event or total points
          const rank = users.findIndex(u => u._id === user._id) + 1; // Calculate rank
          // Set team name if an event is selected
          if (selectedEvent) {
            try {
              // Find the user's team for the selected event
              const teamResponse = await axios.get(`${config.backendAPI}/userTeam/${selectedEvent.id}`, {
                params: { userId: user._id, universeId }
              });
              const team = teamResponse.data;
              setTeamName(team ? team.name : 'No team');
            } catch (error) {
              console.error('Error fetching team:', error);
              setTeamName('No team'); // Fallback if the team cannot be fetched
            }
          } else {
            setTeamName(''); // No event selected, no team to display
          }
          

          // Update state with the user's rank and points
          setUserRank(rank);
          setUser(prevUser => ({ ...prevUser, balance: points }));
          setTotalPoints(points);
        }
      } catch (error) {
        console.error('Error fetching user rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchRankings();
    }
  }, [user?._id, setUser, selectedEvent]);

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  if (!user) {
    return <div>Loading user data...</div>; // Ensure user data is available
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

        <div className="section badge-container">
          {/* Badges */}
          {/* Map through badges if necessary */}
        </div>
      </div>

      <div className="section astus-logo-container">
        <img src={logo} alt="Association Logo" className="astuce-logo" />
      </div>

      <div className="section user-info">
        <h2>{user.name.charAt(0).toUpperCase() + user.name.slice(1)}</h2>
        {selectedEvent ? (
          <>
            <span>{teamName}</span> {/* Team name below the username */}
            <h2>{Math.round(totalPoints)} Sh</h2> {/* Points for the selected event */}
          </>
        ) : (
          <>
            <h2>{Math.round(totalPoints)} Sh</h2> {/* Total points across all events */}
          </>
        )}
      </div>
    </div>
  );
};

export default InfoBar;