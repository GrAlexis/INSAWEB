import React, { useState, useEffect } from 'react';
import config from '../../config';
import { useUser } from '../../hooks/commonHooks/UserContext';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext'; // Import UniverseContext
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import axios from 'axios';
import './InfoBar.css';

import logo from '../../assets/logos/astus.png';
import rankOneIcon from '../../assets/icons/ranks/1_v1.png';
import rankTwoIcon from '../../assets/icons/ranks/2_v1.png';
import rankThreeIcon from '../../assets/icons/ranks/3_v1.svg';

const InfoBar = ({ selectedEvent }) => {
  const { user, setUser, updateUserTeamName } = useUser();
  const { selectedUniverse, fetchUniverseById,saveUniverse} = useUniverse();
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [teamName, setTeamName] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false); // State to toggle dropdown
  const [universes, setUniverses] = useState([]); // State to store fetched universes

  const navigate = useNavigate(); // Initialize useNavigate hook

  // Fetch each universe by its ID from the backend
  const fetchJoinedUniverses = async () => {
    try {
      const fetchedUniverses = await Promise.all(
        user.joinedUniverses.map(async (universeId) => {
          const response = await axios.get(`${config.backendAPI}/universes/${universeId}`);
          return response.data;
        })
      );
      setUniverses(fetchedUniverses); // Set the fetched universes into state
    } catch (error) {
      console.error('Error fetching universes:', error);
    }
  };

  useEffect(() => {
    if (user?.joinedUniverses?.length) {
      fetchJoinedUniverses(); // Fetch the universes if user has joined some
    }
  }, [user?.joinedUniverses]);

const handleUniverseChange = (universeId) => {
  // Find the whole universe object in the fetched universes array using its _id
  const chosenUniverse = universes.find(universe => universe._id === universeId);
  
  if (chosenUniverse) {
    saveUniverse(chosenUniverse); // Save the whole universe object to context and localStorage
  } else {
    console.error('Selected universe not found');
  }
};


    // Toggle dropdown visibility on logo click
    const toggleDropdown = () => {
      setDropdownVisible(prevVisible => !prevVisible);
    };

  const handleNavigateToUniverseSelection = () => {
    navigate('/select-universe'); // Navigate to the UniverseSelectionPage
  };

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
          url = `${config.backendAPI}/getUsersTotalPoints/${selectedEvent._id}`; // Event-specific points
        } else {
          url = `${config.backendAPI}/getUsersTotalPoints`; // Global points across all events
        }
        params = { universeId: selectedUniverse._id };

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
              const teamResponse = await axios.get(`${config.backendAPI}/userTeam/${selectedEvent._id}`, {
                params: { userId: user._id, universeId: selectedUniverse._id }
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
  }, [user?._id, setUser, selectedEvent,selectedUniverse]);

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

      <div className="section universe-logo-container" onClick={toggleDropdown}>
        <img src={logo} alt="Association Logo" className="universe-logo" />
        {dropdownVisible && (
          <div className="dropdown-menu">
            <select
              value={selectedUniverse?._id || ''}
              onChange={(e) => handleUniverseChange(e.target.value)}
            >
              {universes.map(universe => (
                <option key={universe._id} value={universe._id}>
                  {universe.name}
                </option>
              ))}
            </select>

            {/* Option to navigate to UniverseSelectionPage */}
            <button onClick={handleNavigateToUniverseSelection}>
              Select Universe
            </button>
          </div>
        )}
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