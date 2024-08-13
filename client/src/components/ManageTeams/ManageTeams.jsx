import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageTeams.css';

const ManageTeams = ({ eventId }) => {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/events/${eventId}/teams`);
        const teamsWithPoints = await Promise.all(response.data.map(async team => {
          const membersResponse = await axios.get(`http://localhost:5000/teams/${team.id}/members`);
          const points = membersResponse.data.reduce((acc, member) => acc + (member.points || 0), 0);
          return { ...team, points };
        }));
        setTeams(teamsWithPoints);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching teams:', error);
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [eventId]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    try {
      // Fetch all teams to generate a unique ID
      const allTeamIdsResponse = await axios.get('http://localhost:5000/teams/ids');
      const allTeamIds = allTeamIdsResponse.data.map(team => parseInt(team.id, 10));
      const newId = Math.max(...allTeamIds) + 1;
      console.log("newid "+newId)
      console.log("teamName "+teamName)
      console.log("eventid "+eventId)



      const response = await axios.post('http://localhost:5000/teams', {
        id: newId,
        name: teamName,
        eventId: eventId
      });

      setTeams([...teams, { ...response.data, points: 0 }]);
      setTeamName('');
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="manage-teams">
      <form onSubmit={handleCreateTeam} className="create-team-form">
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />
        <button type="submit">Create Team</button>
      </form>

      <div className="team-list">
        {teams.map(team => (
          <div key={team.id} className="team-item">
            <h3>{team.name}</h3>
            <p>Members: {team.members.length}</p>
            <p>Points: {team.points}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageTeams;
