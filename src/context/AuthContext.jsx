import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('skillintel_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!user);

  useEffect(() => {
    if (user) {
      localStorage.setItem('skillintel_user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('skillintel_user');
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const loggedInUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          skillLevel: data.skillLevel,
          learningGoal: data.learningGoal,
          streak: data.streak || 1,
          overallReadiness: data.overallReadiness || 75,
          token: data.token
        };
        setUser(loggedInUser);
        return { success: true };
      } else {
        return { success: false, message: data.message || "Invalid credentials" };
      }
    } catch (err) {
      console.error("Login Error: ", err);
      return { success: false, message: "Server error. Could not connect to backend." };
    }
  };

  const register = async (name, email, password, skillLevel, learningGoal) => {
    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, skillLevel, learningGoal })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const newUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          skillLevel: data.skillLevel,
          learningGoal: data.learningGoal,
          streak: data.streak || 1,
          overallReadiness: data.overallReadiness || 75,
          token: data.token
        };
        setUser(newUser);
        return { success: true };
      } else {
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (err) {
      console.error("Register Error: ", err);
      return { success: false, message: "Server error. Could not connect to backend." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillintel_user');
  };

  const updateProfile = (updatedFields) => {
    setUser(prev => { const updated = { ...prev, ...updatedFields }; localStorage.setItem("skillintel_user", JSON.stringify(updated)); return updated; });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
