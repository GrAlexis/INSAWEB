import React, { useState, useEffect } from 'react';
import config from '../../config';
import axios from 'axios';
import './Ranking.css';
import Animation from '../Animation';
import { useNavigate } from 'react-router-dom';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext';
import rankOneIcon from '../../assets/icons/ranks/1_v1.png';
import rankTwoIcon from '../../assets/icons/ranks/2_v1.png';
import rankThreeIcon from '../../assets/icons/ranks/3_v1.svg';

const Ranking = ({ showNavBar }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [viewMode, setViewMode] = useState('players'); // Default to players
  const [playerRanking, setPlayerRanking] = useState([]); // State for player ranking
  const [backgroundSuperiorColor, setBackgroundSuperiorColor] = useState('#A4C0A5'); 
  const [backgroundColor, setBackgroundColor] = useState('#E8EACC'); 

  const navigate = useNavigate();

  const { selectedUniverse, fetchUniverseById, saveUniverse } = useUniverse();

  useEffect(() => {
    const fetchStyles = async () => {
      var bgColor = '#A4C0A5';
      if (selectedUniverse.styles && selectedUniverse.styles['infoBarBackgroundColor']) {
          bgColor = selectedUniverse.styles['infoBarBackgroundColor'];
      }
      setBackgroundSuperiorColor(bgColor);

      bgColor='#E8EACC'
      if (selectedUniverse.styles && selectedUniverse.styles['mainBackgroundColor']) {
        bgColor = selectedUniverse.styles['mainBackgroundColor'];
      }
      setBackgroundColor(bgColor);
    }
    if (selectedUniverse) {
      fetchStyles();
    }
  }, [selectedUniverse]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    showNavBar();
    // Check if the selectedUniverse exists before fetching events
    if (selectedUniverse?._id) {
      // Fetch events for the selected universe
      axios.get(`${config.backendAPI}/events`, {
        params: { universeId: selectedUniverse._id }  // Pass universeId in the query params
      })
        .then(response => setEvents(response.data))  // Set events to state
        .catch(error => console.error('Error fetching events:', error));
    }
  }, [selectedUniverse]);

  useEffect(() => {
    if (selectedEvent && viewMode === 'teams') {
      // Fetch team ranking for the selected event
      axios.get(`${config.backendAPI}/teamRanking/${selectedEvent._id}`, {
        params: { universeId: selectedUniverse._id }  // Passing universeId as a query parameter
      })
        .then(response => setRanking(response.data))
        .catch(error => console.error('Error fetching ranking:', error));
    } else if (selectedEvent && viewMode === 'players') {
      // Fetch player ranking for the selected event
      axios.get(`${config.backendAPI}/getUsersTotalPoints/${selectedEvent._id}`, {
        params: { universeId: selectedUniverse._id }  // Pass universeId here as well
      })        
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
      axios.get(config.backendAPI + `/teams/${teamId}/members`, {
        params: { universeId: selectedUniverse._id }  // Pass universeId as a query parameter
      })
        .then(response => setTeamMembers(response.data))
        .catch(error => console.error('Error fetching team members:', error));
    }
  };

  const handleEventChange = (event) => {
    setSelectedEvent(event);
    setSelectedTeam(null);
    setTeamMembers([]);
    // Automatically set viewMode to 'players' if there are no teams
    if (event.teams && event.teams.length === 0) {
      setViewMode('players');
    } else {
      setViewMode('teams');  // Default to teams if there are teams
    }
  };

  return (
    <Animation>
      <div className="ranking-page" style={{backgroundColor}}>
        <div className="infobar" style={{ backgroundSuperiorColor }}>
          <select onChange={(e) => handleEventChange(events.find(event => event.id === e.target.value))}>
            <option value="">Select Event</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </div>

        {/* Only show the toggle if the event has teams */}
        {selectedEvent && selectedEvent.teams && selectedEvent.teams.length > 0 && (
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
