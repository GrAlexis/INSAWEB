import React, { useState, useEffect } from 'react';
import './ChallengeCard.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useUser } from '../../hooks/commonHooks/UserContext';

const ChallengeCard = ({ challenge }) => {
  const { user } = useUser();
  const { challengeId } = useParams();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTeamWarning, setShowTeamWarning] = useState(false);
  const [hasPosted, setHasPosted] = useState(false);

  useEffect(() => {
    if (challenge.id === challengeId) {
      setIsUploading(true);
    }
  }, [challenge.id, challengeId]);

  useEffect(() => {
    const checkUserPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/posts/byUserAndChallenge?userId=${user._id}&challengeId=${challenge.id}`);
        if (response.data.length > 0) {
          setHasPosted(true);
        }
      } catch (error) {
        console.error('Error checking user post', error);
      }
    };

    checkUserPost();
  }, [user._id, challenge.id]);

  const handleButtonClick = () => {
    setIsUploading(true);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if the challenge belongs to a team event and if the user is in a team
      console.log("challenge.eventid", challenge.eventId);
      const eventResponse = await axios.get(`http://localhost:5001/events/${challenge.eventId}`);
      const event = eventResponse.data;

      // Check if user is part of a team and if the team is in the event's teams list
      if (event.teams.length > 0) {
        if (!user.teamId || !event.teams.includes(user.teamId)) {
          setShowTeamWarning(true);
          setTimeout(() => setShowTeamWarning(false), 3000); // Hide after 3 seconds
          return;
        }
      }

      // Create form data using user and post info
      const formData = new FormData();
      formData.append('file', file);
      formData.append('challengeId', challenge.id);
      formData.append('user', user._id);
      formData.append('description', description);

      // Include teamId if the user is in a team
      if (user.teamId) {
        formData.append('teamId', user.teamId);
      }

      const response = await axios.post('http://localhost:5001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('File uploaded successfully', response.data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Reset the description and file fields
      setDescription('');
      setFile(null);
      setIsUploading(false);
      setHasPosted(true);
    } catch (error) {
      console.error('Error uploading file', error);
    }
  };
    // Check if the user is not logged in
    if (!user) {
      return <div>Please log in to participate in challenges.</div>;
    }

  return (
    <div className="challenge-card">
      <img src={challenge.icon} alt={challenge.title} className="challenge-icon" />
      <div className="challenge-details">
        <p>{challenge.title}</p>
        <p>{challenge.limitDate}</p>
        <p>{challenge.reward}</p>
        {!isUploading ? (
          <button className="participation-sheesh-button" onClick={handleButtonClick} disabled={hasPosted}>
            Je sheesh !
          </button>
        ) : (
          <form onSubmit={handleFormSubmit} className="upload-form">
            <input type="file" onChange={handleFileChange} disabled={hasPosted} />
            <textarea
              placeholder="Quelque chose à ajouter ?"
              value={description}
              onChange={handleDescriptionChange}
              disabled={hasPosted}
            />
            <button type="submit" disabled={hasPosted}>Poster</button>
          </form>
        )}
        {showSuccess && <div className="success-notification">Successfully posted</div>}
        {showTeamWarning && <div className="warning-notification">You must join a valid team to post</div>}
        {hasPosted && <div className="warning-notification">You have already posted for this challenge</div>}
      </div>
    </div>
  );
};

export default ChallengeCard;
