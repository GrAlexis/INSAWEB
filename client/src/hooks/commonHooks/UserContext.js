import React, { createContext, useContext, useState } from 'react';

// Create a context with default value as null
const UserContext = createContext(null);

// Create a provider component
export const UserProvider = ({ children }) => {
  // Define the state and setState function
  const [user, setUser] = useState({
    id: '1',
    name: 'Marie Friot',
    firstName: 'Marie',
    lastName: 'Friot',
    email: 'john.doe@example.com',
    avatar: 'path/to/avatar.jpg',
    classYear: '3TC',
    balance: 1000,
    rank:1
  });

  // Provide the state and the function to update it
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to use the UserContext
export const useUser = () => useContext(UserContext);
