import React, { useState, useEffect } from 'react';
import './ChallengeCard.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useUser } from '../../hooks/commonHooks/UserContext';
import validatedIcon from '../../assets/icons/sheesh/validated.webp';
import waitingIcon from '../../assets/icons/sheesh/waiting.png';
import collectiveIcon from '../../assets/icons/sheesh/together.png';

const ChallengeCard = ({ challenge, isOpen, setOpenChallengeId }) => {
  const { user } = useUser();
  const { challengeId } = useParams();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTeamWarning, setShowTeamWarning] = useState(false);
  const [post, setPost] = useState(null);
  const [collectivePost, setCollectivePost] = useState(null);
  const [teammateName, setTeammateName] = useState('');

  useEffect(() => {
    if (challenge.id === challengeId) {
      setOpenChallengeId(challenge.id);
    }
  }, [challenge.id, challengeId, setOpenChallengeId]);

  useEffect(() => {
    const checkUserPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/posts/byUserAndChallenge?userId=${user._id}&challengeId=${challenge.id}`);
        if (response.data.length > 0) {
          setPost(response.data[0]);
        }

        if (challenge.isCollective && user.teamId) {
          const teamPostsResponse = await axios.get(`http://localhost:5000/posts/byTeamAndChallenge?teamId=${user.teamId}&challengeId=${challenge.id}`);
          if (teamPostsResponse.data.length > 0) {
            const teamPost = teamPostsResponse.data[0];
            if (teamPost.user !== user._id) {
              setCollectivePost(teamPost);
              const userResponse = await axios.get(`http://localhost:5000/users/${teamPost.user}`);
              setTeammateName(userResponse.data.name);
            } else {
              setPost(teamPost); // If the user posted the collective challenge
            }
          }
        }
      } catch (error) {
        console.error('Error checking user or team post', error);
      }
    };

    checkUserPost();
  }, [user._id, challenge.id, user.teamId, challenge.isCollective]);

  const handleButtonClick = () => {
    setOpenChallengeId(challenge.id);
  };

  const handleCloseForm = () => {
    setOpenChallengeId(null);
    setFile(null);
    setDescription('');
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
      const eventResponse = await axios.get(`http://localhost:5000/events/${challenge.eventId}`);
      const event = eventResponse.data;

      if (event.teams.length > 0 && (!user.teamId || !event.teams.includes(user.teamId))) {
        setShowTeamWarning(true);
        setTimeout(() => setShowTeamWarning(false), 3000);
        return;
      }

      if (challenge.isCollective) {
        const teamPostsResponse = await axios.get(`http://localhost:5000/posts/byTeamAndChallenge?teamId=${user.teamId}&challengeId=${challenge.id}`);
        if (teamPostsResponse.data.length > 0 && teamPostsResponse.data[0].user !== user._id) {
          setCollectivePost(teamPostsResponse.data[0]);
          const userResponse = await axios.get(`http://localhost:5000/users/${teamPostsResponse.data[0].user}`);
          setTeammateName(userResponse.data.name);
          setTimeout(() => setCollectivePost(null), 3000);
          return;
        }
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('challengeId', challenge.id);
      formData.append('user', user._id);
      formData.append('description', description);
      if (user.teamId) {
        formData.append('teamId', user.teamId);
      }

      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      setDescription('');
      setFile(null);
      setOpenChallengeId(null);
      setPost(response.data);
    } catch (error) {
      console.error('Error uploading file', error);
    }
  };

  if (!user) return <div>Please log in to participate in challenges.</div>;

  return (
    <div className="challenge-card">
      <img src={challenge.icon} alt={challenge.title} className="challenge-icon" />
      <div className="challenge-details">
        <p>{challenge.title}</p>
        <p>{challenge.limitDate}</p>
        <p>{challenge.reward}</p>
        {challenge.isCollective && <img src={collectiveIcon} alt="Collective Challenge" className="collective-icon" />}
        {!isOpen ? (
          <button className="participation-sheesh-button" onClick={handleButtonClick} disabled={post || collectivePost}>
            Je sheesh !
          </button>
        ) : (
          <div>
            <form onSubmit={handleFormSubmit} className="upload-form">
              <input type="file" onChange={handleFileChange} disabled={post || collectivePost} />
              <textarea
                placeholder="Quelque chose à ajouter ?"
                value={description}
                onChange={handleDescriptionChange}
                disabled={post || collectivePost}
              />
              <button type="submit" disabled={post || collectivePost}>Poster</button>
            </form>
            <button className="close-form-button" onClick={handleCloseForm}>Fermer</button>
          </div>
        )}
        {showSuccess && <div className="success-notification">Successfully posted</div>}
        {showTeamWarning && <div className="warning-notification">You must join a valid team to post</div>}
        {post && <div className="warning-notification">You have already posted for this challenge</div>}
      </div>
      {(post || collectivePost) && (
        <div className="status-icon">
          <img
            src={(post ? post.isValidated : collectivePost.isValidated) ? validatedIcon : waitingIcon}
            alt={(post ? post.isValidated : collectivePost.isValidated) ? "Validated Icon" : "Waiting Icon"}
            className="status-icon-img"
          />
        </div>
      )}
      {collectivePost && (
        <div className="team-post-notification">
          {`A member of your team (${teammateName}) has already posted for this collective challenge`}
        </div>
      )}
    </div>
  );
};

export default ChallengeCard;
