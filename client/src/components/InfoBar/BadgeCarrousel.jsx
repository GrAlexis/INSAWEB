import React, { useState, useEffect } from 'react';
import './BadgeCarrousel.css';
import astus from '../../assets/logos/astus.png';
import defaultBadge from '../../assets/buttons/chokbar.png';
import aceimi from '../../assets/logos/aceimi.png';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext';

const badges = [
  { id: 1, src: astus, alt: 'Badge astus', universeId: '64f3c9a9ef437ef982acb1e3' },
  { id: 2, src: aceimi, alt: 'Badge aceimi', universeId: '6714ea4cf6adc8b7ef62084d' },
];

const BadgeCarouselComponent = ({ universes, saveUniverse }) => {
  const [selectedBadge, setSelectedBadge] = useState(null); // Pas de badge sélectionné au départ
  const [showCarousel, setShowCarousel] = useState(false);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false); // Ajouter un état de chargement
  const { selectedUniverse } = useUniverse(); // Récupère l'univers sélectionné

  // Utiliser useEffect pour synchroniser l'univers sélectionné et le badge
  useEffect(() => {
    if (selectedUniverse) {
      const defaultBadge = badges.find(badge => badge.universeId === selectedUniverse._id);
      if (defaultBadge) {
        setSelectedBadge(defaultBadge);
      }
    } else {
      setSelectedBadge(null); // Remettre à null si aucun univers n'est sélectionné
    }
  }, [selectedUniverse]); // Exécuter cet effet chaque fois que l'univers change

  const handleBadgeClick = (badge) => {
    setLoading(true); // Activer l'état de chargement
    setSelectedBadge(badge);
    setClosing(true);

    const selectedUniverse = universes.find(u => u._id === badge.universeId);
    if (selectedUniverse) {
      setTimeout(() => {
        saveUniverse(selectedUniverse); // Sauvegarde l'univers après un délai pour laisser l'animation se produire
        setLoading(false); // Désactiver l'état de chargement après la sauvegarde de l'univers
      }, 1000); // Temporisation pour un effet de chargement plus doux
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

      {showCarousel && (
        <div className={`carousel ${closing ? 'closing' : ''}`}>
          <div className="badge-scroll-container">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`badge-item ${selectedBadge?.id === badge.id ? 'active' : ''}`}
                onClick={() => handleBadgeClick(badge)}
              >
                <img src={badge.src} alt={badge.alt} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCarouselComponent;
