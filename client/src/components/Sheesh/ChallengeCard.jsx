import React from 'react';
import './ChallengeCard.css';

const ChallengeCard = ({ challenge }) => {
  return (
    <div className="challenge-card">
      <img src={challenge.icon} alt={challenge.title} className="challenge-icon" />
      <div className="challenge-details">
        <p>{challenge.title}</p>
        <p>{challenge.limitDate}</p>
        <p>{challenge.reward}</p>
        <button className="participation-sheesh-button">Je sheesh !</button>
      </div>
    </div>
  );
};

export default ChallengeCard;
