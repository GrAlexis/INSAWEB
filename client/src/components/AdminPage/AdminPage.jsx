import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventAdmin from '../EventAdmin/EventAdmin';
import './AdminPage.css';
import { useNavigate } from 'react-router-dom';



const AdminPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {

    const token = sessionStorage.getItem('token');

        if (!token) {
          // If no token, redirect to login page
          navigate('/login');
          return; // Exit useEffect early to prevent further code execution
        }

    // Fetch events when the component mounts
    axios.get('http://localhost:5000/events')
      .then(response => setEvents(response.data))
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <select onChange={(e) => setSelectedEvent(events.find(event => event.id === e.target.value))}>
          <option value="">Select Event</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.title}</option>
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
    </div>
  );
};

export default AdminPage;
