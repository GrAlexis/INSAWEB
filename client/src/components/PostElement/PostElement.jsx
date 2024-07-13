import React, { useEffect, useState } from 'react';
import './PostElement.css';
import axios from 'axios';

import { getRewardIcon, getPrestigeIcon } from '../../utils/imageMapper';
import { formatDate } from '../../utils/dateFormatter';
import { useNavigate } from 'react-router-dom';


import logo from '../../assets/logos/astus.png';
import smiley_face from '../../assets/buttons/likes/thumbs-up.png'


const PostElement = ({ post }) => {

    const [challenge, setChallenge] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
      const fetchChallenge = async () => {
        try {
          const response = await axios.get(`http://localhost:5001/challenges/${post.challengeId}`);
          setChallenge(response.data);
        } catch (error) {
          console.error('Error fetching challenge', error);
        }
      };
  
      fetchChallenge();
    }, [post.challengeId]);

    const handleSheeshClick = () => {
      navigate(`/sheesh/${post.challengeId}`);
    };
  
    if (!challenge) {
      return <div>Loading...</div>;
    }

  return (
    <div className="post">
      <div className="post-header">
        <img src={logo} alt="Logo" className="logo" />
        <div className="post-info">
          <span className="date">{challenge.event} - {formatDate(post.date)}</span>
          <span className="user">{post.user}</span>
        </div>
        <div className="status">
          <span className="status-text">En cours</span>
        </div>
      </div>
      <div className="post-image">
        <img src={`http://localhost:5001/file/${post.picture}`} alt={challenge.title} />
      </div>
      <div className="post-body">
        <div className="reward">
          <img src={getRewardIcon(challenge.reward)} alt="Reward Icon" className="reward-icon" />
          <span className="reward-text">{challenge.reward}</span>
        </div>
        <img src={getPrestigeIcon(challenge.prestige)} alt="Prestige Icon" className="points-icon" />
        <div className="post-title">
          <span>{challenge.title}</span>
        </div>
        <div className="post-likes">
          <button className="likes-button">
            <img src={smiley_face} alt="Likes Icon" className="likes-icon" />
          </button>
          {post.likes > 0 && <span>{post.likes}</span>}
        </div>
      </div>
      <div className="post-description">
        <p>{post.description}</p>
      </div>
      <div className="post-footer">
        <button className="sheesh-button" onClick={handleSheeshClick}>Je Sheesh!</button>
      </div>
    </div>
  );
};

export default PostElement;
