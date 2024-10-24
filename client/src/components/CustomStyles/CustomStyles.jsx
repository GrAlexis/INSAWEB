import React from 'react';
import './CustomStyles.css';  // Optionally, create a CSS file for custom styles

const CustomStyles = ({navBarColor, setNavBarColor, infoBarColor, setInfoBarColor,mainBackgroundColor,setMainBackgroundColor }) => {
  return (
    <div className="custom-styles">
      <h3>Customiser esthétique</h3>
      <label>
        Couleur de la barre supérieure :
        <input
          type="color"
          value={infoBarColor}
          onChange={(e) => setInfoBarColor(e.target.value)}
        />
      </label>
      <label>
        Couleur de l'arrière plan
      <input
          type="color"
          value={mainBackgroundColor}
          onChange={(e) => setMainBackgroundColor(e.target.value)}
        />
      </label>
      <label>
        Couleur de la barre de navigation
      <input
          type="color"
          value={navBarColor}
          onChange={(e) => setNavBarColor(e.target.value)}
        />
      </label>
    </div>
  );
};

export default CustomStyles;
