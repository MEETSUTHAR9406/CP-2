import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock session check
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, role) => {
    const newUser = { email, role, name: email.split('@')[0] };
    setUser(newUser);
    localStorage.setItem('mock_user', JSON.stringify(newUser));
    return true;
  };

  const signup = (details) => {
    // Mock simulation
    const newUser = { ...details, name: details.email.split('@')[0] };
    setUser(newUser);
    localStorage.setItem('mock_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
