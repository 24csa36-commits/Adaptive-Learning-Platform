import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Enforce Onboarding: If user hasn't completed onboarding, trap them in the onboarding/diagnostic flow
  const isOnboardingFlow = location.pathname === '/onboarding' || location.pathname === '/diagnostic-assessment';
  if (!user?.hasCompletedOnboarding && !isOnboardingFlow) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
