
import React, { useState, FormEvent } from 'react';
import { supabase } from '../supabaseClient'; // Import Supabase client

interface SignInProps {
  onSignIn: (userId: string) => void;
}

const USER_ID_PREFIXES = [
  'PHBYUGH',
  'PHBYUNG',
  'PHBYUZA',
  'PHLG',
  'PHCB',
  'PHCBIT',
  'PHBYU',
  'PHCEC',
  'PHBYUMG',
  'PHBYUCG'
];

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const [prefix, setPrefix] = useState<string>(USER_ID_PREFIXES[0]);
  const [numberPart, setNumberPart] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Allow only numbers and limit to 4 digits
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 4) {
      setNumberPart(numericValue);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUserId = `${prefix}${numberPart}`.trim().toUpperCase();

    if (numberPart.length !== 4) {
      setError('User ID number must be exactly 4 digits.');
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
          console.error('Error processing User ID:', supaInsertError.message, supaInsertError);
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
            <div className="flex items-center">
              <select
                id="userIdPrefix"
                name="userIdPrefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="h-full z-10 pl-4 pr-10 py-2.5 bg-lifewood-sea-salt border border-lifewood-dark-serpent border-opacity-20 rounded-l-md focus:ring-2 focus:ring-lifewood-saffaron focus:border-lifewood-saffaron text-lifewood-dark-serpent font-semibold"
                disabled={isLoading}
              >
                {USER_ID_PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input
                type="text"
                id="userId"
                name="userId"
                value={numberPart}
                onChange={handleNumberChange}
                pattern="[0-9]{4}"
                maxLength={4}
                inputMode="numeric"
                className="w-full px-4 py-2.5 bg-lifewood-sea-salt border border-l-0 border-lifewood-dark-serpent border-opacity-20 rounded-r-md focus:ring-2 focus:ring-lifewood-saffaron focus:border-lifewood-saffaron placeholder-lifewood-dark-serpent placeholder-opacity-50 text-lifewood-dark-serpent -ml-px"
                placeholder="Enter 4 digits"
                aria-describedby={error ? "userId-error" : undefined}
                autoFocus
                disabled={isLoading}
              />
            </div>
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