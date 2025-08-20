import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import * as ReactRouterDOM from 'react-router-dom';
import App from './App';
import SignIn from './components/SignIn';
import SignIn2 from './components/SignIn2';
import AdminDashboard from './components/AdminDashboard';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const AppController: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem('currentUserId'));
  const [isAdmin, setIsAdmin] = useState<boolean>(() => sessionStorage.getItem('isAdmin') === 'true');
  const navigate = ReactRouterDOM.useNavigate();

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
    <ReactRouterDOM.Routes>
      <ReactRouterDOM.Route
        path="/signin"
        element={
          !currentUserId && !isAdmin ? (
            <SignIn onSignIn={handleSignIn} onAdminSignIn={handleAdminSignIn} />
          ) : (
            <ReactRouterDOM.Navigate to={isAdmin ? '/admin' : '/'} />
          )
        }
      />
      <ReactRouterDOM.Route
        path="/signin2"
        element={
          !currentUserId && !isAdmin ? (
            <SignIn2 onSignIn={handleSignIn} />
          ) : (
            <ReactRouterDOM.Navigate to={isAdmin ? '/admin' : '/'} />
          )
        }
      />
      <ReactRouterDOM.Route
        path="/admin"
        element={
          isAdmin ? (
            <AdminDashboard onSignOut={handleAdminSignOut} />
          ) : (
            <ReactRouterDOM.Navigate to="/signin" />
          )
        }
      />
      <ReactRouterDOM.Route
        path="/"
        element={
          currentUserId ? (
            <App userId={currentUserId} onSignOut={handleSignOut} />
          ) : (
            <ReactRouterDOM.Navigate to="/signin" />
          )
        }
      />
      <ReactRouterDOM.Route
        path="*"
        element={<ReactRouterDOM.Navigate to={currentUserId ? '/' : '/signin'} />}
      />
    </ReactRouterDOM.Routes>
  );
};

const RootApp: React.FC = () => (
  <ReactRouterDOM.BrowserRouter>
    <AppController />
  </ReactRouterDOM.BrowserRouter>
);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);