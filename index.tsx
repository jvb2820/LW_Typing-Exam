import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import SignIn from './components/SignIn'; // New component for sign-in

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const RootApp: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    // Optional: Persist User ID in localStorage for convenience
    return localStorage.getItem('currentUserId');
  });

  const handleSignIn = useCallback((userId: string) => {
    localStorage.setItem('currentUserId', userId);
    setCurrentUserId(userId);
  }, []);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('currentUserId');
    setCurrentUserId(null);
  }, []);

  if (!currentUserId) {
    return <SignIn onSignIn={handleSignIn} />;
  }

  return <App userId={currentUserId} onSignOut={handleSignOut} />;
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
