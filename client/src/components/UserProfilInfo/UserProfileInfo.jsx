import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../hooks/commonHooks/UserContext';
import config from '../../config';
import axios from 'axios';
import './UserProfileInfo.css';
import photo from '../../assets/ceo/MikaR.JPG'
import AvatarEditor from 'react-avatar-editor';


const UserProfileInfo = () => {
  const { user, setUser } = useUser();
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(photo); // Image à afficher après édition
  const [originalImage, setOriginalImage] = useState(photo); // Image d'origine utilisée pour l'édition
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        setLoading(true);
        // Remplace l'URL par l'endpoint approprié pour récupérer les points de l'utilisateur
        const response = await axios.get(`${config.backendAPI}/getUsersTotalPoints`);
        const points = response.data.totalPoints;
        setTotalPoints(points);
        setUser(prevUser => ({ ...prevUser, balance: points }));
      } catch (error) {
        console.error('Erreur lors de la récupération des points :', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchUserPoints();
    }
  }, [user?._id, setUser]);

  const handlePhotoClick = () => {
    setIsEditing(true); // Ouvre l'éditeur d'image
    setImage(originalImage); // Utilise toujours l'image d'origine pour l'édition
  };

  const handleSave = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas().toDataURL();
      setImage(canvas); // Met à jour l'image affichée après recadrage
      setOriginalImage(canvas); // Met à jour l'image d'origine pour la prochaine édition
      setIsEditing(false); // Ferme l'éditeur
    }
  };

  const handleCancel = () => {
    setIsEditing(false); // Ferme l'éditeur sans sauvegarder
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Erreur de chargement des informations utilisateur</div>;
  }
/* Pour photo de l'user remplacer "photo" par "user.photoUrl" */
  return (
    <div className="user-profile-info">
      {!isEditing ? (
        <div className="user-photo" onClick={handlePhotoClick}>
          <img src={image} alt={`${photo}'s profile`} />
        </div>
      ) : (
        <div className="photo-editor">
          <AvatarEditor
            ref={editorRef}
            image={image}
            width={250}
            height={250}
            border={50}
            borderRadius={125} // Rend l'image circulaire
            scale={1.2} // Tu peux ajuster l'échelle
          />
          <div className="editor-buttons">
            <button onClick={handleSave}>Sauvegarder</button>
            <button onClick={handleCancel}>Annuler</button>
          </div>
        </div>
      )}

      <div className="user-details">
        <h2>{user.name.charAt(0).toUpperCase() + user.name.slice(1)}</h2>
        <p>{user.country}</p>
        <p>Total Points: {Math.round(totalPoints)} Sh</p>
      </div>
    </div>
  );
};

export default UserProfileInfo;
