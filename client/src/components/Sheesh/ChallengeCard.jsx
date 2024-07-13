import React, { useState, useEffect } from 'react';
import './ChallengeCard.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';


const ChallengeCard = ({ challenge }) => {

  const { challengeId } = useParams();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (challenge.id === challengeId) {
      setIsUploading(true);
    }
  }, [challenge.id, challengeId]);

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
    console.log(file);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('challengeId', challenge.id);
    formData.append('user', 'currentUser'); // Replace with actual user information
    formData.append('description', description);


    try {
      const response = await axios.post('http://localhost:5001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('File uploaded successfully', response.data);
    } catch (error) {
      console.error('Error uploading file', error);
    }
  };
  return (
    <div className="challenge-card">
      <img src={challenge.icon} alt={challenge.title} className="challenge-icon" />
      <div className="challenge-details">
        <p>{challenge.title}</p>
        <p>{challenge.limitDate}</p>
        <p>{challenge.reward}</p>
        {!isUploading ? (
          <button className="participation-sheesh-button" onClick={handleButtonClick}>
            Je sheesh !
          </button>
        ) : (
          <form onSubmit={handleFormSubmit} className="upload-form">
            <input type="file" onChange={handleFileChange} />
            <textarea
              placeholder="Quelque chose à ajouter ?"
              value={description}
              onChange={handleDescriptionChange}
            />
            <button type="submit">Poster</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;
