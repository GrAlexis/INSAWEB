import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://92.243.24.55:5000/users');
        const usersData = response.data;

        // Fetch team details for each user
        for (const user of usersData) {
          if (user.teamId) {
            const teamResponse = await axios.get(`http://92.243.24.55:5000/teams/${user.teamId}`);
            user.teamName = teamResponse.data.name;
          } else {
            user.teamName = 'No Team';
          }
        }

        setUsers(usersData);
        // Set the first user as the default user
        if (usersData.length > 0) {
          setUser(usersData[0]);
        }
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };

    fetchUsers();
  }, []);

  // Method to update user team name
  const updateUserTeamName = async (currentUser) => {
    if (currentUser.teamId) {
      try {
        const teamResponse = await axios.get(`http://92.243.24.55:5000/teams/${currentUser.teamId}`);
        const teamName = teamResponse.data.name;
        if (currentUser.teamName !== teamName) {
          setUser({ ...currentUser, teamName });
        }
      } catch (error) {
        console.error('Error fetching team name', error);
      }
    } else {
      if (currentUser.teamName !== 'No Team') {
        setUser({ ...currentUser, teamName: 'No Team' });
      }
    }
  };


  return (
    <UserContext.Provider value={{ user, setUser, users, updateUserTeamName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
