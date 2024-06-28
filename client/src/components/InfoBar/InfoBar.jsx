import React from 'react';
import { useUser } from '../../hooks/commonHooks/UserContext';
import './InfoBar.css';
import logo from '../../assets/logos/astus.png';
import rankOneIcon from '../../assets/icons/ranks/1_v1.png';
import rankTwoIcon from '../../assets/icons/ranks/2_v1.png';
import rankThreeIcon from '../../assets/icons/ranks/3_v1.svg';


const InfoBar = () => {
  const { user } = useUser();

  return (
    <div className="info-bar">
      <div className="section placeholder">
        <p>User Annex Info</p>
      </div>
      <div className="section astus-logo-container">
        <img src={logo} alt="Association Logo" className="astuce-logo" />
      </div>
      <div className="section user-info">
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
