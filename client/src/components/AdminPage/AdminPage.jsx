import React, { useState, useEffect } from 'react';
import config from '../../config';
import axios from 'axios';
import EventAdmin from '../EventAdmin/EventAdmin';
import './AdminPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext';  // Assuming UniverseContext is available



const AdminPage = ({ showNavBar }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const { selectedUniverse } = useUniverse();  // Get selected universe from the context

  useEffect(() => {

    const token = localStorage.getItem('token');

    //this is to ensure navbar mounts when refreshing
    showNavBar()
    // Fetch events when the component mounts
    axios.get(`${config.backendAPI}/events`, {
      params: { universeId: selectedUniverse._id }  // Include universeId in the query params
    })
      .then(response => setEvents(response.data))
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <select onChange={(e) => setSelectedEvent(events.find(event => event._id === e.target.value))}>
          <option value="">Select Event</option>
          {events.map(event => (
            <option key={event._id} value={event._id}>{event.title}</option>
          ))}
        </select>
      </div>
      <div className="admin-content">
        {selectedEvent ? (
          <EventAdmin event={selectedEvent} />
        ) : (
          <p>Please select an event to administrate.</p>
        )}
      </div>
      <Link to='/register'>Inscrire des admins</Link>
    </div>
  );
};

export default AdminPage;
