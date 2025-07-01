

import React, { useState, useCallback, useEffect } from 'react';
import TypingTest from './components/TypingTest';
import StatsDisplay from './components/StatsDisplay';
import { TestStats, ActiveTestType, ExerciseKey } from './types';
import { supabase } from './supabaseClient'; 
import { COMMON_WORDS } from './constants/words';
import {
  WARMUP_HOME_ROW,
  WARMUP_ALPHABET,
  BASIC_SIMPLE_SENTENCES,
  INTERMEDIATE_COMPLEX_SENTENCES,
  INTERMEDIATE_PARAGRAPH,
  ADVANCED_TECHNICAL_VOCAB,
  ADVANCED_SPECIAL_CHARS,
  ACCURACY_CHALLENGE_TEXT,
} from './constants/exercises';

interface AppProps {
  userId: string;
  onSignOut: () => void;
}

const FINAL_EXAM_DURATION = 60;
const WORDS_TO_GENERATE = 200;

const NUMBERS_FOR_EXAM = ['1', '2', '7', '10', '25', '50', '100', '121', '300', '555', '999', '2024', '1989', '42'];

type ExerciseInfo = {
  key: ExerciseKey;
  title: string;
  description: string;
};

type ExerciseCategoryData = {
  category: string;
  items: ExerciseInfo[];
};

const EXERCISES_DATA: ExerciseCategoryData[] = [
  {
    category: '1. Warm-up & Introductory',
    items: [
      { key: 'warmup_home_row', title: 'Home Row Practice', description: 'Simple words using only home row keys (ASDF JKL;).' },
      { key: 'warmup_alphabet', title: 'Alphabet Practice', description: 'Builds familiarity with all letter positions.' },
    ],
  },
  {
    category: '2. Basic Typing',
    items: [
      { key: 'basic_simple_sentences', title: 'Simple Sentences', description: 'Short sentences with basic punctuation to build speed.' },
      { key: 'basic_common_words', title: 'Common Words', description: 'Practice the most frequently used English words.' },
    ],
  },
  {
    category: '3. Intermediate Typing',
    items: [
      { key: 'intermediate_complex_sentences', title: 'Complex Sentences', description: 'Longer sentences with mixed punctuation to improve fluidity.' },
      { key: 'intermediate_paragraph', title: 'Paragraph Practice', description: 'Improve typing endurance with a full paragraph.' },
    ],
  },
  {
    category: '4. Advanced Typing',
    items: [
      { key: 'advanced_technical_vocab', title: 'Technical Vocabulary', description: 'Practice with terms from coding and other industries.' },
      { key: 'advanced_special_chars', title: 'Special Characters', description: 'Sentences including characters like @, #, $, %.' },
    ],
  },
  {
    category: '5. Speed & Accuracy Drills',
    items: [
      { key: 'drill_timed_1_min', title: '1-Minute Timed Test', description: 'Assess your typing speed under timed conditions.' },
      { key: 'drill_timed_3_min', title: '3-Minute Timed Test', description: 'A longer test to challenge your speed and consistency.' },
      { key: 'drill_accuracy_challenge', title: 'Accuracy Challenge', description: 'Type a passage perfectly. The test ends on the first error.' },
    ],
  },
];

