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
        alert('Universe updated successfully!');
      }
      saveUniverse()
    } catch (error) {
      console.error('Error updating universe:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="manage-universe">
      <h2>Manage Universe</h2>
      <form onSubmit={handleUpdate}>
        <label>
          Set Universe Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <label>
          Upload Universe Logo:
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
          {isUpdating ? 'Updating...' : 'Update Universe'}
        </button>
      </form>
    </div>
  );
};

export default ManageUniverse;
