import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
//import { createSearchIndex } from '../../../../server/models/post';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const email = sessionStorage.getItem('email')
        if (!email){
          console.error('Not authenticated')
        }
        const response = await axios.get(`http://localhost:5000/api/user/${email}`);
        const userData = response.data;
        setUser(userData)

          // Fetch team details for each use
          try {
            console.log(user.teamId)
            const teamResponse = await axios.get(`http://localhost:5000/teams/${user.teamId}`);
            user.teamName = teamResponse.data.name;
          }
          catch (TypeError){
            console.log("entering the catch")
            user.teamName = 'No Team'
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
        const teamResponse = await axios.get(`http://localhost:5000/teams/${currentUser.teamId}`);
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
