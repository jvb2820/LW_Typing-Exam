import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSignIn: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isAdminLoading, setIsAdminLoading] = useState(false); // Track loading state

  const handleAdminSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminError('');
    setIsAdminLoading(true); // Start loading

    // Simulate checking admin credentials
    if (username === 'admin' && password === 'PhCBIT12345') {
      // Admin is authenticated, proceed
      sessionStorage.setItem('isAdmin', 'true');
      
      // Trigger page reload after successful login
      setTimeout(() => {
        window.location.reload(); // Refresh the page to apply new state
      }, 1000); // Optional delay to show the loading spinner (1 second)
    } else {
      setAdminError('Invalid username or password.');
      setIsAdminLoading(false); // End loading on failure
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-lifewood-paper text-lifewood-dark-serpent p-4 selection:bg-lifewood-saffaron selection:text-lifewood-dark-serpent font-sans">
      <div className="bg-lifewood-white p-8 sm:p-10 rounded-lg shadow-xl w-full max-w-sm border border-lifewood-dark-serpent border-opacity-10">
        <h1 className="text-3xl font-bold text-lifewood-castleton-green mb-3 text-center">Admin Login</h1>
        <p className="text-lifewood-dark-serpent opacity-80 mb-8 text-center text-sm">Please Wait</p>

        {/* Show loading spinner while isAdminLoading is true */}
        {isAdminLoading ? (
          <div className="flex justify-center items-center h-full mb-8">
            <svg className="animate-spin h-8 w-8 text-lifewood-saffaron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <form onSubmit={handleAdminSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-lifewood-dark-serpent opacity-90 mb-1">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-lifewood-sea-salt border border-lifewood-dark-serpent border-opacity-20 rounded-md focus:ring-2 focus:ring-lifewood-saffaron focus:border-lifewood-saffaron placeholder-lifewood-dark-serpent placeholder-opacity-50 text-lifewood-dark-serpent"
                  placeholder="admin"
                  autoFocus
                  disabled={isAdminLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-lifewood-dark-serpent opacity-90 mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-lifewood-sea-salt border border-lifewood-dark-serpent border-opacity-20 rounded-md focus:ring-2 focus:ring-lifewood-saffaron focus:border-lifewood-saffaron placeholder-lifewood-dark-serpent placeholder-opacity-50 text-lifewood-dark-serpent"
                  placeholder="••••••••"
                  disabled={isAdminLoading}
                />
              </div>
            </div>
            {adminError && <p className="mt-4 text-sm text-red-600 text-center">{adminError}</p>}
            <button
              type="submit"
              className={`w-full mt-8 px-4 py-3 bg-lifewood-castleton-green text-lifewood-paper font-semibold rounded-md hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-lifewood-castleton-green focus:ring-offset-2 focus:ring-offset-lifewood-white ${isAdminLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={isAdminLoading}
            >
              {isAdminLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminSignIn;
