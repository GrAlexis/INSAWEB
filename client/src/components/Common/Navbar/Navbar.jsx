import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import profilIcon from '../../../assets/buttons/navbar/profil/profil_v1.png'; 
import feedIcon from '../../../assets/buttons/navbar/feed/feed_v1.png'; 
import sheeshIcon from '../../../assets/buttons/navbar/sheesh/sheesh_v1.png'; 
import eventsIcon from '../../../assets/buttons/navbar/events/events_v3.png'; 
import rankingIcon from '../../../assets/buttons/navbar/ranking/ranking_v1.png';






const Navbar = () => {
  return (
    <nav className="navbar">

        <Link to="/events" className="nav-item">
            <img src={profilIcon} alt="Profil Icon" className="nav-icon" />
            <span>Profil</span>
        </Link>
        <Link to="/home" className="nav-item">
            <img src={feedIcon} alt="Feed Icon" className="nav-icon" />
            <span>Feed</span>
        </Link>
        
        <Link to="/events" className="nav-item">
            <img src={eventsIcon} alt="Events Icon" className="nav-icon" />
            <span>Events</span>
        </Link>
        <Link to="/sheesh" className="nav-item">
            <img src={sheeshIcon} alt="Sheesh Icon" className="nav-icon" />
            <span>Sheesh</span>
        </Link>
        <Link to="/events" className="nav-item">
            <img src={rankingIcon} alt="Ranking Icon" className="nav-icon" />
            <span>Ranking</span>
        </Link>
    </nav>
  );
}

export default Navbar;
