

import React, { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { COUNTRIES } from '../constants/countries';
import { UserInfo } from '../types';

interface UserInfoFormProps {
  userId: string;
  initialData: UserInfo | null;
  onSuccess: () => void;
  onClose: () => void;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ userId, initialData, onSuccess, onClose }) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [country, setCountry] = useState<string>('Philippines');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.first_name);
      setLastName(initialData.last_name);
      setEmail(initialData.email || '');
      setCountry(initialData.country);
      setIsEditMode(true);
    }
  }, [initialData]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedFirstName || !trimmedLastName || !country || !trimmedEmail) {
      setError('All fields are required.');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
        setError('Please enter a valid email address.');
        return;
    }

    setError('');
    setIsLoading(true);

    try {
      const payload = {
        user_id: userId,
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        email: trimmedEmail,
        country: country,
      };

      const { error: dbError } = isEditMode
        ? await supabase.from('user_info').update(payload).eq('user_id', userId)
        : await supabase.from('user_info').insert([payload]);

      if (dbError) {
        console.error('Error saving user info:', dbError.message);
        setError(`Failed to save information: ${dbError.message}. Ensure the 'user_info' table is correctly set up.`);
        setIsLoading(false);
      } else {
        onSuccess();
      }
    } catch (e: any) {
      console.error('Submission error:', e);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-lifewood-white p-8 sm:p-10 rounded-lg shadow-xl w-full max-w-lg border border-lifewood-dark-serpent border-opacity-10 font-sans animate-fade-in relative">
        <button 
            type="button"
            onClick={onClose} 
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      
      <h1 className="text-3xl font-bold text-lifewood-castleton-green mb-3 text-center">
        {isEditMode ? 'Edit Your Profile' : 'Complete Your Profile'}
      </h1>
      <p className="text-lifewood-dark-serpent opacity-80 mb-8 text-center text-sm">
        {isEditMode ? 'Update your details below.' : 'Please provide your details to continue.'}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-lifewood-dark-serpent opacity-90 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 bg-lifewood-sea-salt border border-lifewood-dark-serpent border-opacity-20 rounded-md focus:ring-2 focus:ring-lifewood-saffaron focus:border-lifewood-saffaron placeholder-lifewood-dark-serpent placeholder-opacity-50 text-lifewood-dark-serpent"
              placeholder="e.g., John"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-lifewood-dark-serpent opacity-90 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 bg-lifewood-sea-salt border border-lifewood-dark-serpent border-opacity-20 rounded-md focus:ring-2 focus:ring-lifewood-saffaron focus:border-lifewood-saffaron placeholder-lifewood-dark-serpent placeholder-opacity-50 text-lifewood-dark-serpent"
              placeholder="e.g., Doe"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-lifewood-dark-serpent opacity-90 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-lifewood-sea-salt border border-lifewood-dark-serpent border-opacity-20 rounded-md focus:ring-2 focus:ring-lifewood-saffaron focus:border-lifewood-saffaron placeholder-lifewood-dark-serpent placeholder-opacity-50 text-lifewood-dark-serpent"
              placeholder="e.g., john.doe@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-lifewood-dark-serpent opacity-90 mb-1">
              Country of Residence
            </label>
            <select
              id="country"
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2.5 bg-lifewood-sea-salt border border-lifewood-dark-serpent border-opacity-20 rounded-md focus:ring-2 focus:ring-lifewood-saffaron focus:border-lifewood-saffaron text-lifewood-dark-serpent"
              disabled={isLoading}
              required
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        {error && (
          <p id="form-error" className="mt-4 text-sm text-red-600 text-center" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className={`w-full mt-8 px-4 py-3 bg-lifewood-saffaron text-lifewood-dark-serpent font-semibold rounded-md hover:bg-lifewood-earth-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-lifewood-saffaron focus:ring-offset-2 focus:ring-offset-lifewood-white ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save and Continue')}
        </button>
      </form>
    </div>
  );
};

export default UserInfoForm;