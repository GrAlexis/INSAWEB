import React, { useState, useEffect } from 'react';
import config from '../../../config';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../../hooks/commonHooks/UserContext';
import './Navbar.css';
import profilIcon from '../../../assets/buttons/navbar/profil/profil_v1.png'; 
import feedIcon from '../../../assets/buttons/navbar/feed/feed_v1.png'; 
import sheeshIcon from '../../../assets/buttons/navbar/sheesh/sheesh_v1.png'; 
import eventsIcon from '../../../assets/buttons/navbar/events/events_v3.png'; 
import rankingIcon from '../../../assets/buttons/navbar/ranking/ranking_v1.png';
import adminIcon from '../../../assets/buttons/navbar/admin/admin_v1.png'; // Add an icon for admin
import { useUniverse } from '../../../hooks/commonHooks/UniverseContext';

const Navbar = () => {
    const location = useLocation();
    const { user } = useUser();
    const { selectedUniverse, saveUniverse } = useUniverse();
    const [backgroundColor, setBackgroundColor] = useState('#A4C0A5'); 


    // Fetch style for navbar
    useEffect(() => {
        const fetchStyles = async () => {
        var bgColor = '#A4C0A5';
        if (selectedUniverse.styles && selectedUniverse.styles['navBarColor']) {
            bgColor = selectedUniverse.styles['navBarColor'];
        }

        setBackgroundColor(bgColor);
        }
        if (selectedUniverse) {
        fetchStyles()
        }
    }, [selectedUniverse]);
    
    if (location.pathname === '/login') {
        return <nav />;
    }



    return (
        <nav className="navbar" style={{ backgroundColor }}>
            <Link to="/profil" className={`nav-item ${location.pathname === '/profil' ? 'active' : ''}`}>
                <img src={profilIcon} alt="Profil Icon" className="nav-icon" />
                <span>Profil</span>
            </Link>
            <Link to="/home" className={`nav-item ${location.pathname === '/home' ? 'active' : ''}`}>
                <img src={feedIcon} alt="Feed Icon" className="nav-icon" />
                <span>Feed</span>
            </Link>
            {/* <Link to="/events" className={`nav-item ${location.pathname === '/events' ? 'active' : ''}`}>
                <img src={eventsIcon} alt="Events Icon" className="nav-icon" />
                <span>Events</span>
            </Link> */}
            <Link to="/sheesh" className={`nav-item ${location.pathname === '/sheesh' ? 'active' : ''}`}>
                <img src={sheeshIcon} alt="Sheesh Icon" className="nav-icon" />
                <span>Sheesh</span>
            </Link>
            <Link to="/ranking" className={`nav-item ${location.pathname === '/ranking' ? 'active' : ''}`}>
                <img src={rankingIcon} alt="Ranking Icon" className="nav-icon" />
                <span>Ranking</span>
            </Link>
            {user && user.isAdmin && (
                <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                    <img src={adminIcon} alt="Admin Icon" className="nav-icon" />
                    <span>Admin</span>
                </Link>
            )}
        </nav>
    );
}

export default Navbar;
