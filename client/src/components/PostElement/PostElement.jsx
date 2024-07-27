import React, { useEffect, useState } from 'react';
import './PostElement.css';
import axios from 'axios';

import { getRewardIcon, getPrestigeIcon } from '../../utils/imageMapper';
import { formatDate } from '../../utils/dateFormatter';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/commonHooks/UserContext';

import logo from '../../assets/logos/astus.png';
import smiley_face from '../../assets/buttons/likes/thumbs-up.png';

const PostElement = ({ post, onDelete }) => {
  const { user } = useUser();
  const [challenge, setChallenge] = useState(null);
  const [event, setEvent] = useState(null);
  const [team, setTeam] = useState(null);
  const [postUser, setPostUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallengeAndEvent = async () => {
      try {
        const challengeResponse = await axios.get(`http://localhost:5001/challenges/${post.challengeId}`);
        const fetchedChallenge = challengeResponse.data;
        setChallenge(fetchedChallenge);

        const eventResponse = await axios.get(`http://localhost:5001/events/${fetchedChallenge.eventId}`);
        setEvent(eventResponse.data);
      } catch (error) {
        console.error('Error fetching challenge or event', error);
      }
    };

    const fetchTeam = async () => {
      if (post.teamId) {
        try {
          const teamResponse = await axios.get(`http://localhost:5001/teams/${post.teamId}`);
          setTeam(teamResponse.data);
        } catch (error) {
          console.error('Error fetching team', error);
        }
      }
    };

    const fetchUser = async () => {
      try {
        const userResponse = await axios.get(`http://localhost:5001/users/${post.user}`);
        setPostUser(userResponse.data);
      } catch (error) {
        console.error('Error fetching post user', error);
      }
    };

    fetchChallengeAndEvent();
    fetchTeam();
    fetchUser();
  }, [post.challengeId, post.teamId, post.user]);

  const handleSheeshClick = () => {
    navigate(`/sheesh/${post.challengeId}`);
  };

  const handleDeleteClick = async () => {
    try {
      await axios.delete(`http://localhost:5001/posts/${post._id}`);
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error('Error deleting post', error);
    }
  };

  if (!challenge || !event || !postUser || !user ) {
    return <div>Loading...</div>;
  }

  return (
    <div className="post">
      <div className="post-header">
        <img src={logo} alt="Logo" className="logo" />
        <div className="post-info">
          <span className="date">{event.title} - {formatDate(post.date)}</span>
          <span className="user">{postUser.name}</span>
          {team && <span className="team">Team: {team.name}</span>}
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
        {user._id === postUser._id && (
          <button className="delete-button" onClick={handleDeleteClick}>Delete</button>
        )}
      </div>
    </div>
  );
};

export default PostElement;
