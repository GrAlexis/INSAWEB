import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import feedIcon from '../../../assets/buttons/navbar/feed/feed_v1.png'; // Adjust the path to your icon


const Navbar = () => {
  return (
    <nav className="navbar">
        <Link to="/home" className="nav-item">
            <img src={feedIcon} alt="Feed Icon" className="nav-icon" />
            <span>Feed</span>
        </Link>
    </nav>
  );
}

export default Navbar;
