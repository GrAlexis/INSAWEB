import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../../hooks/commonHooks/UserContext';
import './Navbar.css';
import profilIcon from '../../../assets/buttons/navbar/profil/profil_v1.png'; 
import feedIcon from '../../../assets/buttons/navbar/feed/feed_v1.png'; 
import sheeshIcon from '../../../assets/buttons/navbar/sheesh/sheesh_v1.png'; 
import eventsIcon from '../../../assets/buttons/navbar/events/events_v3.png'; 
import rankingIcon from '../../../assets/buttons/navbar/ranking/ranking_v1.png';
import adminIcon from '../../../assets/buttons/navbar/admin/admin_v1.png'; // Add an icon for admin



const Navbar = () => {
    const location = useLocation()
    const { user } = useUser();


    if (location.pathname !== '/login'){
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
        <Link to="/ranking" className="nav-item">
            <img src={rankingIcon} alt="Ranking Icon" className="nav-icon" />
            <span>Ranking</span>
        </Link>
        {user && user.isAdmin && (
            <Link to="/admin" className="nav-item">
                <img src={adminIcon} alt="Admin Icon" className="nav-icon" />
                <span>Admin</span>
            </Link>
        )}
    </nav> 
  )}
  else {
    return <nav/>
  }

}

export default Navbar;
