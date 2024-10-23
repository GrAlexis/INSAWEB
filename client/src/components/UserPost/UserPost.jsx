import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import PostElement from '../PostElement/PostElement'; // Réutilisation du composant PostElement
import { useUser } from '../../hooks/commonHooks/UserContext';
import './UserPost.css'; // Ajouter du CSS pour styliser la section des posts

const UserPosts = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [showPosts, setShowPosts] = useState(false); // État pour gérer l'affichage des posts
  const { user } = useUser(); // Récupérer l'utilisateur connecté
  
  const fetchUserPosts = async () => {
    if (!user) return; // Ne pas effectuer de requête si l'utilisateur n'est pas défini

    try {
      const response = await axios.get(`${config.backendAPI}/posts`, {
        params: {
          userId: user._id, // Utiliser l'ID de l'utilisateur connecté
        },
      });
      setUserPosts(response.data);
      setShowPosts(true); // Afficher les posts après la récupération
    } catch (error) {
      console.error("Erreur lors de la récupération des posts de l'utilisateur", error);
    }
  };

  const handleTogglePosts = () => {
    if (showPosts) {
      setShowPosts(false); // Cacher les posts si déjà affichés
    } else {
      fetchUserPosts(); // Afficher les posts sinon
    }
  };

  return (
    <div className="user-posts-container">
      <button className="toggle-posts-button" onClick={handleTogglePosts}>
        {showPosts ? 'Masquer mes posts' : 'Afficher mes posts'}
      </button>

      {showPosts && (
        <div className="user-posts">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <PostElement key={post._id} post={post} onDelete={fetchUserPosts} />
            ))
          ) : (
            <p>Aucun post trouvé pour cet utilisateur.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserPosts;
