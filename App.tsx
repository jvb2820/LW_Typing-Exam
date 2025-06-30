

import React, { useState, useCallback, useEffect } from 'react';
import TypingTest from './components/TypingTest';
import StatsDisplay from './components/StatsDisplay';
import { TestStats, ActiveTestType } from './types';
import { supabase } from './supabaseClient'; 
import { COMMON_WORDS } from './constants/words';
import { EXERCISE_1_PHRASES, EXERCISE_2_PHRASES } from './constants/exercises';

interface AppProps {
  userId: string;
  onSignOut: () => void;
}

const FINAL_EXAM_DURATION = 60;
const EXERCISE_DURATION = 45; 
const WORDS_TO_GENERATE_FINAL_EXAM = 200;

const NUMBERS_FOR_EXAM = ['1', '2', '7', '10', '25', '50', '100', '121', '300', '555', '999', '2024', '1989', '42'];

const generateRandomWords = (count: number, includeNumbers: boolean = false): string[] => {
  const shuffled = [...COMMON_WORDS].sort(() => 0.5 - Math.random());
  const words = shuffled.slice(0, count);

  if (includeNumbers) {
    const numbersToInsertCount = Math.floor(count * 0.1); // ~10% numbers
    for (let i = 0; i < numbersToInsertCount; i++) {
      const wordIndexToReplace = Math.floor(Math.random() * words.length);
      const numberToInsert = NUMBERS_FOR_EXAM[Math.floor(Math.random() * NUMBERS_FOR_EXAM.length)];
      words[wordIndexToReplace] = numberToInsert;
    }
  }
  return words;
};

const getRandomPhrase = (phrases: string[]): string => {
  if (phrases.length === 0) return "";
  const randomIndex = Math.floor(Math.random() * phrases.length);
  return phrases[randomIndex];
};

const SpecialNote: React.FC = () => (
  <div className="w-full max-w-3xl mx-auto my-6 p-4 bg-red-50 border border-red-200 rounded-lg text-lifewood-dark-serpent font-sans">
    <h3 className="text-lg font-bold text-red-700 mb-2">Special Note:</h3>
    <p className="text-sm mb-2">
      Passing Marks - WPM <strong className="text-red-600">25</strong>, Accuracy (Word-based) <strong className="text-red-600">90%</strong>, and True Accuracy (Character-based) <strong className="text-red-600">85%</strong>.
    </p>
  </div>
);


