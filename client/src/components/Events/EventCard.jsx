import React, { useState, useEffect } from 'react';
import config from '../../config';
import './EventCard.css';
import axios from 'axios';
import { useUser } from '../../hooks/commonHooks/UserContext';
import Timer from '../Timer/Timer';

const EventCard = ({ event }) => {
  const { user, setUser } = useUser();
  const [teams, setTeams] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentTeamName, setCurrentTeamName] = useState('');
  const [timeLeftInHours, setTimeLeftInHours] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(config.backendAPI + `/events/${event.id}/teams`);
        const teamsWithMembersCount = await Promise.all(
          response.data.map(async (team) => {
            const membersResponse = await axios.get(config.backendAPI + `/teams/${team.id}/members`);
            return {
              ...team,
              membersCount: membersResponse.data.length,
            };
          })
        );
        setTeams(teamsWithMembersCount);

        if (user.teamId) {
          const currentTeam = teamsWithMembersCount.find((team) => team.id === user.teamId);
          setCurrentTeamName(currentTeam ? currentTeam.name : 'No team');
        } else {
          setCurrentTeamName('No team');
        }
      } catch (error) {
        console.error('Error fetching teams', error);
      }
    };

    fetchTeams();

    // Calculate the time left until the event date in hours
    const calculateTimeLeft = () => {
      const eventDate = parseDate(event.date);
      const currentDate = new Date();
      const timeDifference = eventDate - currentDate; // Difference in milliseconds
      const hoursLeft = Math.floor(timeDifference / (1000 * 60 * 60)); // Convert to hours
      setTimeLeftInHours(hoursLeft > 0 ? hoursLeft : 0); // Ensure the value is not negative
    };

    calculateTimeLeft();
  }, [event.id, user, event.date]);

  const handleJoinTeam = async (teamId) => {
    if (user.teamId === teamId) {
      setIsPopupOpen(false);
      return;
    }
    try {
      var previousTeamId = '';
      if (user.teamId) {
        previousTeamId = user.teamId;
      } else {
        previousTeamId = '';
      }
      const response = await axios.post(config.backendAPI + '/assignTeam', {
        userId: user._id,
        teamId: teamId,
        eventId: event.id,
        previousTeamId: previousTeamId,
      });
      setUser({ ...user, teamId: teamId });
      setCurrentTeamName(teams.find((team) => team.id === teamId).name);
      setIsPopupOpen(false);
      console.log('Joined team successfully', response.data);
    } catch (error) {
      console.error('Error joining team', error);
    }
  };

  if (!user) {
    return 'Loading...';
  }

  // Transform DD/MM/YYYY string into a Date object
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

        {/* Timer component */}
        {timeLeftInHours !== null && <Timer hours={timeLeftInHours} />}

        {canChangeTeam && (
          <button className="sheesh-button" onClick={() => setIsPopupOpen(true)}>
            {user.teamId ? 'Changer d\'equipe' : 'Rejoins une equipe!'}
          </button>
        )}
      </div>
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <button className="close-button" onClick={() => setIsPopupOpen(false)}>
              &times;
            </button>
            <h2>Rejoindre une équipe</h2>
            <p>Vous êtes dans : {currentTeamName}</p>
            {teams.map((team) => {
              const isTeamFull = team.maxMembers && team.membersCount >= team.maxMembers;
              return (
                <div key={team.id} className="team-option">
                  <button
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={isTeamFull}
                    className={isTeamFull ? 'team-button-disabled' : 'team-button'}
                  >
                    Rejoindre {team.name}
                  </button>
                  <p>
                    {team.membersCount} joueur{team.membersCount !== 1 ? 's' : ''}
                    {team.maxMembers ? ` / ${team.maxMembers}` : ''}
                  </p>
                  {isTeamFull && <p className="team-full-warning">Nombre max de joueurs atteint</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
