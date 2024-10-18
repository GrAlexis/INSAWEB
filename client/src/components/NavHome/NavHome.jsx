import React, { useState, useEffect, useRef } from 'react';
import './NavHome.css';
import logo from '../../assets/buttons/chokbar.png';

const NavHome = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // Utilisation pour gérer l'état du toggle sur mobile
  const navRef = useRef(null); // Référence pour la barre de navigation

  // Fonction pour alterner l'ouverture/fermeture du menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Fonction pour gérer l'ouverture/fermeture des sous-menus
  const toggleDropdown = (index) => {
    setIsDropdownOpen(isDropdownOpen === index ? null : index);
  };

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false); // Fermer le menu si clic à l'extérieur
        setIsDropdownOpen(null); // Fermer également les sous-menus
      }
    };

    // Ajouter l'événement pour détecter les clics en dehors
    document.addEventListener('mousedown', handleClickOutside);

    // Nettoyage de l'événement lors du démontage du composant
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navRef]);

  const navItems = [
    { name: 'Accueil', dropdown: ['Qui sommes nous', 'Notre équipe'] },
    { name: 'Nos solutions', dropdown: ['Entreprise', 'Association'] },
    { name: 'Agence', dropdown: ['À propos', 'Vision et engagements'] },
    { name: 'Contact', dropdown: [] },
  ];

  return (
    <nav className="navbarHome" ref={navRef}>
      <div className="logo-containerHome">
        <img src={logo} alt="Logo" className="logoHome" />
        <div className="app-name">Sheeesh</div> {/* Nom de l'application à côté du logo */}
      </div>

      {/* Toggle button pour mobile et tablette */}
      <div className="menu-toggle" onClick={toggleMenu}>
        {menuOpen ? '✖' : '☰'}
      </div>

      {/* Menu déroulant (mobile et desktop) */}
      <ul className={`nav-linksHome ${menuOpen ? 'open' : ''}`}>
        {navItems.map((item, index) => (
          <li
            key={index}
            className={isDropdownOpen === index ? 'open' : ''}
            onClick={() => toggleDropdown(index)}
          >
            {item.name}
            {item.dropdown.length > 0 && (
              <ul className={`dropdown ${isDropdownOpen === index ? 'show' : ''}`}>
                {item.dropdown.map((subItem, subIndex) => (
                  <li key={subIndex}>{subItem}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavHome;
