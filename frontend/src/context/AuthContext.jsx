import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Backend URL
  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    // Check for token and restore session
    const checkSession = async () => {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }
    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();
        const userData = {
            name: data.user_name,
            email: email, // or data.email if returned
            role: data.user_role
        };

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        return true;
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
  };

  const signup = async (details) => {
    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(details),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Signup failed');
        }

        const data = await response.json();
        const userData = {
            name: data.user_name,
            email: details.email,
            role: data.user_role
        };

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        return true;
    } catch (error) {
        console.error("Signup Error:", error);
        throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
