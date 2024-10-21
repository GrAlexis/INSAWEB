import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { useUniverse } from '../../hooks/commonHooks/UniverseContext';
import './ManageUniverse.css';

const ManageUniverse = () => {
  const { selectedUniverse } = useUniverse();
  const [password, setPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Sending request to update the universe with the new hashed password
      const response = await axios.post(`${config.backendAPI}/universe/updatePassword`, {
        universeId: selectedUniverse._id,
        password, // This password should be hashed on the backend
      });

      if (response.status === 200) {
        alert('Password updated successfully!');
      }
    } catch (error) {
      console.error('Error updating universe password:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="manage-universe">
      <h2>Manage Universe</h2>
      <form onSubmit={handleUpdatePassword}>
        <label>
          Set Universe Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ManageUniverse;
