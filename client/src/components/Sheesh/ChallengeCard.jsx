import React, { useState } from 'react';
import './ChallengeCard.css';
import axios from 'axios';

const ChallengeCard = ({ challenge }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);

  const handleButtonClick = () => {
    setIsUploading(true);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log(file);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('challengeName', challenge.title);
    formData.append('user', 'currentUser'); // Replace with actual user information

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
            <button type="submit">Upload</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;
