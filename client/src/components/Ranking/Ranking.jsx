import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Ranking.css'

const Ranking = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    // Fetch events when the component mounts
    axios.get('http://localhost:5000/events')
      .then(response => setEvents(response.data))
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      // Fetch ranking for the selected event
      axios.get(`http://localhost:5000/ranking/${selectedEvent.id}`)
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
      axios.get(`http://localhost:5000/teams/${teamId}/members`)
        .then(response => setTeamMembers(response.data))
        .catch(error => console.error('Error fetching team members:', error));
    }
  };


  return (
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
          <div key={team.id}>
            <div className="team-rank" onClick={() => handleTeamClick(team.id)}>
              <span>{index + 1}. {team.name} - {team.points} points</span>
            </div>
            {selectedTeam === team.id && (
              <div className="team-members">
                {teamMembers.map(member => (
                  <div key={member.id} className="member">
                    {member.name} - {member.points} points
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ranking;
