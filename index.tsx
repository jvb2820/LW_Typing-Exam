import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import App from './App';
import SignIn from './components/SignIn';
import SignIn2 from './components/SignIn2';
import AdminDashboard from './components/AdminDashboard';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const AppRouter: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem('currentUserId'));
  const [isAdmin, setIsAdmin] = useState<boolean>(() => sessionStorage.getItem('isAdmin') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const handleSignIn = useCallback((userId: string) => {
    localStorage.setItem('currentUserId', userId);
    setCurrentUserId(userId);
    navigate('/');
  }, [navigate]);
  
  const handleAdminSignIn = useCallback(() => {
    sessionStorage.setItem('isAdmin', 'true');
    setIsAdmin(true);
    navigate('/admin');
  }, [navigate]);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('currentUserId');
    setCurrentUserId(null);
    navigate('/signin');
  }, [navigate]);
  
  const handleAdminSignOut = useCallback(() => {
    sessionStorage.removeItem('isAdmin');
    setIsAdmin(false);
    navigate('/signin');
  }, [navigate]);

  return (
    <Routes>
      <Route
        path="/signin"
        element={
          !currentUserId && !isAdmin ? (
            <SignIn onSignIn={handleSignIn} onAdminSignIn={handleAdminSignIn} />
          ) : (
            <Navigate to={isAdmin ? '/admin' : '/'} replace />
          )
        }
      />
      <Route
        path="/signin2"
        element={
          !currentUserId && !isAdmin ? (
            <SignIn2 onSignIn={handleSignIn} />
          ) : (
            <Navigate to={isAdmin ? '/admin' : '/'} replace />
          )
        }
      />
      <Route
        path="/admin"
        element={
          isAdmin ? (
            <AdminDashboard onSignOut={handleAdminSignOut} />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route
        path="/"
        element={
          isAdmin ? (
            <Navigate to="/admin" replace />
          ) : currentUserId ? (
            <App userId={currentUserId} onSignOut={handleSignOut} />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const RootApp: React.FC = () => (
  <BrowserRouter>
    <AppRouter />
  </BrowserRouter>
);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);