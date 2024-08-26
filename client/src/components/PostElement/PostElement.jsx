import React, { useEffect, useState } from 'react';
import './PostElement.css';
import axios from 'axios';

import { getRewardIcon } from '../../utils/imageMapper';
import validatedIcon from '../../assets/icons/sheesh/validated.webp'
import waitingIcon from '../../assets/icons/sheesh/waiting.png'
import {parseReward} from '../../utils/rewardParser'
import { formatDate } from '../../utils/dateFormatter';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/commonHooks/UserContext';

import logo from '../../assets/logos/astus.png';
import smiley_face from '../../assets/buttons/likes/thumbs-up.png';

const PostElement = ({ post, onDelete, fetchPosts }) => {
  const { user } = useUser();
  const [challenge, setChallenge] = useState(null);
  const [event, setEvent] = useState(null);
  const [team, setTeam] = useState(null);
  const [postUser, setPostUser] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallengeAndEvent = async () => {
      try {
        const challengeResponse = await axios.get(`http://localhost:5000/challenges/${post.challengeId}`);
        const fetchedChallenge = challengeResponse.data;
        setChallenge(fetchedChallenge);

        const eventResponse = await axios.get(`http://localhost:5000/events/${fetchedChallenge.eventId}`);
        setEvent(eventResponse.data);
      } catch (error) {
        console.error('Error fetching challenge or event', error);
      }
    };

    const fetchTeam = async () => {
      if (post.teamId) {
        try {
          const teamResponse = await axios.get(`http://localhost:5000/teams/${post.teamId}`);
          setTeam(teamResponse.data);
        } catch (error) {
          console.error('Error fetching team', error);
        }
      }
    };

    const fetchUser = async () => {
      try {
        const userResponse = await axios.get(`http://localhost:5000/users/${post.user}`);
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

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/posts/${post._id}`);
      if (onDelete) {
        onDelete(post._id);
      }
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Error deleting post', error);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const handleValidateClick = async () => {
    try {
      console.log('parsereward',parseReward(challenge.reward))
      console.log('eventId',event.id)
        const response = await axios.post(`http://localhost:5000/admin/validatePost/${post._id}`, {
            isAdmin: user.isAdmin,
            rewardPoints : parseReward(challenge.reward),
            eventId : event.id
        });
        if (response.status === 200) {
          fetchPosts(); // Refresh posts after validation
        }
    } catch (error) {
        console.error('Error validating post', error);
    }
  };

  // Helper function to check if the file is a video
  const isVideo = (fileName) => {
    return /\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(fileName);
  };


  if (!challenge || !event || !postUser || !user) {
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
          <img 
            src={post.isValidated ? validatedIcon : waitingIcon} 
            alt={post.isValidated ? "Validated Icon" : "Waiting Icon"} 
            className="status-icon" 
          />
        </div>
      </div>
      <div className="post-media">
        {isVideo(post.picture) ? (
          <video controls className="post-video">
            <source src={`http://localhost:5000/file/${post.picture}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={`http://localhost:5000/file/${post.picture}`} alt={challenge.title} className="post-image" />
        )}
      </div>
      <div className="post-body">
        <div className="reward">
          <img src={getRewardIcon(challenge.reward)} alt="Reward Icon" className="reward-icon" />
          <span className="reward-text">{challenge.reward}</span>
        </div>
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
        {(user._id === postUser._id || (user.isAdmin && !post.isValidated) )&& (
          <button className="delete-button" onClick={handleDeleteClick}>Delete</button>
        )}
        {user.isAdmin && (
          <button className="validate-button" onClick={handleValidateClick}>
            {post.isValidated ? 'Unvalidate Participation' : 'Validate Participation'}
          </button>
        )}
      </div>

      {showConfirmDelete && (
        <div className="confirm-delete-popup">
          <div className="confirm-delete-content">
            <p>Are you sure you want to delete this post?</p>
            <button className="confirm-delete-button" onClick={confirmDelete}>Yes</button>
            <button className="cancel-delete-button" onClick={cancelDelete}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostElement;
