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
import LazyLoad from 'react-lazyload';
import zoom from '../../assets/buttons/zoom/chercher.svg';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext';



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
  const [isFocused, setIsFocused] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false); // State for modal visibility
  const [videoUrl, setVideoUrl] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [zoomScale, setZoomScale] = useState(1); 
  const [showOverlay, setShowOverlay] = useState(false);
  const [transitionOverlay, setTransitionOverlay] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // État pour gérer l'affichage

  const { selectedUniverse, fetchUniverseById,saveUniverse} = useUniverse();

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
      setIsFocused(false); // Reset focus state after publishing
    } catch (error) {
      console.error('Error adding comment', error);
    }
  };
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (!newComment.trim()) {
      setIsFocused(false); // Hide "Publish" if input is empty on blur
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddComment(); // Trigger the comment submission on Enter key
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
            eventId : event._id,
            universeId : selectedUniverse._id
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
  /*      Zoom Image      */
  // to instance the function   onClick={() => handleImageClick(`${config.backendAPI}/file/${post.picture}`)} // Open image in modal on click

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
  
          /*   Overlay transition  */ 

  const handleOverlayClick = () => {
    setShowOverlay(true);
    setTimeout(() => {
      setTransitionOverlay(true);
    }, 10); // Small timeout to ensure CSS reflow
  };

  // Handle overlay close when "Je sheesh" is clicked or when clicking outside
  const handleCloseOverlay = () => {
    setTransitionOverlay(false); // First, remove the transition effect
    setTimeout(() => {
      setShowOverlay(false); // Then hide the overlay after the transition
    }, 500); // Delay to match the transition duration (500ms)
  };

   // Fonction pour basculer entre l'affichage tronqué et complet
   const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  // Tronquer la description à 40 caractères si non expansé
  const truncatedDescription = post.description.length > 40 && !isExpanded
    ? `${post.description.substring(0, 40)}...`
    : post.description;
    
  

  if (!challenge || !event || !postUser || !user) {
    return <div>Loading...</div>;
  }
  const openCommentModal = () => setShowCommentModal(true);
  const closeCommentModal = () => setShowCommentModal(false);

  return (
    <div className="post-wrapper">
    <div className="post">
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
          <>
          <LazyLoadImage
            alt={challenge.title}
            src={`${config.backendAPI}/file/${post.picture}`}
            className="post-image"
            onClick={handleOverlayClick}
          />

          <img 
            src={zoom} 
            alt="Zoom Logo" 
            className="zoom-logo"
            onClick={() => handleImageClick(`${config.backendAPI}/file/${post.picture}`)}
            />

          {showOverlay && (
            <div className={`overlay ${transitionOverlay ? 'show' : ''}`} onClick={handleCloseOverlay}>
              <div className="overlay-content" onClick={e => e.stopPropagation()}>

              {(user._id === postUser._id || (user.isAdmin && !post.isValidated)) && (
                <div className="delete-wrapper">
                  <button className="delete-button" onClick={handleDeleteClick}>
                    <span className="delete-cross" >✕</span>
                  </button>

                  {showConfirmDelete && (
                    <div className="confirm-delete-popup">
                      <div className="confirm-delete-content">
                        <p>Es tu sur de vouloir supprimer ce post ?</p>
                        <button className="confirm-delete-button" onClick={confirmDelete}>Oui</button>
                        <button className="cancel-delete-button" onClick={cancelDelete}>Non</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
                <div className="points">
                <span className="points-text">{challenge.reward}</span>
                <img src={getRewardIcon(challenge.reward)} alt="Points Icon" className="points-icon" />
                </div>
                <button className="sheesh-button" onClick={handleSheeshClick}>Je Sheeesh !</button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      <div className="post-header">
        <div className="post-info">
          <span className="user">{postUser.name} {postUser.lastName}</span>
          <span className="date">{event.title} - {formatDate(post.date)}</span>
          {team && <span className="teams">Team: {team.name}</span>}
        </div>
        
        <div className="reward">
          <img src={getRewardIcon(challenge.reward)} alt="Reward Icon" className="reward-icon" />
          <span className="reward-text">{challenge.reward}</span>
        </div>

        <div className="status">
          <img 
            src={post.isValidated ? validatedIcon : waitingIcon} 
            alt={post.isValidated ? "Validated Icon" : "Waiting Icon"} 
            className="status-icon" 
          />
        </div>
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
        <div className="post-title">
          <span>{challenge.title}</span>
        </div>

        <div className="post-likes">
          {likes > 0 && <span>{likes}</span>} {/* Only show the number of likes if greater than 0 */}
          <button 
            className={`likes-button ${liked ? 'liked' : ''} ${isAnimating ? 'shake' : ''}`} 
            onClick={handleLikeClick}
            onAnimationEnd={() => setIsAnimating(false)} // Remove animation class after animation completes
          >
            <img src={chokbarButton} alt="Likes Icon" className="likes-icon" />
          </button>
        </div>

      </div>
      <div className="post-description">
      <p onClick={toggleDescription} style={{ cursor: 'pointer' }}>
          {truncatedDescription}
          {post.description.length > 40 && !isExpanded && (
            <span > Lire plus</span>
          )}
          
          {isExpanded && (
            <span > Réduire</span>
          )}
        </p>
      </div>
            {/* Comments Section */}
        <div className="post-comments">
          <h4>Commentaires</h4>
          {comments.slice(0, 3).map(comment => (
          <div key={comment._id} className="comment" onClick={openCommentModal}>
            <p><strong>{comment.userLabel}</strong> : {comment.text}</p>
          </div>
          ))}
         {comments.length > 3 && (
          <button className="voir-plus" onClick={openCommentModal}>Voir plus...</button>
         )}

        {/* Add new comment */}
        <div className="add-comment">
        <input
          type="text"
          placeholder="A Méditérannée..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown} 
        />
        <button
          className={`publish-button ${isFocused ? 'visible' : ''}`}
          onClick={handleAddComment}
        >
          Commenter
        </button>
      </div>
      </div>

      {showCommentModal && (
        <LazyLoad key={comments} height={200} offset={100} once> 
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
          isAdmin={user.isAdmin}
        />
        </LazyLoad>
      )}

      <div className="post-footer">
    {/*  <button className="sheesh-button" onClick={handleSheeshClick}>Je Sheesh!</button>*/}
        {user.isAdmin && (
          <button className="validate-button" onClick={handleValidateClick}>
            {post.isValidated ? 'Mettre en attente': 'Validé ?'}
          </button>
        )}
      </div>
    </div>
    </div>
  );
};

export default PostElement;
