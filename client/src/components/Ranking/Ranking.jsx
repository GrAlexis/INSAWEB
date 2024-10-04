import React, { useState, useEffect } from 'react';
import config from '../../config';
import axios from 'axios';
import './Ranking.css'
import Animation from '../Animation'
import { useNavigate } from 'react-router-dom';


const Ranking = ({ showNavBar }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

        if (!token) {
          // If no token, redirect to login page
          navigate('/login');
          return; // Exit useEffect early to prevent further code execution
        }

        showNavBar()
    // Fetch events when the component mounts
    axios.get(config.backendAPI+'/events')
      .then(response => setEvents(response.data))
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      // Fetch ranking for the selected event
      axios.get(config.backendAPI+`/ranking/${selectedEvent.id}`)
        .then(response => setRanking(response.data))
        .catch(error => console.error('Error fetching ranking:', error));
    }
  }, [selectedEvent]);

  const handleTeamClick = (teamId) => {
    if (selectedTeam === teamId) {
      setSelectedTeam(null);
      setTeamMembers([]);
    } else {
      setSelectedTeam(teamId);
      axios.get(config.backendAPI+`/teams/${teamId}/members`)
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
      <div className="ranking-list">
        {ranking.map((team, index) => (
          <div key={team.id} className="team">
            <div className="team-rank" onClick={() => handleTeamClick(team.id)}>
              <span className="team-rank-name">{index + 1}. {team.name}</span>
              <span className="team-rank-points">{Math.round(team.points)} Sh</span>
            </div>
            {selectedTeam === team.id && (
              <div className="team-members-list">
                {teamMembers.map(member => (
                  <>
                  <div key={member.id} className="member-name">
                    {member.name} {Math.round(member.points)} Sh
                  </div>
                </>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </Animation>
  );
};

export default Ranking;
