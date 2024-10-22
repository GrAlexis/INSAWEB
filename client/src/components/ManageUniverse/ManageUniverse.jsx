import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext';
import './ManageUniverse.css';

const ManageUniverse = () => {
  const { selectedUniverse } = useUniverse();
  const [password, setPassword] = useState('');
  const [logo, setLogo] = useState(null);  // State to store the uploaded logo
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);  // Store the file in the state
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append('universeId', selectedUniverse._id);  // Append universeId
      formData.append('password', password);  // Append password
      if (logo) {
        formData.append('file', logo);  // Append logo file (to be converted on the server)
      }

      // Sending request to update the universe with the new password and logo
      const response = await axios.post(`${config.backendAPI}/universe/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },  // Ensure multipart data is sent
      });

      if (response.status === 200) {
        alert('Universe updated successfully!');
      }
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
        <button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Universe'}
        </button>
      </form>
    </div>
  );
};

export default ManageUniverse;
