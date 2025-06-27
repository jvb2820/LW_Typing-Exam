import React, { useState, FormEvent } from 'react';
import { supabase } from '../supabaseClient'; // Import Supabase client

interface SignInProps {
  onSignIn: (userId: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const [userIdInput, setUserIdInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUserId = userIdInput.trim();

    if (!trimmedUserId) {
      setError('User ID cannot be empty.');
      return;
    }
    setError('');
    setIsLoading(true);

    let supaInsertError: any = null; 

    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .insert([{ user_id: trimmedUserId }]);
      
      supaInsertError = dbError; 

      if (supaInsertError) {
        if (supaInsertError.code === '23505') {
          // User ID already exists, proceed to sign in
          onSignIn(trimmedUserId);
        } else {
          console.error('Error processing User ID:', supaInsertError);
          setError(`Failed to process User ID: ${supaInsertError.message}. Ensure 'profiles' table is correctly set up.`);
          setIsLoading(false); 
        }
      } else {
        // New User ID successfully inserted
        onSignIn(trimmedUserId);
      }
    } catch (e: any) {
      console.error('Sign-in error:', e);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false); 
    }
    // Do not set isLoading to false here if onSignIn is called, 
    // as the component will unmount or transition.
    // It's set to false only on error paths where the component remains.
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-lifewood-paper text-lifewood-dark-serpent p-4 selection:bg-lifewood-saffaron selection:text-lifewood-dark-serpent font-sans">
      <div className="bg-lifewood-white p-8 sm:p-10 rounded-lg shadow-xl w-full max-w-sm border border-lifewood-dark-serpent border-opacity-10">
        <h1 className="text-3xl font-bold text-lifewood-castleton-green mb-3 text-center">
          Lifewood Typing Exam
        </h1>
        <p className="text-lifewood-dark-serpent opacity-80 mb-8 text-center text-sm">
          Please enter your User ID to continue.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-lifewood-dark-serpent opacity-90 mb-1">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-lifewood-sea-salt border border-lifewood-dark-serpent border-opacity-20 rounded-md focus:ring-2 focus:ring-lifewood-saffaron focus:border-lifewood-saffaron placeholder-lifewood-dark-serpent placeholder-opacity-50 text-lifewood-dark-serpent"
              placeholder="Enter your User ID"
              aria-describedby={error ? "userId-error" : undefined}
              autoFocus
              disabled={isLoading}
            />
            {error && (
              <p id="userId-error" className="mt-2 text-sm text-red-600" role="alert">
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

export default SignIn;