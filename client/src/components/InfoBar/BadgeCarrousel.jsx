import React, { useState } from 'react';
import './BadgeCarrousel.css';
import astus from '../../assets/logos/astus.png';
import aceimi from '../../assets/buttons/chokbar.png';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext'; // Importer le hook UniverseContext

// Associer chaque badge à un univers spécifique
const badges = [
  { id: 1, src: astus, alt: 'Badge astus', universeId: '64f3c9a9ef437ef982acb1e3' },
  { id: 2, src: aceimi, alt: 'Badge aceimi', universeId: '6714ea4cf6adc8b7ef62084d' },
];

const BadgeCarouselComponent = ({ universes, saveUniverse }) => {
  const [selectedBadge, setSelectedBadge] = useState(badges[0]);
  const [showCarousel, setShowCarousel] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setClosing(true);

    // Trouver l'univers correspondant au badge et changer d'univers
    const selectedUniverse = universes.find(u => u._id === badge.universeId);
    if (selectedUniverse) {
      console.log('Badge sélectionné :', badge.alt); // Debug pour vérifier la sélection du badge
      console.log('Univers correspondant :', selectedUniverse); // Debug pour vérifier que l'univers est trouvé
      saveUniverse(selectedUniverse);
    } else {
      console.error('Univers non trouvé pour ce badge.');
    }

    setTimeout(() => {
      setShowCarousel(false);
      setClosing(false);
    }, 500);
  };

  return (
    <div className="carousel-container">
      <div className="selected-badge" onClick={() => setShowCarousel(!showCarousel)}>
        <img src={selectedBadge.src} alt={selectedBadge.alt} className="large-badge" />
      </div>

      {showCarousel && (
        <div className={`carousel ${closing ? 'closing' : ''}`}>
          <div className="badge-scroll-container">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`badge-item ${selectedBadge.id === badge.id ? 'active' : ''}`}
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
