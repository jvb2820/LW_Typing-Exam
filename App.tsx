



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

  useEffect(() => {
    setView('dashboard');
    setResults(null);
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
    <div className="w-full max-w-3xl mx-auto mt-2 p-8 bg-lifewood-white rounded-lg shadow-xl border border-lifewood-dark-serpent border-opacity-10">
      <h2 className="text-3xl font-bold text-lifewood-castleton-green mb-8 text-center font-sans">Choose Your Exercise</h2>
      {EXERCISES_DATA.map(({ category, items }) => (
        <div key={category} className="mb-8 last:mb-2">
          <h3 className="text-xl font-semibold text-lifewood-dark-serpent mb-4 border-b-2 border-lifewood-saffaron pb-2">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(exercise => (
              <button
                key={exercise.key}
                onClick={() => prepareTest(exercise.key)}
                className="p-4 bg-lifewood-sea-salt rounded-lg text-left hover:bg-lifewood-earth-yellow hover:bg-opacity-40 transition-all duration-200 border border-lifewood-dark-serpent border-opacity-10 shadow-sm hover:shadow-md"
              >
                <h4 className="font-bold text-lifewood-castleton-green">{exercise.title}</h4>
                <p className="text-sm text-lifewood-dark-serpent opacity-80 mt-1">{exercise.description}</p>
              </button>
            ))}
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