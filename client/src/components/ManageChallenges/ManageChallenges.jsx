import React, { useState, useEffect } from 'react';
import config from '../../config';
import axios from 'axios';
import './ManageChallenges.css';
import { imageMapper } from '../../utils/imageMapper';
import modifyButtonIcon from '../../assets/buttons/modify.png';

const ManageChallenges = ({ eventId }) => {
  const [challenges, setChallenges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editChallenge, setEditChallenge] = useState(null);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    reward: '',
    isCollective: false,
    icon: ''
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState(null);
  const [filterNotAccepted, setFilterNotAccepted] = useState(false); // New state for filtering

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewChallenge(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editChallenge) {
        // If editing an existing challenge, update it
        const response = await axios.put(config.backendAPI+`/challenges/${editChallenge.id}`, {
          ...newChallenge,
          eventId,
        });
        setChallenges(challenges.map(challenge => challenge.id === editChallenge.id ? response.data : challenge));
      } else {
        // Fetch all challenges to generate a unique ID
        const allChallengeIdsResponse = await axios.get(config.backendAPI+'/challenges/ids');
        const allChallengeIds = allChallengeIdsResponse.data.map(challenge => parseInt(challenge.id, 10));

        // Generate a unique ID for the new challenge
        const newId = (allChallengeIds.length > 0 ? Math.max(...allChallengeIds) + 1 : 10) || 10;

        const response = await axios.post(config.backendAPI+'/challenges', {
          id: newId,
          eventId,
          ...newChallenge,
          isAccepted: true,
        });

        setChallenges([...challenges, response.data]);
      }

      setShowForm(false);
      setEditChallenge(null);
      setNewChallenge({
        title: '',
        reward: '',
        isCollective: false,
        icon: ''
      });
    } catch (error) {
      console.error('Error saving challenge:', error);
    }
  };

  const handleDeleteClick = (challenge) => {
    setChallengeToDelete(challenge);
    setShowConfirmationModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(config.backendAPI+`/challenges/${challengeToDelete.id}`);
      setChallenges(challenges.filter(challenge => challenge.id !== challengeToDelete.id));
      setShowConfirmationModal(false);
      setChallengeToDelete(null);
    } catch (error) {
      console.error('Error deleting challenge:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmationModal(false);
    setChallengeToDelete(null);
  };

  const handleEditClick = (challenge) => {
    setEditChallenge(challenge);
    setNewChallenge({
      title: challenge.title,
      reward: challenge.reward,
      isCollective: challenge.isCollective,
      icon: challenge.icon || ''
    });
    setShowForm(true);
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      const response = await axios.put(config.backendAPI + `/challenges/${challengeId}`, {
        isAccepted: true
      });
      setChallenges(challenges.map(challenge => challenge.id === challengeId ? response.data : challenge));
    } catch (error) {
      console.error('Error accepting challenge:', error);
    }
  };

  useEffect(() => {
    axios.get(config.backendAPI+`/challenges?eventId=${eventId}`)
      .then(response => setChallenges(response.data))
      .catch(error => console.error('Error fetching challenges:', error));
  }, [eventId]);

  // Toggle filtering for not accepted challenges
  const toggleFilterNotAccepted = () => {
    setFilterNotAccepted(prevState => !prevState);
  };

  // Filter challenges based on the filterNotAccepted state
  const filteredChallenges = filterNotAccepted
    ? challenges.filter(challenge => !challenge.isAccepted)
    : challenges;

  return (
    <div className="manage-challenges">
      {/* Button to toggle filtering */}
      <button onClick={toggleFilterNotAccepted} className="toggle-filter-button">
        {filterNotAccepted ? 'Voir tous les Sheesh' : 'Voir les Sheesh proposés'}
      </button>
      <div>
        <button className="add-challenge-button" onClick={() => setShowForm(!showForm)}>
          {editChallenge ? "Edit Challenge" : "+"}
        </button>
      </div>


      {showForm && (
        <div className="challenge-form-card">
          <form onSubmit={handleFormSubmit}>
            <label>
              Title:
              <input
                type="text"
                name="title"
                value={newChallenge.title}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Reward:
              <input
                type="text"
                name="reward"
                value={newChallenge.reward}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Icon:
              <select
                name="icon"
                value={newChallenge.icon}
                onChange={handleInputChange}
                required
              >
                <option value="">Select an Icon</option>
                {Object.keys(imageMapper).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </label>
            <label>
              Collective:
              <input
                type="checkbox"
                name="isCollective"
                checked={newChallenge.isCollective}
                onChange={handleInputChange}
              />
            </label>
            <button type="submit">{editChallenge ? "Update Challenge" : "Add Challenge"}</button>
          </form>
        </div>
      )}

      <div className="challenge-list">
        {filteredChallenges.map(challenge => (
          <div key={challenge.id} className="challenge-item">
            <button className="delete-button delete-cross" onClick={() => handleDeleteClick(challenge)}>x</button>
            <button className="edit-challenge-button" onClick={() => handleEditClick(challenge)}>
              <img src={modifyButtonIcon} alt="Modify" />
            </button>
            <h3>{challenge.title}</h3>
            <p>Reward: {challenge.reward}</p>
            {!challenge.isAccepted && (
              <button className="accept-challenge-button" onClick={() => handleAcceptChallenge(challenge.id)}>
                Accepter
              </button>
            )}
          </div>
        ))}
      </div>

      {showConfirmationModal && (
        <div className="user-transfer-panel">
          <div className="confirm-delete-content">
            <p>Are you sure you want to delete this challenge?</p>
            <button className="confirm-delete-button" onClick={handleDeleteConfirm}>Yes</button>
            <button className="cancel-delete-button" onClick={handleDeleteCancel}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageChallenges;
