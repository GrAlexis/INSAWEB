import React, { useEffect, useState } from 'react';
import './PostElement.css';
import config from '../../config';
import axios from 'axios';

import { getRewardIcon } from '../../utils/imageMapper';
import validatedIcon from '../../assets/icons/sheesh/validated.webp'
import waitingIcon from '../../assets/icons/sheesh/waiting.png'
import chokbarButton from '../../assets/buttons/chokbar.png'
import {parseReward} from '../../utils/rewardParser'
import { formatDate } from '../../utils/dateFormatter';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/commonHooks/UserContext';
import CommentModal from '../CommentModal/CommentModal'; // Modal for viewing all comments
import { LazyLoadImage } from 'react-lazy-load-image-component';
import logo from '../../assets/logos/astus.png';

const PostElement = ({ post, onDelete, fetchPosts }) => {
  const { user } = useUser();
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState();
  const [challenge, setChallenge] = useState(null);
  const [event, setEvent] = useState(null);
  const [team, setTeam] = useState(null);
  const [postUser, setPostUser] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [comments, setComments] = useState([]); // New state for comments
  const [newComment, setNewComment] = useState(''); // New state for the input comment
  const [showCommentModal, setShowCommentModal] = useState(false); // State for modal visibility
  const [videoUrl, setVideoUrl] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [zoomScale, setZoomScale] = useState(1); 





  const navigate = useNavigate();

  // Fetch comments when the post is loaded
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(config.backendAPI + `/posts/${post._id}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [post._id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return; // Avoid empty comments

    try {
      const response = await axios.post(config.backendAPI + `/posts/${post._id}/comment`, {
        userId: user._id,
        text: newComment
      });
      setComments(response.data); // Update the comments state with the new comment
      setNewComment(''); // Clear the comment input
    } catch (error) {
      console.error('Error adding comment', error);
    }
  };

  const handleLikeClick = async () => {
    try {
      if (liked) {
        // Unlike the post
        await axios.post(`${config.backendAPI}/posts/${post._id}/unlike`, { userId: user._id });
        setLikes(likes - 1);
      } else {
        // Like the post
        await axios.post(`${config.backendAPI}/posts/${post._id}/like`, { userId: user._id });
        setLikes(likes + 1);
      }
      setLiked(!liked); // Toggle the liked state
    } catch (error) {
      console.error('Error liking/unliking the post', error);
    }
    setIsAnimating(true); // Trigger the animation
  };

  useEffect(() => {
    const fetchChallengeAndEvent = async () => {
      try {
        const challengeResponse = await axios.get(`${config.backendAPI}/challenges/${post.challengeId}`);
        const fetchedChallenge = challengeResponse.data;
        setChallenge(fetchedChallenge);

        const eventResponse = await axios.get(`${config.backendAPI}/events/${fetchedChallenge.eventId}`);
        setEvent(eventResponse.data);
      } catch (error) {
        console.error('Error fetching challenge or event', error);
      }
    };

    const fetchTeam = async () => {
      if (post.teamId) {
        try {
          const teamResponse = await axios.get(`${config.backendAPI}/teams/${post.teamId}`);
          setTeam(teamResponse.data);
        } catch (error) {
          console.error('Error fetching team', error);
        }
      }
    };

    const fetchUser = async () => {
      try {
        const userResponse = await axios.get(`${config.backendAPI}/api/user/${post.user}`);
        setPostUser(userResponse.data);
      } catch (error) {
        console.error('Error fetching post user', error);
      }
    };

    fetchChallengeAndEvent();
    fetchTeam();
    fetchUser();
  }, [post.challengeId, post.teamId, post.user]);

  // A separate useEffect for the user-related logic
  useEffect(() => {
    if (user) {
      setLiked(post.likedBy.includes(user._id));
    }
  }, [user, post.likedBy]);  // Dependencies: user and post.likedBy

  const handleSheeshClick = () => {
    navigate(`/sheesh/${post.challengeId}`);
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${config.backendAPI}/posts/${post._id}`);
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
        const response = await axios.post(`${config.backendAPI}/admin/validatePost/${post._id}`, {
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
  
  const handlePlayVideo = async () => {
    try {
      // Fetch the video file from the server
      const response = await fetch(`${config.backendAPI}/file/${post.picture}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }

      // Create a blob from the video response
      const videoBlob = await response.blob();

      // Create a local URL for the video using the Blob
      const localVideoUrl = URL.createObjectURL(videoBlob);

      // Set the video URL and start playing
      setVideoUrl(localVideoUrl);
      setIsVideoPlaying(true);

    } catch (error) {
      console.error('Error fetching the video:', error);
    }
  };

  const handleVideoEnd = () => {
    setIsVideoPlaying(false); // Go back to the thumbnail after the video finishes
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
    setScrollPosition(window.scrollY); 
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setZoomScale(1);
  };

  const handleZoom = (e) => {
    e.preventDefault();
    if (zoomScale === 1) {
      setZoomScale(2);
    } else {
      setZoomScale(1); 
    }
  };

  const handleWheelZoom = (e) => {
    e.preventDefault();
    let newScale = zoomScale + e.deltaY * -0.01;
    newScale = Math.min(Math.max(1, newScale), 3); 
    setZoomScale(newScale);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);
  
  

  if (!challenge || !event || !postUser || !user) {
    return <div>Loading...</div>;
  }
  const openCommentModal = () => setShowCommentModal(true);
  const closeCommentModal = () => setShowCommentModal(false);

  return (
    <div className="post">
      <div className="post-header">
        <img src={logo} alt="Logo" className="logo" />
        <div className="post-info">
          <span className="date">{event.title} - {formatDate(post.date)}</span>
          <span className="user">{postUser.name} {postUser.lastName}</span>
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
          !isVideoPlaying ? (
            <div className="video-thumbnail" onClick={handlePlayVideo}>
              <LazyLoadImage
                src={`${config.backendAPI}/file/${post.thumbnail}`}
                alt="Video Thumbnail"
                className="thumbnail-image"
              />
              <div className="play-button-overlay"></div>
            </div>
          ) : (
            <video controls="controls" className="post-video" autoPlay playsInline onEnded={handleVideoEnd}>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )
        ) : (
          <LazyLoadImage
            alt={challenge.title}
            effect="blur"
            src={`${config.backendAPI}/file/${post.picture}`}
            className="post-image"
            onClick={() => handleImageClick(`${config.backendAPI}/file/${post.picture}`)} // Open image in modal on click
          />
        )}
      </div>
      
      {isModalOpen && (
        <div
          className="modal"
          style={{
            top: `${scrollPosition}px`,
          }}
          onClick={closeModal}
        >
          <div
            className="modal-content-wrapper"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheelZoom}
          >
            <span className="close-modal" onClick={closeModal}>×</span>
            <img
              className={`modal-content ${zoomScale > 1 ? 'zoomed' : ''}`}
              src={selectedImage}
              alt="Enlarged"
              style={{ transform: `scale(${zoomScale})` }} 
              onClick={handleZoom}
            />
          </div>
        </div>
      )}

      <div className="post-body">
        <div className="reward">
          <img src={getRewardIcon(challenge.reward)} alt="Reward Icon" className="reward-icon" />
          <span className="reward-text">{challenge.reward}</span>
        </div>
        <div className="post-title">
          <span>{challenge.title}</span>
        </div>

        <div className="post-likes">
          <button 
            className={`likes-button ${liked ? 'liked' : ''} ${isAnimating ? 'shake' : ''}`} 
            onClick={handleLikeClick}
            onAnimationEnd={() => setIsAnimating(false)} // Remove animation class after animation completes
          >
            <img src={chokbarButton} alt="Likes Icon" className="likes-icon" />
          </button>
          {likes > 0 && <span>{likes}</span>} {/* Only show the number of likes if greater than 0 */}
        </div>

      </div>
      <div className="post-description">
        <p>{post.description}</p>
      </div>
            {/* Comments Section */}
            <div className="post-comments">
        <h4>Commentaires</h4>
        {comments.slice(0, 3).map(comment => (
          <div key={comment._id} className="comment">
            <p><strong>{comment.userLabel}</strong> : {comment.text}</p>
          </div>
        ))}
        {comments.length > 0 && (
          <button onClick={openCommentModal}>Voir plus</button>
        )}

        {/* Add new comment */}
        <div className="add-comment">
          <input
            type="text"
            placeholder="À Méditérannée..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>Commenter</button>
        </div>
      </div>

      {showCommentModal && (
        <CommentModal 
          comments={comments} 
          onClose={closeCommentModal} 
          onDeleteComment={async (commentId) => {
            try {
              const response = await axios.delete(config.backendAPI + `/posts/${post._id}/comments/${commentId}`);
              setComments(response.data); // Update comments after deletion
            } catch (error) {
              console.error('Error deleting comment:', error);
            }
          }}
          currentUserId={user._id}
        />
      )}

      <div className="post-footer">
        <button className="sheesh-button" onClick={handleSheeshClick}>Je Sheesh!</button>
        {(user._id === postUser._id || (user.isAdmin && !post.isValidated)) && (
          <div className="delete-wrapper">
            <button className="delete-button" onClick={handleDeleteClick}>
              <span className="delete-cross">✕</span>
            </button>

            {showConfirmDelete && (
              <div className="confirm-delete-popup">
                <div className="confirm-delete-content">
                  <p>Are you sure you want to delete this post ?</p>
                  <button className="confirm-delete-button" onClick={confirmDelete}>Yes</button>
                  <button className="cancel-delete-button" onClick={cancelDelete}>No</button>
                </div>
              </div>
            )}
          </div>
        )}
        {user.isAdmin && (
          <button className="validate-button" onClick={handleValidateClick}>
            {post.isValidated ? 'Invalider' : 'Valider'}
          </button>
        )}
      </div>

      {/* {showConfirmDelete && (
        <div className="confirm-delete-popup">
          <div className="confirm-delete-content">
            <p>Are you sure you want to delete this post?</p>
            <button className="confirm-delete-button" onClick={confirmDelete}>Yes</button>
            <button className="cancel-delete-button" onClick={cancelDelete}>No</button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default PostElement;
