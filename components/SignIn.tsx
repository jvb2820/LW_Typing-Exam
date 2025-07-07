
import React, { useState, FormEvent } from 'react';
import { supabase } from '../supabaseClient'; // Import Supabase client

interface SignInProps {
  onSignIn: (userId: string) => void;
}

const USER_ID_PREFIXES = [
  'PHBYUGH', 'PHBYUNG', 'PHBYUZA', 'PHLG', 'PHCB', 'PHCBIT', 'PHBYU', 'PHCEC'
];

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const [selectedPrefix, setSelectedPrefix] = useState<string>(USER_ID_PREFIXES[0]);
  const [userIdNumberInput, setUserIdNumberInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^[0-9]*$/.test(value)) {
      setUserIdNumberInput(value);
    }
  };
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedNumber = userIdNumberInput.trim();

    if (!trimmedNumber) {
      setError('Please enter your number.');
      return;
    }
    setError('');
    setIsLoading(true);

    const fullUserId = selectedPrefix + trimmedNumber;
    let supaInsertError: any = null; 

    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .insert([{ user_id: fullUserId }]);
      
      supaInsertError = dbError; 

      if (supaInsertError) {
        if (supaInsertError.code === '23505') {
          // User ID already exists, proceed to sign in
          onSignIn(fullUserId);
        } else {
          console.error('Error processing User ID:', supaInsertError.message, supaInsertError);
          setError(`Failed to process User ID: ${supaInsertError.message}. Ensure 'profiles' table is correctly set up.`);
          setIsLoading(false); 
        }
      } else {
        // New User ID successfully inserted
        onSignIn(fullUserId);
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
          <div className="mb-6">
            <label htmlFor="userPrefix" className="block text-sm font-medium text-lifewood-dark-serpent opacity-90 mb-1">
              User ID
            </label>
            <div className="flex">
                <div className="relative">
                    <select
                        id="userPrefix"
                        name="userPrefix"
                        value={selectedPrefix}
                        onChange={(e) => setSelectedPrefix(e.target.value)}
                        disabled={isLoading}
                        className="appearance-none z-10 block pl-3 pr-10 py-2.5 bg-lifewood-sea-salt border border-lifewood-dark-serpent border-opacity-20 rounded-l-md focus:ring-2 focus:ring-lifewood-saffaron focus:border-lifewood-saffaron text-lifewood-dark-serpent focus:outline-none"
                        aria-label="User ID Prefix"
                    >
                        {USER_ID_PREFIXES.map((prefix) => (
                            <option key={prefix} value={prefix}>
                            {prefix}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-lifewood-dark-serpent">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
                        </svg>
                    </div>
                </div>
                <input
                    type="text"
                    id="userId"
                    name="userId"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={userIdNumberInput}
                    onChange={handleNumberChange}
                    className="relative w-full px-4 py-2.5 bg-lifewood-white border border-lifewood-dark-serpent border-opacity-20 rounded-r-md -ml-px focus:z-10 focus:ring-2 focus:ring-lifewood-saffaron focus:border-lifewood-saffaron placeholder-lifewood-dark-serpent placeholder-opacity-50 text-lifewood-dark-serpent"
                    placeholder=" "
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
            className={`w-full px-4 py-3 bg-lifewood-saffaron text-lifewood-dark-serpent font-semibold rounded-md hover:bg-lifewood-earth-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-lifewood-saffaron focus:ring-offset-2 focus:ring-offset-lifewood-white ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging In...' : 'Login'}
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
