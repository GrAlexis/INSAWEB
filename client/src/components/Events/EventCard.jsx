import React, { useState, useEffect } from 'react';
import './EventCard.css';
import axios from 'axios';
import { useUser } from '../../hooks/commonHooks/UserContext';

const EventCard = ({ event }) => {
  const { user, setUser } = useUser();
  const [teams, setTeams] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

   // Fetch the teams for the specific event
   useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/events/${event.id}/teams`);
        setTeams(response.data);
      } catch (error) {
        console.error('Error fetching teams', error);
      }
    };

    fetchTeams();
  }, [event.id]);

  const handleJoinTeam = async (teamId) => {
    try {
      const previousTeamId = user.teamId;
      const response = await axios.post('http://localhost:5001/assignTeam', {
        userId: user._id,
        teamId: teamId,
        eventId: event.id,
        previousTeamId: previousTeamId,
      });
      setUser({ ...user, teamId: teamId });
      setIsPopupOpen(false);
      console.log('Joined team successfully', response.data);
    } catch (error) {
      console.error('Error joining team', error);
    }
  };
  if (!user) {
    return ("loading")
  }
  //this to transform a DD/MM/YYYY string into an date object
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const eventDate = parseDate(event.date);
  const currentDate = new Date();
  const canChangeTeam = currentDate < eventDate;

  return (
    <div className="event-card">
      <img src={event.image} alt={event.title} className="event-image" />
      <div className="event-details">
        <h2>{event.title}</h2>
        <p>{event.date}</p>
        <p>{event.participants} inscrits</p>
        <p>{event.sheeshes} Sheeshers</p>
        <button className="inscription-button">s'inscrire</button>
        <button className="quest-button">Voir les quêtes</button>
        {canChangeTeam && (
          <button className="join-team-button" onClick={() => setIsPopupOpen(true)}>
            {user.teamId ? 'Change team' : 'Join a team!'}
          </button>
        )}
      </div>
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <button className="close-button" onClick={() => setIsPopupOpen(false)}>
              &times;
            </button>
            <h2>Join a team</h2>
            {teams.map((team) => (
              <button key={team.id} onClick={() => handleJoinTeam(team.id)}>
                Join {team.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
