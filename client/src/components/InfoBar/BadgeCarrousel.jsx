import React, { useState, useEffect } from 'react';
import './BadgeCarrousel.css';
import config from '../../config';
import axios from 'axios';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext'; // Importer le hook UniverseContext
import { useUser } from '../../hooks/commonHooks/UserContext';


const BadgeCarouselComponent = ({ universes }) => {
  const { user } = useUser();
  const [joinedUniverses, setJoinedUniverses] = useState([]); // State for storing the badges dynamically
  const [selectedUniverseLocal, setSelectedUniverseLocal] = useState(joinedUniverses[0]);
  const [showCarousel, setShowCarousel] = useState(false);
  const [closing, setClosing] = useState(false);
  const { selectedUniverse, saveUniverse } = useUniverse();
    
  // Fetch the joined universes of the user and build the badges array
  useEffect(() => {
    const fetchJoinedUniverses = async () => {
      try {
        // Assuming the user object contains the joined universes
        const joinedUniverseIds = user.joinedUniverses;
        const fetchedJoinedUniverses = await Promise.all(
          joinedUniverseIds.map(async (universeId) => {
            const response = await axios.get(`${config.backendAPI}/universe/${universeId}`);
            return response.data; // Assuming the API returns the full universe data
          })
        );
        
        setJoinedUniverses(fetchedJoinedUniverses);

        // Set the first badge as the selected badge by default
        if (fetchedJoinedUniverses.length > 0) {
          setSelectedUniverseLocal(fetchedJoinedUniverses[0]);
        }
      } catch (error) {
        console.error('Error fetching joined universes:', error);
      }
    };

    if (user && user.joinedUniverses) {
      fetchJoinedUniverses();
    }
  }, [user]); // Run the effect when the user is loaded

  const handleBadgeClick = (universe) => {
    setSelectedUniverseLocal(universe);
    setClosing(true);

    // Trouver l'univers correspondant au badge et changer d'univers
    const selectedUniverse = universes.find(u => u._id === universe._id);
    if (selectedUniverse) {
      saveUniverse(selectedUniverse);
    } else {
      console.error('Univers non trouvé pour ce badge.');

    }

    // Gérer la fermeture avec un délai pour permettre l'animation de fermeture
    setTimeout(() => {
      setShowCarousel(false);
      setClosing(false);
    }, 500); // Durée de l'animation de fermeture correspond à celle définie dans le CSS
  };

  const handleMainBadgeClick = () => {
    if (!showCarousel) {
      setShowCarousel(true);
    } else {
      setClosing(true);
      setTimeout(() => {
        setShowCarousel(false);
        setClosing(false);
      }, 500); // Durée de l'animation de fermeture
    }
  };

  return (
    <div className="carousel-container">

      {/* Affiche un badge par défaut si aucun badge n'est sélectionné */}
      {loading ? (
        <div className="loading-spinner">Chargement...</div>
      ) : !selectedBadge ? (
        <div className="default-badge" onClick={() => setShowCarousel(true)}>
          <img src={defaultBadge} alt="Badge par défaut" className="large-badge" />
          <p>Rejoindre un univers</p>
        </div>
      ) : (
        <div className="selected-badge" onClick={handleMainBadgeClick}>
          <img src={selectedBadge.src} alt={selectedBadge.alt} className="large-badge" />
        </div>
      )}

      <div className="selected-badge" onClick={() => setShowCarousel(!showCarousel)}>
        <img src={selectedUniverse.logo} alt={`Badge ${selectedUniverse.name}`} className="large-badge" />
      </div>

      {showCarousel && (
        <div className={`carousel ${closing ? 'closing' : ''}`}>
          <div className="badge-scroll-container">
            {joinedUniverses.map((joinedUniverse) => (
              <div
                key={joinedUniverse._id}
                className={`badge-item ${selectedUniverseLocal._id === joinedUniverse._id ? 'active' : ''}`}
                onClick={() => handleBadgeClick(joinedUniverse)}
              >
                <img src={joinedUniverse.logo} alt={joinedUniverse.name} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCarouselComponent;