const App: React.FC<AppProps> = ({ userId, onSignOut }) => {
  const [results, setResults] = useState<TestStats | null>(null);
  const [activeTestType, setActiveTestType] = useState<ActiveTestType>(null);
  const [typingTestKey, setTypingTestKey] = useState(0);
  const [isSavingResults, setIsSavingResults] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isResultsSubmitted, setIsResultsSubmitted] = useState<boolean>(false);
  
  const [wordsToDisplay, setWordsToDisplay] = useState<string[]>([]);
  const [currentTestDuration, setCurrentTestDuration] = useState<number>(FINAL_EXAM_DURATION);
  
  const [view, setView] = useState<'dashboard' | 'exercise_selection' | 'test'>('dashboard');

  const prepareTest = useCallback((testType: ActiveTestType) => {
    setResults(null);
    setIsResultsSubmitted(false);
    setSaveError(null);
    setActiveTestType(testType);
    setTypingTestKey(prevKey => prevKey + 1);
    setView('test');

    if (testType === 'exercise1') {
      const phrase = getRandomPhrase(EXERCISE_1_PHRASES);
      setWordsToDisplay(phrase.split(' '));
      setCurrentTestDuration(EXERCISE_DURATION);
    } else if (testType === 'exercise2') {
      const phrase = getRandomPhrase(EXERCISE_2_PHRASES);
      setWordsToDisplay(phrase.split(' ')); 
      setCurrentTestDuration(EXERCISE_DURATION);
    } else if (testType === 'final_exam') {
      setWordsToDisplay(generateRandomWords(WORDS_TO_GENERATE_FINAL_EXAM, true));
      setCurrentTestDuration(FINAL_EXAM_DURATION);
    }
  }, []);

  const handleTestComplete = useCallback((stats: TestStats) => {
    setResults(stats);
  }, []);

  const handleConfirmAndSaveResults = useCallback(async () => {
    if (!results || activeTestType !== 'final_exam') return; 

    setIsSavingResults(true);
    setSaveError(null);
    
    const pass_status = results.wpm >= 25 && results.accuracy >= 90 && results.trueAccuracy >= 85;

    try {
      const payload = {
            user_id: userId,
            wpm: results.wpm,
            accuracy: results.accuracy,
            true_accuracy: results.trueAccuracy,
            pass_status: pass_status, 
          };

      const { error } = await supabase
        .from('test_results')
        .insert([payload]);

      if (error) {
        console.error('Error saving test results:', error);
        
        let feedbackMessage = 'An issue occurred.'; // Default part of the message
        if (typeof error.message === 'string' && error.message.trim() !== '') {
          feedbackMessage = error.message;
        } else if (typeof error.details === 'string' && error.details.trim() !== '') {
          feedbackMessage = error.details;
        } else if (typeof error.hint === 'string' && error.hint.trim() !== '') {
            feedbackMessage = error.hint;
        } else {
          try {
            const errorString = JSON.stringify(error);
            feedbackMessage = (errorString && errorString !== '{}') ? `Details: ${errorString}` : 'Unexpected error structure.';
          } catch (stringifyError) {
            feedbackMessage = 'Could not retrieve error details.';
          }
        }
        
        setSaveError(`Failed to save results: ${feedbackMessage}. Ensure 'test_results' table is updated (pass_status column added, others removed) and RLS is configured correctly.`);
        setIsResultsSubmitted(false);
      } else {
        setIsResultsSubmitted(true);
      }
    } catch (e: any) {
      console.error('Supabase call error:', e);
      setSaveError('An unexpected error occurred while saving results.');
      setIsResultsSubmitted(false);
    } finally {
      setIsSavingResults(false);
    }
  }, [userId, results, activeTestType]);

  const handleRestartOrChangeTest = useCallback(() => {
    const isPass = results && activeTestType === 'final_exam' && results.wpm >= 25 && results.accuracy >= 90 && results.trueAccuracy >= 85;
    
    if (activeTestType === 'final_exam' && results && !isPass) {
        prepareTest('final_exam'); 
    } else {
        setResults(null);
        setActiveTestType(null); 
        setSaveError(null);
        setIsResultsSubmitted(false);
        setView('dashboard');
    }
  }, [activeTestType, results, prepareTest]);
  
  const handleSignOutClick = () => {
    setResults(null); 
    setActiveTestType(null);
    setSaveError(null);
    setIsResultsSubmitted(false);
    setView('dashboard');
    onSignOut();
  };

  useEffect(() => {
    setActiveTestType(null);
    setResults(null);
    setSaveError(null);
    setIsResultsSubmitted(false);
    setView('dashboard');
  }, [userId]);

  const renderDashboard = () => (
    <div className="w-full max-w-xl mx-auto mt-2 p-8 bg-lifewood-white rounded-lg shadow-xl border border-lifewood-dark-serpent border-opacity-10">
      <h2 className="text-3xl font-bold text-lifewood-castleton-green mb-8 text-center font-sans">Dashboard</h2>
      <div className="space-y-6">
        <button
          onClick={() => setView('exercise_selection')}
          className="w-full px-6 py-4 bg-lifewood-saffaron text-lifewood-dark-serpent font-semibold rounded-lg hover:bg-lifewood-earth-yellow transition-colors text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-lifewood-saffaron focus:ring-offset-2 focus:ring-offset-lifewood-white font-sans"
        >
          Practice Exercises
        </button>
        <button
          onClick={() => prepareTest('final_exam')}
          className="w-full px-6 py-4 bg-lifewood-castleton-green text-lifewood-paper font-semibold rounded-lg hover:bg-opacity-80 transition-colors text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-lifewood-castleton-green focus:ring-offset-2 focus:ring-offset-lifewood-white font-sans"
        >
          Start Final Exam (1 min)
        </button>
      </div>
    </div>
  );

  const renderExerciseSelection = () => (
    <div className="w-full max-w-xl mx-auto mt-2 p-8 bg-lifewood-white rounded-lg shadow-xl border border-lifewood-dark-serpent border-opacity-10">
      <h2 className="text-3xl font-bold text-lifewood-castleton-green mb-8 text-center font-sans">Choose Your Exercise</h2>
      <div className="space-y-6">
        <button
          onClick={() => prepareTest('exercise1')}
          className="w-full px-6 py-4 bg-lifewood-saffaron text-lifewood-dark-serpent font-semibold rounded-lg hover:bg-lifewood-earth-yellow transition-colors text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-lifewood-sffaron focus:ring-offset-2 focus:ring-offset-lifewood-white font-sans"
        >
          Start Exercise 1
        </button>
        <button
          onClick={() => prepareTest('exercise2')}
          className="w-full px-6 py-4 bg-lifewood-saffaron text-lifewood-dark-serpent font-semibold rounded-lg hover:bg-lifewood-earth-yellow transition-colors text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-lifewood-saffaron focus:ring-offset-2 focus:ring-offset-lifewood-white font-sans"
        >
          Start Exercise 2
        </button>
         <button
          onClick={() => setView('dashboard')}
          className="w-full px-6 py-3 bg-transparent text-lifewood-dark-serpent font-semibold rounded-lg hover:bg-lifewood-sea-salt transition-colors text-md border border-lifewood-dark-serpent border-opacity-30 mt-8"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  const getSubtitle = () => {
    switch(view) {
      case 'dashboard':
        return 'Welcome! Choose an option below to get started.';
      case 'exercise_selection':
        return 'Select a practice exercise.';
      case 'test':
        switch(activeTestType) {
          case 'exercise1': return 'Exercise 1: Practice typing a sentence.';
          case 'exercise2': return 'Exercise 2: Practice typing numbers.';
          case 'final_exam': return 'Final Exam: Test your typing speed and accuracy (1 min test).';
          default: return 'Loading test...';
        }
      default:
        return 'Select an exercise or the final exam to begin.';
    }
  };

  return (
    <div className="min-h-screen bg-lifewood-paper text-lifewood-dark-serpent flex flex-col items-center justify-center p-4 selection:bg-lifewood-saffaron selection:text-lifewood-dark-serpent">
      <header className="w-full max-w-3xl mx-auto mb-2 sm:mb-0">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-lifewood-castleton-green font-sans">
              Lifewood Typing Exam
            </h1>
            <p className="text-lifewood-dark-serpent opacity-80 text-sm sm:text-base font-sans">
              {getSubtitle()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lifewood-dark-serpent opacity-90 text-xs sm:text-sm mb-1 font-sans" aria-label={`Current user: ${userId}`}>User: {userId}</p>
            <button
              onClick={handleSignOutClick}
              className="px-3 py-1.5 bg-lifewood-saffaron hover:bg-lifewood-earth-yellow text-lifewood-dark-serpent rounded-md text-xs sm:text-sm font-medium transition-colors font-sans"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      {view === 'test' && activeTestType === 'final_exam' && <SpecialNote />} 
      
      <main className="w-full max-w-3xl mx-auto mt-0">
        {(isSavingResults && !isResultsSubmitted && activeTestType === 'final_exam') && (
          <div className="text-center p-4 my-4 bg-lifewood-sea-salt rounded-md border border-lifewood-saffaron">
            <p className="text-lifewood-castleton-green font-sans">Submitting results...</p>
          </div>
        )}
        {saveError && (
          <div className="text-center p-4 my-4 bg-red-100 text-red-700 border border-red-500 rounded-md">
            <p role="alert" className="font-sans">{saveError}</p>
          </div>
        )}

        {view === 'dashboard' && renderDashboard()}
        {view === 'exercise_selection' && renderExerciseSelection()}
        
        {view === 'test' && (
          <>
            {!results && (
              <>
                <TypingTest
                  key={typingTestKey}
                  initialWords={wordsToDisplay}
                  testDurationSeconds={currentTestDuration}
                  onTestComplete={handleTestComplete}
                />
                <div className="mt-6 text-center">
                  <button
                    onClick={handleRestartOrChangeTest}
                    className="px-6 py-3 bg-lifewood-saffaron text-lifewood-dark-serpent font-semibold rounded-lg hover:bg-lifewood-earth-yellow transition-colors text-md shadow-sm"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </>
            )}
            
            {results && (
              <StatsDisplay
                stats={results}
                onRestart={handleRestartOrChangeTest}
                onSubmitResults={handleConfirmAndSaveResults}
                isSavingResults={isSavingResults}
                isResultsSubmitted={isResultsSubmitted}
                isFinalExam={activeTestType === 'final_exam'} 
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;