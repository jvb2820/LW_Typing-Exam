
import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import SignIn from './components/SignIn'; // Component for user/admin sign-in
import SignIn2 from './components/SignIn2'; // New sign-in with full name
import AdminDashboard from './components/AdminDashboard'; // New admin dashboard component

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const RootApp: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('currentUserId');
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => sessionStorage.getItem('isAdmin') === 'true');
  const [signInView, setSignInView] = useState<'id' | 'name'>('id');

  // Effect to disable the right-click context menu application-wide
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSignIn = useCallback((userId: string) => {
    localStorage.setItem('currentUserId', userId);
    setCurrentUserId(userId);
  }, []);
  
  const handleAdminSignIn = useCallback(() => {
    sessionStorage.setItem('isAdmin', 'true');
    setIsAdmin(true);
  }, []);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('currentUserId');
    setCurrentUserId(null);
  }, []);
  
  const handleAdminSignOut = useCallback(() => {
    sessionStorage.removeItem('isAdmin');
    setIsAdmin(false);
  }, []);

  if (isAdmin) {
    return <AdminDashboard onSignOut={handleAdminSignOut} />;
  }

  if (!currentUserId) {
    if (signInView === 'id') {
      return (
        <SignIn
          onSignIn={handleSignIn}
          onAdminSignIn={handleAdminSignIn}
          onSwitchToNameSignIn={() => setSignInView('name')}
        />
      );
    }
    return (
      <SignIn2
        onSignIn={handleSignIn}
        onSwitchToIdSignIn={() => setSignInView('id')}
      />
    );
  }

  return <App userId={currentUserId} onSignOut={handleSignOut} />;
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);