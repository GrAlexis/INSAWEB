import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageTeams.css';
import modifyButtonIcon from '../../assets/buttons/modify.png';

const ManageTeams = ({ eventId }) => {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [showUserTransferPanel, setShowUserTransferPanel] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersWithoutTeam, setUsersWithoutTeam] = useState([]);

  useEffect(() => {
    const fetchTeamsAndUsers = async () => {
      try {
        // Fetch teams and their members
        const teamsResponse = await axios.get(`http://localhost:5000/events/${eventId}/teams`);
        const teamsWithPoints = await Promise.all(teamsResponse.data.map(async team => {
          const membersResponse = await axios.get(`http://localhost:5000/teams/${team.id}/members`);
          const points = membersResponse.data.reduce((acc, member) => acc + (member.points || 0), 0);
          return { ...team, members: membersResponse.data, points };
        }));
        setTeams(teamsWithPoints);

        // Fetch users without a team
        const usersResponse = await axios.get(`http://localhost:5000/users`);
        const usersWithoutTeam = usersResponse.data.filter(user => !user.teamId || user.teamId === '');
        setUsersWithoutTeam(usersWithoutTeam);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchTeamsAndUsers();
  }, [eventId]);

  const handleCreateOrEditTeam = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        const response = await axios.put(`http://localhost:5000/teams/${isEditing}`, {
          name: teamName,
          maxMembers: maxMembers !== '' ? parseInt(maxMembers, 10) : undefined
        });

        setTeams(teams.map(team => team.id === isEditing ? response.data : team));
      } else {
        const allTeamIdsResponse = await axios.get('http://localhost:5000/teams/ids');
        const allTeamIds = allTeamIdsResponse.data.map(team => parseInt(team.id, 10));
        const newId = Math.max(...allTeamIds) + 1;

        const response = await axios.post('http://localhost:5000/teams', {
          id: newId,
          name: teamName,
          eventId: eventId,
          maxMembers: maxMembers !== '' ? parseInt(maxMembers, 10) : undefined
        });

        setTeams([...teams, { ...response.data, members: [], points: 0 }]);
      }

      setTeamName('');
      setMaxMembers('');
      setIsEditing(null);
    } catch (error) {
      console.error('Error creating or editing team:', error);
    }
  };

  const handleEditClick = (team) => {
    setIsEditing(team.id);
    setTeamName(team.name);
    setMaxMembers(team.maxMembers ? team.maxMembers.toString() : '');
  };

  const handleDeleteClick = (teamId) => {
    setTeamToDelete(teamId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/teams/${teamToDelete}`);
      setTeams(teams.filter(team => team.id !== teamToDelete));
      setShowConfirmDelete(false);
      setTeamToDelete(null);
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setTeamToDelete(null);
  };

  const handleUserTransfer = async (newTeamId) => {
    try {
      const previousTeamId = selectedUser.teamId;

      await axios.post('http://localhost:5000/assignTeam', {
        userId: selectedUser._id,
        teamId: newTeamId,
        eventId: eventId,
        previousTeamId: previousTeamId,
      });

      // Update team lists
      const updatedTeams = teams.map(team => {
        if (team.id === previousTeamId) {
          return { ...team, members: team.members.filter(member => member._id !== selectedUser._id) };
        }
        if (team.id === newTeamId) {
          return { ...team, members: [...team.members, { ...selectedUser, teamId: newTeamId }] };
        }
        return team;
      });
      setTeams(updatedTeams);

      setUsersWithoutTeam(usersWithoutTeam.filter(user => user._id !== selectedUser._id));
      setShowUserTransferPanel(false);
    } catch (error) {
      console.error('Error transferring user:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="manage-teams">
      <form onSubmit={handleCreateOrEditTeam} className="create-team-form">
        <input
          type="text"
          placeholder="Nom de l'équipe"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Joueurs Max"
          value={maxMembers}
          onChange={(e) => setMaxMembers(e.target.value)}
          min="1"
        />
        <button type="submit">{isEditing ? 'Update Team' : 'Créer une équipe'}</button>
      </form>

      <div className="team-list">
        {teams.map(team => (
          <div key={team.id} className="team-item">
            <h3>{team.name}</h3>
            <p>Members: {team.members.length}</p>
            <p>Max Members: {team.maxMembers || 'Unlimited'}</p>
            <p>Points: {team.points}</p>
            <button className="edit-team-button" onClick={() => handleEditClick(team)}>
              <img src={modifyButtonIcon} alt="Modify" />
            </button>
            <button className='delete-button' onClick={() => handleDeleteClick(team.id)}>✕</button>
            <div className="team-members-list">
              {team.members.map(member => (
                <div key={member._id} className="member-item">
                  <span>{member.name}</span>
                  <button className='change-team-button' onClick={() => {
                    setSelectedUser(member);
                    setShowUserTransferPanel(true);
                  }}>
                    Réassigner
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Card for Users Without a Team */}
      <div className="no-team-users">
        <h2>Sans chasubles</h2>
        {usersWithoutTeam.length > 0 ? (
          usersWithoutTeam.map(user => (
            <div key={user._id} className="user-card">
              <h3>{user.name}</h3>
              <p>No Team</p>
              <button className='change-team-button' onClick={() => {
                setSelectedUser(user);
                setShowUserTransferPanel(true);
              }}>
                Assigner
              </button>
            </div>
          ))
        ) : (
          <p>No users without a team.</p>
        )}
      </div>

      {showUserTransferPanel && (
        <div className="user-transfer-panel">
          <h2>Transfer {selectedUser.name} to:</h2>
          {teams.map(team => (
            <button
              key={team.id}
              className={`team-transfer-button ${team.maxMembers && team.members.length >= team.maxMembers ? 'disabled' : ''}`}
              onClick={() => handleUserTransfer(team.id)}
              disabled={team.maxMembers && team.members.length >= team.maxMembers}
            >
              {team.name} ({team.members.length}/{team.maxMembers || 'Unlimited'} members)
            </button>
          ))}
          <button
            className="no-team-button"
            onClick={() => handleUserTransfer('')}
          >
            No Team
          </button>
          <button
            className="cancel-transfer-button"
            onClick={() => setShowUserTransferPanel(false)}
          >
            Cancel
          </button>
        </div>
      )}


      {showConfirmDelete && (
        <div className="confirm-delete-popup">
          <div className="confirm-delete-content">
            <p>Are you sure you want to delete this team?</p>
            <button className="confirm-delete-button" onClick={confirmDelete}>Yes</button>
            <button className="cancel-delete-button" onClick={cancelDelete}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeams;