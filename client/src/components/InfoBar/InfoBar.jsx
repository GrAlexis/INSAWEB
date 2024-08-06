import React from 'react';
import { useUser } from '../../hooks/commonHooks/UserContext';
import './InfoBar.css';
import logo from '../../assets/logos/astus.png';
import rankOneIcon from '../../assets/icons/ranks/1_v1.png';
import rankTwoIcon from '../../assets/icons/ranks/2_v1.png';
import rankThreeIcon from '../../assets/icons/ranks/3_v1.svg';
import badgeIcon1 from '../../assets/icons/ranks/1_v1.png';
import badgeIcon2 from '../../assets/icons/ranks/1_v1.png';
import badgeIcon3 from '../../assets/icons/ranks/1_v1.png';
import badgeIcon4 from '../../assets/icons/ranks/1_v1.png';
import badgeIcon5 from '../../assets/icons/ranks/1_v1.png';
import badgeIcon6 from '../../assets/icons/ranks/1_v1.png';






const InfoBar = () => {
  const { user } = useUser();

  return (
    <div className="info-bar">

      <div className="section badge-container">
      <img src={badgeIcon1} alt="Rank 1 Icon" className="badge-icon" />
      <img src={badgeIcon2} alt="Rank 2 Icon" className="badge-icon" />
      <img src={badgeIcon3} alt="Rank 1 Icon" className="badge-icon" />
      <img src={badgeIcon4} alt="Rank 1 Icon" className="badge-icon" />
      <img src={badgeIcon5} alt="Rank 1 Icon" className="badge-icon" />
      <img src={badgeIcon6} alt="Rank 1 Icon" className="badge-icon" />
      </div>
      <div className="section astus-logo-container">
        <img src={logo} alt="Association Logo" className="astuce-logo" />
      </div>
      <div className="section user-info-container">
        <h2>{user.name}</h2>
        <h2>{user.classYear}</h2>
        <div className="balance-rank">
        {user.rank === 1 ? (
            <img src={rankOneIcon} alt="Rank 1 Icon" className="rank-icon" />
          ) : user.rank === 2 ? (
            <img src={rankTwoIcon} alt="Rank 2 Icon" className="rank-icon" />
          ) : user.rank === 3 ? (
            <img src={rankThreeIcon} alt="Rank 3 Icon" className="rank-icon" />
          ) : (
            <p>Rank: {user.rank}</p>
          )}
            <p>{user.balance} Sh</p>
        </div>
      </div>
    </div>
  );
}

export default InfoBar;

/* Gestion des badges présent dans la section badge à réaliser avec une fonction map  */