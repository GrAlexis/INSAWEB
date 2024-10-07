import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import Chokbar from '../../assets/buttons/chokbar.png';
import Sheeesh from '../../assets/sounds/sheeesh.mp3';
import Sound from '../../assets/sounds/sound3.mp3';
import './MiniGame.css';

const MiniGame = () => {
  const [clicksRemaining, setClicksRemaining] = useState(null);
  const [position, setPosition] = useState({ top: '50%', left: '50%' });
  const [imageSize, setImageSize] = useState(100); // Taille initiale de l'image
  const [rotation, setRotation] = useState(0); // Nouvelle rotation aléatoire
  const [gameOver, setGameOver] = useState(false);
  const [initialClicks, setInitialClicks] = useState(null); // Pour suivre le total de clics initial
  const [lastSoundPlayedAt, setLastSoundPlayedAt] = useState(null); // Pour suivre le dernier palier de 10%

  // Fonction pour définir un nombre aléatoire de clics
  const generateRandomClicks = () => Math.floor(Math.random() * (1000 - 30 + 1)) + 30;

  // Fonction pour générer une position aléatoire
  const getRandomPosition = () => ({
    top: `${Math.random() * 80 + 10}%`,
    left: `${Math.random() * 80 + 10}%`,
  });

  // Fonction pour générer une taille aléatoire de l'image
  const getRandomSize = () => Math.floor(Math.random() * 100) + 50;

  // Fonction pour générer une rotation aléatoire
  const getRandomRotation = () => Math.floor(Math.random() * 360); // Angle entre 0 et 360°

  // Fonction pour jouer le son chaque 10%
  const playSound = () => {
    const audio = new Audio(Sheeesh);
    audio.play();
  };

  const handleClick = () => {
    if (clicksRemaining === null) {
      const totalClicks = generateRandomClicks();
      setClicksRemaining(totalClicks);
      setInitialClicks(totalClicks); // Sauvegarder le nombre initial de clics
      setLastSoundPlayedAt(Math.floor(totalClicks / 10) * 10); // Initialiser le palier à 10%
    } else if (clicksRemaining > 1) {
      setClicksRemaining(clicksRemaining - 1);
      setPosition(getRandomPosition());
      setImageSize(getRandomSize());
      setRotation(getRandomRotation());

      // Jouer le son tous les 10% de clics restants
      const currentTenPercent = Math.floor(clicksRemaining / 10) * 10;
      if (currentTenPercent !== lastSoundPlayedAt) {
        playSound();
        setLastSoundPlayedAt(currentTenPercent); // Mettre à jour le dernier palier de son joué
      }
    } else {
      setGameOver(true);
      playConfetti();
      playMusic();
    }
  };

  // Fonction pour jouer les confettis
  const playConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Fonction pour jouer la musique en fin de jeu 
  const playMusic = () => {
    const audio = new Audio(Sound);
    audio.play();
  };

  return (
    <div className="game-container">
      {!gameOver ? (
        <img
          src={Chokbar}
          alt="Mini game"
          className="clickable-image"
          onClick={handleClick}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            width: `${imageSize}px`,
            height: `${imageSize}px`,
            transform: `rotate(${rotation}deg)`, // Appliquer la rotation aléatoire
          }}
        />
      ) : (
        <h1>Félicitations !</h1>
      )}
      {clicksRemaining !== null && !gameOver && (
        <p>Il vous reste {clicksRemaining} clics pour gagner une récompense !</p>
      )}
    </div>
  );
};

export default MiniGame;
