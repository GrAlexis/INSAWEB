import React, { useState } from 'react';
import config from '../../config';
import ManageChallenges from '../ManageChallenges/ManageChallenges';
import ManageTeams from '../ManageTeams/ManageTeams';
import './EventAdmin.css';

const EventAdmin = ({ event }) => {
  const [view, setView] = useState('challenges');

  return (
    <div className="event-admin">
      <h2>Administering Event: {event.title}</h2>
      <div className="admin-buttons">
        <button
          className={`admin-button ${view === 'challenges' ? 'active' : ''}`}
          onClick={() => setView('challenges')}
        >
          Challenges
        </button>
        <button
          className={`admin-button ${view === 'teams' ? 'active' : ''}`}
          onClick={() => setView('teams')}
        >
          Teams
        </button>
      </div>
      <div className="admin-content">
        {view === 'challenges' ? (
          <ManageChallenges eventId={event._id} />
        ) : (
          <ManageTeams eventId={event._id} />
        )}
      </div>
    </div>
  );
};

export default EventAdmin;
