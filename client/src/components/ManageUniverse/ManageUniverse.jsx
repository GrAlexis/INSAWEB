import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext';
import './ManageUniverse.css';
import CustomStyles from '../CustomStyles/CustomStyles';

const ManageUniverse = () => {
  const { selectedUniverse, saveUniverse } = useUniverse();
  const [password, setPassword] = useState('');
  const [logo, setLogo] = useState(null);  // State to store the uploaded logo
  const [isUpdating, setIsUpdating] = useState(false);
  const [infoBarColor, setInfoBarColor] = useState(
    selectedUniverse.styles['infoBarBackgroundColor'] || '#FFFFFF'
  );
  const [mainBackgroundColor, setMainBackgroundColor] = useState(
    selectedUniverse.styles['mainBackgroundColor'] || '#E8EACC'
  );
  const [navBarColor, setNavBarColor] = useState(
    selectedUniverse.styles['navBarColor'] || '#A4C0A5'
  );

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);  // Store the file in the state
    }
  };

  // State for managing custom styles (starting with info-bar background color)


  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
        const formData = new FormData();
        formData.append('universeId', selectedUniverse._id);  // Append universeId
        formData.append('password', password);  // Append password
      
        // Append logo if it exists
        if (logo) {
          formData.append('file', logo);  // Append logo file (to be converted on the server)
        }
      
        // Build the styles object conditionally
        const styles = {};
        if (infoBarColor) {
          styles.infoBarBackgroundColor = infoBarColor;
        }
        if (mainBackgroundColor) {
          styles.mainBackgroundColor = mainBackgroundColor;
        }
        if (navBarColor) {
            styles.navBarColor = navBarColor;
          }
      
        // Append styles if any exist
        if (Object.keys(styles).length > 0) {
          formData.append('styles', JSON.stringify(styles));
        }

      // Sending request to update the universe with the new password and logo
      const response = await axios.post(`${config.backendAPI}/universe/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },  // Ensure multipart data is sent
      });

      if (response.status === 200) {
        const updatedUniverse = response.data.universe; // Get the updated universe from the response
        saveUniverse(updatedUniverse)
        alert('Universe updated successfully!');
      }
    } catch (error) {
      console.error('Error updating universe:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to reset password
  const handleResetPassword = async () => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('universeId', selectedUniverse._id);  // Append universeId
      formData.append('password', "EMPTY_PASSWORD");  // Reset password to an empty value

      // Send the request to update the universe with an empty password
      const response = await axios.post(`${config.backendAPI}/universe/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        const updatedUniverse = response.data.universe; // Get the updated universe from the response
        saveUniverse(updatedUniverse);
        setPassword('');  // Clear the password field in the form
        alert('Password reset successfully!');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetEsthetics = async () => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('universeId', selectedUniverse._id);  // Append universeId
      formData.append('styles', JSON.stringify({
        infoBarBackgroundColor: '',
        mainBackgroundColor: '',
        navBarColor: ''
      }));  // Reset styles

      // Send the request to update the universe with empty styles
      const response = await axios.post(`${config.backendAPI}/universe/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },  // Ensure multipart data is sent
      });

      if (response.status === 200) {
        const updatedUniverse = response.data.universe; // Get the updated universe from the response
        saveUniverse(updatedUniverse);
        setInfoBarColor('#FFFFFF');  // Reset the state to default values
        setMainBackgroundColor('#E8EACC');
        setNavBarColor('#A4C0A5');
        alert('Esthetics reset successfully!');
      }
    } catch (error) {
      console.error('Error resetting esthetics:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="manage-universe">
      <h2>Paramètres de l'univers</h2>
      <form onSubmit={handleUpdate}>
        <label>
          Définir un mot de passe pour l'univers:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="reset-password-button"
          onClick={handleResetPassword}
          disabled={isUpdating}
        >
          {isUpdating ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
        </button>
        <br />
        <br />
        <label>
          Définir un logo pour l'univers:
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
          />
        </label>
        <br />
        <CustomStyles
          infoBarColor={infoBarColor}
          setInfoBarColor={setInfoBarColor}
          setMainBackgroundColor={setMainBackgroundColor}
          mainBackgroundColor={mainBackgroundColor}
          navBarColor={navBarColor}
          setNavBarColor={setNavBarColor}
        />
        <br />
        <button className='update-universe-button' type="submit" disabled={isUpdating}>
          {isUpdating ? 'Mise à jour...' : 'Mettre à jour univers'}
        </button>
        <br />
        <button
          type="button"
          className="reset-esthetics-button"
          onClick={handleResetEsthetics}
          disabled={isUpdating}
        >
          {isUpdating ? 'Réinitialisation...' : 'Réinitialiser esthétique'}
        </button>
      </form>
    </div>
  );
};

export default ManageUniverse;
