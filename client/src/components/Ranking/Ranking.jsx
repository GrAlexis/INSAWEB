import React, { useState, useEffect } from 'react';
import config from '../../config';
import axios from 'axios';
import './Ranking.css';
import Animation from '../Animation';
import { useNavigate } from 'react-router-dom';

import rankOneIcon from '../../assets/icons/ranks/1_v1.png';
import rankTwoIcon from '../../assets/icons/ranks/2_v1.png';
import rankThreeIcon from '../../assets/icons/ranks/3_v1.svg';

const Ranking = ({ showNavBar }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [viewMode, setViewMode] = useState('teams'); // New state for switching between views
  const [playerRanking, setPlayerRanking] = useState([]); // State for player ranking
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    showNavBar();

    // Fetch events when the component mounts
    axios.get(config.backendAPI + '/events')
      .then(response => setEvents(response.data))
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  useEffect(() => {
    if (selectedEvent && viewMode === 'teams') {
      // Fetch team ranking for the selected event
      axios.get(config.backendAPI + `/ranking/${selectedEvent.id}`)
        .then(response => setRanking(response.data))
        .catch(error => console.error('Error fetching ranking:', error));
    } else if (selectedEvent && viewMode === 'players') {
      // Fetch player ranking for the selected event
      axios.get(config.backendAPI + `/getUsersTotalPoints/${selectedEvent.id}`)
        .then(response => setPlayerRanking(response.data))
        .catch(error => console.error('Error fetching player ranking:', error));
    }
  }, [selectedEvent, viewMode]);

  const handleTeamClick = (teamId) => {
    if (selectedTeam === teamId) {
      setSelectedTeam(null);
      setTeamMembers([]);
    } else {
      setSelectedTeam(teamId);
      axios.get(config.backendAPI + `/teams/${teamId}/members`)
        .then(response => setTeamMembers(response.data))
        .catch(error => console.error('Error fetching team members:', error));
    }
  };

  return (
    <Animation>
      <div className="ranking-page">
        <div className="infobar">
          <select onChange={(e) => {
            setSelectedEvent(events.find(event => event.id === e.target.value));
            setSelectedTeam(null);
            setTeamMembers([]);
          }}>
            <option value="">Select Event</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </div>

        {/* Button to switch between Equipes and Joueurs */}
        {selectedEvent && (
          <div className="toggle-view">
            <button 
              onClick={() => setViewMode('teams')} 
              className={viewMode === 'teams' ? 'active' : ''}>
              Equipes
            </button>
            <button 
              onClick={() => setViewMode('players')} 
              className={viewMode === 'players' ? 'active' : ''}>
              Joueurs
            </button>
          </div>
        )}

        {/* Render rankings based on the selected view mode */}
        <div className="ranking-list">
          {viewMode === 'teams' ? (
            ranking.map((team, index) => (
              <div key={team.id} className="team">
                <div className="team-rank" onClick={() => handleTeamClick(team.id)}>
                  <span>{index + 1}. {team.name}</span>
                  <span>{Math.round(team.points)} Sh</span>
                </div>
                {selectedTeam === team.id && (
                  <div className="team-members">
                    {teamMembers.map(member => (
                      <div key={member.id} className="member-rank">
                        <span>{`${member.name} ${member.lastName.charAt(0)}.`}</span>
                        <span>{Math.round(member.points)} Sh</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            playerRanking.map((player, index) => (
              <div key={player._id} className="player-rank">
                <span>
                  {/* Display icon for top three players, index+1 for others */}
                  {index === 0 ? (
                    <img src={rankOneIcon} alt="Rank 1 Icon" className="rank-icon" />
                  ) : index === 1 ? (
                    <img src={rankTwoIcon} alt="Rank 2 Icon" className="rank-icon" />
                  ) : index === 2 ? (
                    <img src={rankThreeIcon} alt="Rank 3 Icon" className="rank-icon" />
                  ) : (
                    `${index + 1}.`
                  )}
                  {player.name} {player.lastName.charAt(0)}.
                </span>
                <span>{Math.round(player.totalPoints)} Sh</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Animation>
  );
};

export default Ranking;
