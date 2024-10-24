import React, { useState, useEffect } from 'react';
import config from '../../config';
import axios from 'axios';
import EventAdmin from '../EventAdmin/EventAdmin';
import './AdminPage.css';
import ManageUniverse from '../ManageUniverse/ManageUniverse';  
import { Link, useNavigate } from 'react-router-dom';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext'; 

const AdminPage = ({ showNavBar }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);  // State to control modal visibility
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventImage, setNewEventImage] = useState(null);  // State to store image file
  const [isCreating, setIsCreating] = useState(false);  // Loading state for event creation
  const [showManageUniverse, setShowManageUniverse] = useState(false);  // State to toggle ManageUniverse visibility
  const [backgroundColor, setBackgroundColor] = useState('#E8EACC'); 

  const navigate = useNavigate();

  const { selectedUniverse } = useUniverse();  // Get selected universe from the context

  useEffect(() => {
    const fetchStyles = async () => {
      var bgColor = '#E8EACC';
      if (selectedUniverse.styles && selectedUniverse.styles['mainBackgroundColor']) {
        bgColor = selectedUniverse.styles['mainBackgroundColor'];
      }
      console.log("bgColor "+bgColor)

      setBackgroundColor(bgColor);
    }
    if (selectedUniverse) {
      fetchStyles()
    }
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

  // Toggle ManageUniverse component visibility
  const toggleManageUniverse = () => {
    setShowManageUniverse(prevState => !prevState);  // Toggle the state
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
    <div className="admin-page" style={{backgroundColor}}>
      <div className="admin-topbar">
        <select onChange={(e) => setSelectedEvent(events.find(event => event._id === e.target.value))}>
          <option value="">Sélectionner un évènement</option>
          {events.map(event => (
            <option key={event._id} value={event._id}>{event.title}</option>
          ))}
        </select>
        <div className="admin-content">
        {selectedEvent ? (
          <EventAdmin event={selectedEvent} />
        ) : (
          <p></p>
        )}
      </div>
        <button onClick={toggleModal}>Créer un évènement</button> {/* Button to open modal */}
        {/* Button to toggle ManageUniverse */}
        <button onClick={toggleManageUniverse}>
          {showManageUniverse ? 'Masquer paramètres univers' : 'Paramètres univers'}
        </button>
      </div>



      <Link to='/register'>Inscrire des admins</Link>

      {/* Modal for creating a new event */}
      {isModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Créer un nouvel évènement</h2>
            <form onSubmit={handleCreateEvent}>
              <label>
                Titre: 
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  required
                />
              </label>
              <label>
                Date (optionnel):
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                />
              </label>
              <label>
                Illustration:
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewEventImage(e.target.files[0])}
                  required
                />
              </label>
              <div className="modal-buttons">
                <button type="submit" disabled={isCreating}>
                  {isCreating ? 'Création...' : 'Créer évènement'}
                </button>
                <button type="button" onClick={toggleModal}>Retour</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Conditionally render ManageUniverse */}
      {showManageUniverse && <ManageUniverse />}  {/* Show ManageUniverse component based on state */}
    </div>
  );
};

export default AdminPage;
