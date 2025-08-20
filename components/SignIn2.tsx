
import React, { useState, FormEvent } from 'react';
import { supabase } from '../supabaseClient';

interface SignIn2Props {
  onSignIn: (userId: string) => void;
  onSwitchToIdSignIn: () => void;
}

const SignIn2: React.FC<SignIn2Props> = ({ onSignIn, onSwitchToIdSignIn }) => {
  const [fullName, setFullName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedFullName = fullName.trim();
    if (trimmedFullName.length === 0) {
      setError('Full name cannot be empty.');
      return;
    }
    const userId = trimmedFullName.toUpperCase();
    
    setError('');
    setIsLoading(true);

    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .insert([{ user_id: userId }]);
      
      if (dbError) {
        if (dbError.code === '23505') { // User already exists
          onSignIn(userId);
        } else {
          console.error('Error processing Full Name:', dbError.message, dbError);
          setError(`Failed to process Full Name: ${dbError.message}. Ensure 'profiles' table is correctly set up.`);
          setIsLoading(false); 
        }
      } else {
        onSignIn(userId);
      }
    } catch (e: any) {
      console.error('Sign-in error:', e);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-lifewood-paper text-lifewood-dark-serpent p-4 selection:bg-lifewood-saffaron selection:text-lifewood-dark-serpent font-sans">
      <div className="bg-lifewood-white p-8 sm:p-10 rounded-lg shadow-xl w-full max-w-sm border border-lifewood-dark-serpent border-opacity-10">
        <h1 className="text-3xl font-bold text-lifewood-castleton-green mb-3 text-center">
          Lifewood Typing Exam
        </h1>
        <p className="text-lifewood-dark-serpent opacity-80 mb-8 text-center text-sm">
          Please enter your Full Name to continue.
        </p>
        
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-lifewood-dark-serpent opacity-90 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-lifewood-sea-salt border border-lifewood-dark-serpent border-opacity-20 rounded-md focus:ring-2 focus:ring-lifewood-saffaron focus:border-lifewood-saffaron placeholder-lifewood-dark-serpent placeholder-opacity-50 text-lifewood-dark-serpent"
              placeholder="e.g., John Doe"
              aria-describedby={error ? "fullName-error" : undefined}
              autoFocus
              disabled={isLoading}
            />
            {error && (
              <p id="fullName-error" className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            className={`w-full mt-8 px-4 py-3 bg-lifewood-saffaron text-lifewood-dark-serpent font-semibold rounded-md hover:bg-lifewood-earth-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-lifewood-saffaron focus:ring-offset-2 focus:ring-offset-lifewood-white ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="text-center mt-6 pt-6 border-t border-lifewood-dark-serpent border-opacity-10">
          <button
              onClick={onSwitchToIdSignIn}
              className="text-sm text-lifewood-dark-serpent opacity-70 hover:opacity-100 transition-opacity hover:underline"
              disabled={isLoading}
          >
              Sign in with User ID
          </button>
        </div>
      </div>
      <footer className="text-center mt-12 text-sm text-lifewood-dark-serpent opacity-75">
        <p>
          Lifewood Typing Exam
        </p>
        <p className="text-xs opacity-80">
          Powered by <span className="font-semibold text-lifewood-castleton-green">@Lifewood CBIT Team</span>
        </p>
      </footer>
    </div>
  );
};

export default SignIn2;