const generateRandomWords = (count: number, includeNumbers: boolean = false): string[] => {
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)]);
  }

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
  const [isAccuracyChallenge, setIsAccuracyChallenge] = useState<boolean>(false);
  
  const [view, setView] = useState<'dashboard' | 'exercise_selection' | 'test'>('dashboard');
  const [completedExercises, setCompletedExercises] = useState<Set<ExerciseKey>>(new Set());
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedExercises = async () => {
        if (!userId) return;
        setProgressError(null);
        try {
            const { data, error } = await supabase
                .from('completed_exercises')
                .select('exercise_key')
                .eq('user_id', userId);
            
            if (error) {
                console.error("Error fetching completed exercises:", error.message, error);
                setProgressError("Could not load practice progress. The database may be misconfigured.");
                setCompletedExercises(new Set()); // Gracefully fail
                return;
            }
            if (data) {
                const completedKeys = data.map(item => item.exercise_key as ExerciseKey);
                setCompletedExercises(new Set(completedKeys));
            }
        } catch (e) {
            console.error("Exception fetching completed exercises:", e);
            setProgressError("Could not load practice progress due to a network or application error.");
            setCompletedExercises(new Set());
        }
    };
    
    fetchCompletedExercises();
    setView('dashboard');
    setResults(null);
  }, [userId]);

  const handleTestComplete = useCallback(async (stats: TestStats) => {
    setResults(stats);
    setProgressError(null);

    if (activeTestType && activeTestType !== 'final_exam' && !completedExercises.has(activeTestType)) {
      try {
        const { error } = await supabase
          .from('completed_exercises')
          .insert([{ user_id: userId, exercise_key: activeTestType }]);
        
        if (error) {
          console.error('Error saving exercise completion:', error.message, error);
          setProgressError("Could not save your progress. The exercise might not be marked as complete.");
        } else {
          setCompletedExercises(prev => new Set(prev).add(activeTestType));
        }
      } catch (e) {
        console.error('Exception saving exercise completion:', e);
        setProgressError("Could not save your progress due to a network or application error.");
      }
    }
  }, [activeTestType, userId, completedExercises]);

  const prepareTest = useCallback((testType: ActiveTestType) => {
    setResults(null);
    setIsResultsSubmitted(false);
    setSaveError(null);
    setActiveTestType(testType);
    setTypingTestKey(prevKey => prevKey + 1);
    
    let words: string[] = [];
    let duration = 60;
    let isAccuracy = false;
    
    switch (testType) {
      case 'warmup_home_row':
        words = getRandomPhrase(WARMUP_HOME_ROW).split(' ');
        duration = 60;
        break;
      case 'warmup_alphabet':
        words = getRandomPhrase(WARMUP_ALPHABET).split(' ');
        duration = 90;
        break;
      case 'basic_simple_sentences':
        words = getRandomPhrase(BASIC_SIMPLE_SENTENCES).split(' ');
        duration = 60;
        break;
      case 'basic_common_words':
        words = generateRandomWords(WORDS_TO_GENERATE);
        duration = 60;
        break;
      case 'intermediate_complex_sentences':
        words = getRandomPhrase(INTERMEDIATE_COMPLEX_SENTENCES).split(' ');
        duration = 90;
        break;
      case 'intermediate_paragraph':
        words = INTERMEDIATE_PARAGRAPH[0].split(' ');
        duration = 120;
        break;
      case 'advanced_technical_vocab':
        words = getRandomPhrase(ADVANCED_TECHNICAL_VOCAB).split(' ');
        duration = 90;
        break;
      case 'advanced_special_chars':
        words = getRandomPhrase(ADVANCED_SPECIAL_CHARS).split(' ');
        duration = 90;
        break;
      case 'drill_timed_1_min':
        words = generateRandomWords(WORDS_TO_GENERATE);
        duration = 60;
        break;
      case 'drill_timed_3_min':
        words = generateRandomWords(WORDS_TO_GENERATE * 3);
        duration = 180;
        break;
      case 'drill_accuracy_challenge':
        words = ACCURACY_CHALLENGE_TEXT[0].split(' ');
        duration = 300; // Ample time, ends on error
        isAccuracy = true;
        break;
      case 'final_exam':
        words = generateRandomWords(WORDS_TO_GENERATE, true);
        duration = FINAL_EXAM_DURATION;
        break;
    }
    
    setWordsToDisplay(words);
    setCurrentTestDuration(duration);
    setIsAccuracyChallenge(isAccuracy);
    setView('test');
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
        console.error('Error saving test results:', error.message, error);
        
        let feedbackMessage = 'An issue occurred.';
        if (typeof error.message === 'string' && error.message.trim() !== '') {
          feedbackMessage = error.message;
        }
        
        setSaveError(`Failed to save results: ${feedbackMessage}. Ensure 'test_results' table and RLS are configured correctly.`);
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
  
  const ProgressErrorDisplay: React.FC = () => progressError ? (
    <div className="w-full max-w-3xl mx-auto my-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded-lg text-center font-sans shadow-sm">
      <p role="alert" className="text-sm font-medium">{progressError}</p>
    </div>
  ) : null;

  const renderDashboard = () => {
    const totalPracticeExercises = EXERCISES_DATA.flatMap(cat => cat.items).length;
    const completedCount = completedExercises.size;
    const progressPercentage = totalPracticeExercises > 0 ? (completedCount / totalPracticeExercises) * 100 : 0;
    const areAllPracticeExercisesCompleted = completedCount >= totalPracticeExercises;

    return (
      <div className="w-full max-w-xl mx-auto mt-2 p-8 bg-lifewood-white rounded-lg shadow-xl border border-lifewood-dark-serpent border-opacity-10">
        <h2 className="text-3xl font-bold text-lifewood-castleton-green mb-8 text-center font-sans">Dashboard</h2>
        
        <ProgressErrorDisplay />

        <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
                <h3 id="progress-label" className="text-lg font-semibold text-lifewood-dark-serpent font-sans">Practice Progress</h3>
                <span className="text-sm font-medium text-lifewood-castleton-green font-sans">{`${completedCount} / ${totalPracticeExercises}`}</span>
            </div>
            <div className="w-full bg-lifewood-sea-salt rounded-full h-4 border border-lifewood-dark-serpent border-opacity-10 shadow-inner">
                <div
                    className="bg-lifewood-saffaron h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-labelledby="progress-label"
                ></div>
            </div>
             <p className="text-right text-xs text-lifewood-dark-serpent opacity-80 mt-1 font-mono">{progressPercentage.toFixed(0)}% Complete</p>
        </div>

        <div className="space-y-6">
          <button
            onClick={() => setView('exercise_selection')}
            className="w-full px-6 py-4 bg-lifewood-saffaron text-lifewood-dark-serpent font-semibold rounded-lg hover:bg-lifewood-earth-yellow transition-colors text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-lifewood-saffaron focus:ring-offset-2 focus:ring-offset-lifewood-white font-sans"
          >
            Practice Exercises
          </button>
          <div className="relative group">
            <button
              onClick={() => prepareTest('final_exam')}
              disabled={!areAllPracticeExercisesCompleted}
              className={`w-full px-6 py-4 flex items-center justify-center text-lg font-semibold rounded-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-lifewood-white font-sans ${
                  !areAllPracticeExercisesCompleted
                  ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                  : 'bg-lifewood-castleton-green text-lifewood-paper hover:bg-opacity-80 focus:ring-lifewood-castleton-green'
              }`}
              aria-describedby={!areAllPracticeExercisesCompleted ? 'final-exam-tooltip' : undefined}
            >
              {!areAllPracticeExercisesCompleted && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
              Start Final Exam (1 min)
            </button>
            {!areAllPracticeExercisesCompleted && (
                <div id="final-exam-tooltip" role="tooltip" className="absolute bottom-full mb-2 w-max max-w-full left-1/2 -translate-x-1/2 px-3 py-1.5 bg-lifewood-dark-serpent text-lifewood-paper text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Complete all practice exercises to unlock.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderExerciseSelection = () => (
    <div className="w-full max-w-3xl mx-auto mt-2 p-8 bg-lifewood-white rounded-lg shadow-xl border border-lifewood-dark-serpent border-opacity-10">
      <h2 className="text-3xl font-bold text-lifewood-castleton-green mb-8 text-center font-sans">Choose Your Exercise</h2>
      
      <ProgressErrorDisplay />
      
      {EXERCISES_DATA.map(({ category, items }) => (
        <div key={category} className="mb-8 last:mb-2">
          <h3 className="text-xl font-semibold text-lifewood-dark-serpent mb-4 border-b-2 border-lifewood-saffaron pb-2">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(exercise => {
              const isCompleted = completedExercises.has(exercise.key);
              return (
              <button
                key={exercise.key}
                onClick={() => prepareTest(exercise.key)}
                className={`p-4 rounded-lg text-left transition-all duration-200 border border-lifewood-dark-serpent border-opacity-10 shadow-sm hover:shadow-md ${
                  isCompleted 
                    ? 'bg-lifewood-castleton-green bg-opacity-10 hover:bg-lifewood-castleton-green hover:bg-opacity-20' 
                    : 'bg-lifewood-sea-salt hover:bg-lifewood-earth-yellow hover:bg-opacity-40'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-lifewood-castleton-green pr-2">{exercise.title}</h4>
                  {isCompleted && (
                    <span className="text-lifewood-castleton-green font-bold text-xl" title="Completed">✓</span>
                  )}
                </div>
                <p className="text-sm text-lifewood-dark-serpent opacity-80 mt-1">{exercise.description}</p>
              </button>
            )})}
          </div>
        </div>
      ))}
      <div className="text-center mt-8">
        <button
          onClick={() => setView('dashboard')}
          className="px-6 py-3 bg-transparent text-lifewood-dark-serpent font-semibold rounded-lg hover:bg-lifewood-sea-salt transition-colors text-md border border-lifewood-dark-serpent border-opacity-30"
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
        return 'Select a practice exercise to improve your skills.';
      case 'test':
        const exercise = EXERCISES_DATA.flatMap(c => c.items).find(i => i.key === activeTestType);
        if (activeTestType === 'final_exam') return 'Final Exam: Test your typing speed and accuracy (1 min test).';
        return exercise ? exercise.title : 'Loading test...';
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
                  isAccuracyChallenge={isAccuracyChallenge}
                />
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setResults(null);
                      setView(activeTestType === 'final_exam' ? 'dashboard' : 'exercise_selection');
                    }}
                    className="px-6 py-3 bg-lifewood-saffaron text-lifewood-dark-serpent font-semibold rounded-lg hover:bg-lifewood-earth-yellow transition-colors text-md shadow-sm"
                  >
                    {activeTestType === 'final_exam' ? 'Back to Dashboard' : 'Back to Exercises'}
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
                isAccuracyChallenge={isAccuracyChallenge}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
