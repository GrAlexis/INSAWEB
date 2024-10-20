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
  const [isModalVisible, setModalVisible] = useState(false);  // State to control modal visibility
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventImage, setNewEventImage] = useState(null);  // State to store image file
  const [isCreating, setIsCreating] = useState(false);  // Loading state for event creation
  const navigate = useNavigate();

  const { selectedUniverse } = useUniverse();  // Get selected universe from the context

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Ensure navbar mounts when refreshing
    showNavBar();

    // Fetch events when the component mounts
    axios.get(`${config.backendAPI}/events`, {
      params: { universeId: selectedUniverse._id }  // Include universeId in the query params
    })
      .then(response => setEvents(response.data))
      .catch(error => console.error('Error fetching events:', error));
  }, [selectedUniverse]);

  // Toggle modal visibility
  const toggleModal = () => {
    setModalVisible(prevVisible => !prevVisible);
  };

  // Handle form submission to create a new event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsCreating(true);  // Set loading state

    if (!newEventTitle || !newEventImage) {
      alert('Please provide both a title and an image.');
      setIsCreating(false);
      return;
    }

    try {
      // Create form data as in the publication upload process
      console.log("juste avant de créer le formData");
      console.log("neweventimage "+newEventImage.size)
      const formData = new FormData();
      formData.append('file', newEventImage);  // Append the image file
      formData.append('title', newEventTitle);  // Append the title
      formData.append('date', newEventDate);  // Append the optional date
      formData.append('universeId', selectedUniverse._id);  // Append universeId

      const response = await axios.post(`${config.backendAPI}/events/create`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update the events list with the newly created event
      setEvents([...events, response.data]);

      // Clear the form inputs
      setNewEventTitle('');
      setNewEventDate('');
      setNewEventImage(null);
      setIsCreating(false);
      setModalVisible(false);  // Close the modal after successful creation
    } catch (error) {
      console.error('Error creating event:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <select onChange={(e) => setSelectedEvent(events.find(event => event._id === e.target.value))}>
          <option value="">Sélectionner un évènement</option>
          {events.map(event => (
            <option key={event._id} value={event._id}>{event.title}</option>
          ))}
        </select>
        <button onClick={toggleModal}>Create New Event</button> {/* Button to open modal */}
      </div>

      <div className="admin-content">
        {selectedEvent ? (
          <EventAdmin event={selectedEvent} />
        ) : (
          <p>Please select an event to administrate.</p>
        )}
      </div>

      <Link to='/register'>Inscrire des admins</Link>

      {/* Modal for creating a new event */}
      {isModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create a New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <label>
                Event Title:
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  required
                />
              </label>
              <label>
                Event Date (optional):
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                />
              </label>
              <label>
                Event Image:
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewEventImage(e.target.files[0])}
                  required
                />
              </label>
              <div className="modal-buttons">
                <button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Event'}
                </button>
                <button type="button" onClick={toggleModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
