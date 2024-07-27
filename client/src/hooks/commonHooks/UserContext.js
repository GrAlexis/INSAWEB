import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create a context with default value as null
const UserContext = createContext(null);

// Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/users');
        const usersData = response.data;

        // Fetch team details for each user
        for (const user of usersData) {
          if (user.teamId) {
            const teamResponse = await axios.get(`http://localhost:5001/teams/${user.teamId}`);
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

  // Provide the state and the function to update it
  return (
    <UserContext.Provider value={{ user, setUser, users }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to use the UserContext
export const useUser = () => useContext(UserContext);
