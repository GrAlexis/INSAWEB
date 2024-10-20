import React, { useState, useEffect } from 'react';
import config from '../../config';
import './ChallengeCard.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useUser } from '../../hooks/commonHooks/UserContext';
import { useNavigate } from 'react-router-dom';
import validatedIcon from '../../assets/icons/sheesh/validated.webp';
import waitingIcon from '../../assets/icons/sheesh/waiting.png';
import collectiveIcon from '../../assets/icons/sheesh/together.png';
import pinIcon from '../../assets/buttons/pin.png';
import unpinIcon from '../../assets/buttons/unpin.webp';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util'

const ChallengeCard = ({ challenge, isOpen, setOpenChallengeId }) => {
  const { user, setUser } = useUser();
  const { challengeId } = useParams();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTeamWarning, setShowTeamWarning] = useState(false);
  const [post, setPost] = useState(null);
  const [collectivePost, setCollectivePost] = useState(null);
  const [teammateName, setTeammateName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userNeedsToJoinTeam, setUserNeedsToJoinTeam] = useState(false);
  const navigate = useNavigate();

  const { selectedUniverse, fetchUniverseById,saveUniverse} = useUniverse();
  const ffmpeg = new FFmpeg();



  useEffect(() => {
    if (challenge.id === challengeId) {
      setOpenChallengeId(challenge.id);
    }
  }, [challenge.id, challengeId, setOpenChallengeId]);

  useEffect(() => {

    const checkUserPost = async () => {
      if (!user) return; // Ensure user is not null before making requests

      try {
        // Check if event has teams and user is not in a team
        const eventResponse = await axios.get(config.backendAPI+`/events/${challenge.eventId}`);
        const event = eventResponse.data;
        setUserNeedsToJoinTeam(event?.teams.length > 0 && !user.universes[selectedUniverse._id].events[challenge.eventId].teamId);

        const response = await axios.get(config.backendAPI+`/posts/byUserAndChallenge?userId=${user._id}&challengeId=${challenge.id}`);
        if (response.data.length > 0) {
          setPost(response.data[0]);
        }

        if (challenge.isCollective && user.universes[selectedUniverse._id].events[challenge.eventId].teamId) {
          const teamPostsResponse = await axios.get(config.backendAPI+`/posts/byTeamAndChallenge?teamId=${user.universes[selectedUniverse._id].events[challenge.eventId].teamId}&challengeId=${challenge.id}`);
          if (teamPostsResponse.data.length > 0) {
            const teamPost = teamPostsResponse.data[0];
            if (teamPost.user !== user._id) {
              setCollectivePost(teamPost);
              const userResponse = await axios.get(config.backendAPI+`/users/${teamPost.user}`);
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
  }, [user, challenge.id, challenge.isCollective]);

  const handlePinClick = async () => {
    if (!user) return; // Ensure user is not null before proceeding

    try {
      const response = user.pinnedChallenges.includes(challenge.id)
        ? await axios.post(config.backendAPI+'/unpinChallenge', { userId: user._id, challengeId: challenge.id })
        : await axios.post(config.backendAPI+'/pinChallenge', { userId: user._id, challengeId: challenge.id });

      setUser(prevUser => ({
        ...prevUser,
        pinnedChallenges: response.data
      }));
    } catch (error) {
      console.error('Error pinning/unpinning challenge:', error);
    }
  };

  const handleButtonClick = () => {
    setOpenChallengeId(challenge.id);
  };

  const handleCloseForm = () => {
    setOpenChallengeId(null);
    setFile(null);
    setDescription('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
  
    // Expanded list of allowed image and video file types
    const allowedFileTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/jpg', 
      'image/webp', 
      'image/bmp', 
      'image/tiff',
      'image/heic',  // Added HEIC support
      // 'video/mp4',   // Video support
      // 'video/quicktime',  // MOV
      // 'video/x-msvideo',  // AVI
      // 'video/x-ms-wmv',   // WMV
      // 'video/x-flv',      // FLV
      // 'video/x-matroska'  // MKV
    ];
  
    if (selectedFile && allowedFileTypes.includes(selectedFile.type)) {
      setFile(selectedFile); // Set the file if it's allowed
    } else {
      const allowedExtensions = allowedFileTypes.map(type => type.split('/')[1]).join(', '); // Extract extensions
      alert(`Only the following file types are allowed: ${allowedExtensions}`);
      setFile(null); // Reset the file if it's not allowed
    }
  };
  

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const compressVideo = async (videoFile) => {
    if (!ffmpeg.loaded) {
      await ffmpeg.load();
    }
    console.log("Input video size: ", (videoFile.size / 1024 / 1024).toFixed(2), "MB");

    const fileName = videoFile.name;
    await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile))

    // Run FFmpeg compression commands
    // await ffmpeg.run('-i', fileName, '-vcodec', 'libx264', '-b:v', '1000k', '-crf', '28', 'output.mp4');
    await ffmpeg.exec(["-i", "input.mp4", "output.mp4",'-vcodec', 'libx264', '-b:v', '1000k', "-crf","28"])
    const compressedData = ffmpeg.readFile("output.mp4")
    // Convert the output to a Blob
    const compressedBlob = new Blob([compressedData.buffer], { type: 'video/mp4' });
//logging
    const compressedFile = new File([compressedBlob], 'compressed_' + fileName, { type: 'video/mp4' });
    console.log("Compressed video size: ", (compressedFile.size / 1024 / 1024).toFixed(2), "MB");

    // Return the compressed video file
    return new File([compressedBlob], 'compressed_' + fileName, { type: 'video/mp4' });
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true)
    try {
      const eventResponse = await axios.get(config.backendAPI+`/events/${challenge.eventId}`);
      const event = eventResponse.data;

      if (event.teams.length > 0 && (!user.universes[selectedUniverse._id].events[challenge.eventId].teamId)) {
        setShowTeamWarning(true);
        setTimeout(() => setShowTeamWarning(false), 3000);
        return;
      }

      if (challenge.isCollective &&user.universes[selectedUniverse._id].events[challenge.eventId].teamId) {
        const teamPostsResponse = await axios.get(config.backendAPI+`/posts/byTeamAndChallenge?teamId=${user.universes[selectedUniverse._id].events[challenge.eventId].teamId}&challengeId=${challenge.id}`);
        if (teamPostsResponse.data.length > 0 && teamPostsResponse.data[0].user !== user._id) {
          setCollectivePost(teamPostsResponse.data[0]);
          const userResponse = await axios.get(`/users/${teamPostsResponse.data[0].user}`);
          setTeammateName(userResponse.data.name);
          setTimeout(() => setCollectivePost(null), 3000);
          return;
        }
      }
      console.log("juste avant compression")
      if (file && file.type.startsWith('video')) {
        // Compress the video file before upload
        const compressedFile = await compressVideo(file);
        setFile(compressedFile);  // Replace the original file with the compressed file
      }
      console.log("juste avant de créer le formData")
      const formData = new FormData();
      formData.append('file', file);
      formData.append('challengeId', challenge.id);
      formData.append('eventId', challenge.eventId);
      formData.append('user', user._id);
      formData.append('description', description);
      formData.append('universeId', selectedUniverse._id)
      if (user.universes[selectedUniverse._id].events[challenge.eventId].teamId) {
        formData.append('teamId', user.universes[selectedUniverse._id].events[challenge.eventId].teamId);
      }
      const response = await axios.post(config.backendAPI+'/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsProcessing(false)


      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      setDescription('');
      setFile(null);
      setOpenChallengeId(null);
      setPost(response.data);
      navigate('/home');
    } catch (error) {
      console.error('Error uploading file', error);
      setIsProcessing(false)
    }
  };

  if (!user) return <div>Please log in to participate in challenges.</div>;

  if ( user )return (
    <div className="challenge-card">
      <img src={challenge.icon} alt={challenge.title} className="challenge-icon" />
      <div className="challenge-details">
        <p>{challenge.title}</p>
        <p>{challenge.limitDate}</p>
        <p>{challenge.reward}</p>
        {challenge.isCollective && <img src={collectiveIcon} alt="Collective Challenge" className="collective-icon" />}
        


        {!isOpen ? (
          <div>
          <button className="sheesh-button" onClick={handleButtonClick} disabled={post || collectivePost || userNeedsToJoinTeam}>
            {post ? "Déjà participé" : "Je sheesh !"}
          </button>
          {userNeedsToJoinTeam && <p className="join-team-warning">Rejoignez une équipe pour participer</p>}
        </div>
        ) : (
          <div>
            <form onSubmit={handleFormSubmit} className="upload-form">
            <input placeholder='Choisir une photo'  id="file-upload" type="file" onChange={handleFileChange} disabled={post || collectivePost} />             
         <textarea
                placeholder="Quelque chose à ajouter ?"
                value={description}
                onChange={handleDescriptionChange}
                disabled={post || collectivePost}
              />
              <button type="submit" className='sheesh-button' disabled={post || collectivePost || isProcessing || userNeedsToJoinTeam}>
              {userNeedsToJoinTeam ? 'Pas d\'équipe, pas de sheesh' : (isProcessing ? 'Uploading...' : 'Sheeeeeesh!')}
              </button>         
            </form>
            <button className='delete-button' onClick={handleCloseForm}>✕</button>
          </div>
        )}
        {showSuccess && <div className="success-notification">Successfully posted</div>}
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
      {user && (
          <button onClick={handlePinClick} className="pin-button">
            <img src={user.pinnedChallenges.includes(challenge.id) ? unpinIcon : pinIcon} alt="Pin/Unpin Icon" />
          </button>
      )}
      {collectivePost && (
        <div className="team-post-notification">
          {`A member of your team has already posted for this collective challenge`}
        </div>
      )}
    </div>
  );
};

export default ChallengeCard;
