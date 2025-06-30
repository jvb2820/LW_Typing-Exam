

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TestStatus, CharDisplayState, TestStats } from '../types';
import Keyboard from './Keyboard';

interface TypingTestProps {
  initialWords: string[];
  testDurationSeconds: number;
  onTestComplete: (stats: TestStats) => void;
  isAccuracyChallenge?: boolean;
}

const TypingTest: React.FC<TypingTestProps> = ({ 
  initialWords,
  testDurationSeconds, 
  onTestComplete,
  isAccuracyChallenge = false,
}) => {
  const [words, setWords] = useState<string[]>(initialWords); 
  const [displayableWords, setDisplayableWords] = useState<CharDisplayState[][]>([]);
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentTypedValue, setCurrentTypedValue] = useState(""); 
  
  const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.IDLE);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [internalTotalCharCorrect, setInternalTotalCharCorrect] = useState(0);
  const [internalTotalCharIncorrect, setInternalTotalCharIncorrect] = useState(0);
  const [internalTotalCharExtra, setInternalTotalCharExtra] = useState(0);

  const [totalCorrectWords, setTotalCorrectWords] = useState(0);
  const [physicalKeyPressed, setPhysicalKeyPressed] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);

  const resetTestStateInternal = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    setWords(initialWords); 
    
    const initialDisplay: CharDisplayState[][] = initialWords.map(word => 
      word.split('').map(char => ({ char, status: 'pending' as 'pending' }))
    );
    setDisplayableWords(initialDisplay);

    setCurrentWordIndex(0);
    setCurrentTypedValue("");
    setTestStatus(TestStatus.IDLE);
    setStartTime(null);
    setElapsedTime(0);
    
    setInternalTotalCharCorrect(0);
    setInternalTotalCharIncorrect(0);
    setInternalTotalCharExtra(0);

    setTotalCorrectWords(0);
    inputRef.current?.focus();
  }, [initialWords]);

  useEffect(() => {
    resetTestStateInternal();
  }, [initialWords, testDurationSeconds, resetTestStateInternal]); 

  useEffect(() => {
    if (testStatus === TestStatus.RUNNING && startTime) {
      timerIntervalRef.current = window.setInterval(() => {
        const newElapsedTime = (Date.now() - startTime) / 1000;
        setElapsedTime(newElapsedTime);
        if (newElapsedTime >= testDurationSeconds) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setTestStatus(TestStatus.FINISHED);
        }
      }, 100);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [testStatus, startTime, testDurationSeconds]);

  useEffect(() => {
    if (testStatus === TestStatus.FINISHED) {
      let finalElapsedTime = elapsedTime > testDurationSeconds ? testDurationSeconds : elapsedTime;

      let finalTotalCharCorrect = internalTotalCharCorrect;
      let finalTotalCharIncorrect = internalTotalCharIncorrect;
      let finalTotalCharExtra = internalTotalCharExtra;
      let finalCorrectWordsCount = totalCorrectWords;
      let wordsProcessedCount = currentWordIndex;

      if (currentWordIndex < words.length && currentTypedValue.length > 0) {
        const targetWord = words[currentWordIndex];
        let isPerfectActiveWord = true;
        let activeWordCorrectChars = 0;
        let activeWordIncorrectChars = 0;
        let activeWordExtraChars = 0;

        for (let i = 0; i < currentTypedValue.length; i++) {
          if (i < targetWord.length) {
            if (currentTypedValue[i] === targetWord[i]) {
              activeWordCorrectChars++;
            } else {
              activeWordIncorrectChars++;
              isPerfectActiveWord = false;
            }
          } else {
            activeWordExtraChars++;
            isPerfectActiveWord = false; 
          }
        }
        if (currentTypedValue.length < targetWord.length) {
          isPerfectActiveWord = false;
        }
        
        finalTotalCharCorrect += activeWordCorrectChars;
        finalTotalCharIncorrect += activeWordIncorrectChars;
        finalTotalCharExtra += activeWordExtraChars;
        
        if (isPerfectActiveWord && targetWord.length > 0) finalCorrectWordsCount++;
        
        wordsProcessedCount = currentWordIndex + 1;
      } else if (currentWordIndex === words.length && currentTypedValue.length === 0) {
        wordsProcessedCount = words.length;
      }
      
      const wpm = (finalTotalCharCorrect / 5) / (Math.max(finalElapsedTime, 1) / 60);
      
      const wordAccuracy = wordsProcessedCount > 0 
        ? (finalCorrectWordsCount / wordsProcessedCount) * 100 
        : (initialWords.length === 0 ? 100 : 0);
      
      const totalCharsForTrueAccuracy = finalTotalCharCorrect + finalTotalCharIncorrect + finalTotalCharExtra;
      const trueAccuracy = totalCharsForTrueAccuracy > 0 
        ? (finalTotalCharCorrect / totalCharsForTrueAccuracy) * 100 
        : (initialWords.length === 0 && finalTotalCharCorrect === 0 ? 100 : 0) ;

      onTestComplete({
        wpm: Math.max(0, wpm || 0),
        accuracy: Math.max(0, Math.min(100, wordAccuracy || 0)),
        trueAccuracy: Math.max(0, Math.min(100, trueAccuracy || 0)),
        timeElapsed: finalElapsedTime,
        correctWords: finalCorrectWordsCount,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testStatus]);


  useEffect(() => {
    const activeWordEl = wordsContainerRef.current?.querySelector(`[data-word-idx="${currentWordIndex}"]`);
    if (activeWordEl && wordsContainerRef.current) {
      const wordRect = activeWordEl.getBoundingClientRect();
      const containerRect = wordsContainerRef.current.getBoundingClientRect();
      if (wordRect.top < containerRect.top || wordRect.bottom > containerRect.bottom) {
         activeWordEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentWordIndex]);

  useEffect(() => {
    if (words.length === 0 || currentWordIndex >= words.length || !displayableWords[currentWordIndex]) {
      return;
    }

    const newDisplayableWords = displayableWords.map(wordArr => wordArr.map(charState => ({...charState})));
    const targetWord = words[currentWordIndex];
    const newCurrentWordDisplay: CharDisplayState[] = [];

    for (let i = 0; i < Math.max(targetWord.length, currentTypedValue.length); i++) {
      const charInTarget = targetWord[i];
      const charTyped = currentTypedValue[i];

      if (i < currentTypedValue.length) {
        if (i < targetWord.length) {
          newCurrentWordDisplay.push({
            char: charInTarget,
            status: charTyped === charInTarget ? 'correct' as 'correct' : 'incorrect' as 'incorrect',
          });
        } else {
          newCurrentWordDisplay.push({ char: charTyped, status: 'extra' as 'extra' });
        }
      } else {
        newCurrentWordDisplay.push({ char: charInTarget, status: 'pending' as 'pending' });
      }
    }
    if(newDisplayableWords[currentWordIndex]) {
        newDisplayableWords[currentWordIndex] = newCurrentWordDisplay;
        setDisplayableWords(newDisplayableWords);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTypedValue, currentWordIndex, words]); 

  const processInput = (key: string) => {
    if (testStatus === TestStatus.FINISHED) {
      return;
    }

    const shouldStartTest = testStatus === TestStatus.IDLE && key.length === 1 && key !== ' ';
    if (shouldStartTest) {
      setTestStatus(TestStatus.RUNNING);
      setStartTime(Date.now());
    }
    
    if (testStatus !== TestStatus.RUNNING && !shouldStartTest) return;

    if (key === 'Backspace') {
      if (isAccuracyChallenge) return; // Disallow backspace in accuracy challenge
      setCurrentTypedValue(prev => prev.slice(0, -1));
    } else if (key === ' ') {
      if (currentTypedValue.length > 0 || (words[currentWordIndex] && words[currentWordIndex].length === 0)) {
        const targetWord = words[currentWordIndex];
        if (!targetWord && targetWord !== "") return; 

        if (isAccuracyChallenge && currentTypedValue !== targetWord) {
          setTestStatus(TestStatus.FINISHED);
          return;
        }

        let wordCharCorrect = 0;
        let wordCharIncorrect = 0;
        let wordCharExtra = 0;
        let isPerfectWord = true;

        for (let i = 0; i < currentTypedValue.length; i++) {
            if (i < targetWord.length) {
                if (currentTypedValue[i] === targetWord[i]) {
                    wordCharCorrect++;
                } else {
                    wordCharIncorrect++;
                    isPerfectWord = false;
                }
            } else {
                wordCharExtra++;
                isPerfectWord = false; 
            }
        }
        if (currentTypedValue.length !== targetWord.length) {
             isPerfectWord = false;
        }
         if (targetWord.length === 0 && currentTypedValue.length > 0) isPerfectWord = false;


        const finalWordDisplay: CharDisplayState[] = targetWord.split('').map((char, i) => {
          if (i < currentTypedValue.length) {
            return { char, status: currentTypedValue[i] === char ? 'correct' as 'correct' : 'incorrect' as 'incorrect' };
          }
          return { char, status: 'missed' as 'missed' };
        });

        if (currentTypedValue.length > targetWord.length) { 
          for(let i = targetWord.length; i < currentTypedValue.length; i++) {
            finalWordDisplay.push({char: currentTypedValue[i], status: 'extra' as 'extra'});
          }
        }
        
        setDisplayableWords(prev => {
          const newDisplay = [...prev];
          if (newDisplay[currentWordIndex]) {
            newDisplay[currentWordIndex] = finalWordDisplay;
          }
          return newDisplay;
        });

        setInternalTotalCharCorrect(prev => prev + wordCharCorrect);
        setInternalTotalCharIncorrect(prev => prev + wordCharIncorrect);
        setInternalTotalCharExtra(prev => prev + wordCharExtra);

        if (targetWord.length > 0 || currentTypedValue.length > 0) { 
            if (isPerfectWord) {
                setTotalCorrectWords(prev => prev + 1);
            }
        }

        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setCurrentTypedValue("");
        } else { 
          setCurrentTypedValue(""); 
          setCurrentWordIndex(prev => prev + 1); 
          setTestStatus(TestStatus.FINISHED);
        }
      }
    } else if (key.length === 1) { 
        if (isAccuracyChallenge) {
          const targetWord = words[currentWordIndex];
          const nextCharIndex = currentTypedValue.length;
          if (nextCharIndex >= targetWord.length || key !== targetWord[nextCharIndex]) {
            // Add the wrong character so it's reflected in the final stats, then end.
            setCurrentTypedValue(prev => prev + key);
            setTestStatus(TestStatus.FINISHED);
            return;
          }
        }
      const currentTargetWordLength = words[currentWordIndex] ? words[currentWordIndex].length : 0;
      if (currentTypedValue.length < currentTargetWordLength + 10) { 
         setCurrentTypedValue(prev => prev + key);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') event.preventDefault();

    setPhysicalKeyPressed(event.key);
    setTimeout(() => setPhysicalKeyPressed(null), 150);
    
    if (event.metaKey || event.ctrlKey) return;

    if (event.key.length === 1 || event.key === 'Backspace') {
        event.preventDefault();
        processInput(event.key);
    }
  };

  const handleVirtualKeyPress = (key: string) => {
    processInput(key);
    inputRef.current?.focus();
  };


  const getCharClass = (status: CharDisplayState['status']) => {
    switch (status) {
      case 'correct': return 'text-lifewood-castleton-green';
      case 'incorrect': return 'text-red-600'; 
      case 'extra': return 'text-lifewood-saffaron underline';
      case 'missed': return 'text-lifewood-dark-serpent opacity-50 bg-red-200';
      case 'pending': default: return 'text-lifewood-dark-serpent opacity-60';
    }
  };

  const focusInput = () => inputRef.current?.focus();

  if (words.length === 0 && initialWords.length === 0 && testStatus === TestStatus.IDLE) { 
    return <div className="text-center p-8 text-lifewood-dark-serpent opacity-70">Loading test...</div>;
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="p-4 rounded-lg bg-lifewood-white shadow-md border border-lifewood-dark-serpent border-opacity-10" onClick={focusInput}>
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute w-0 h-0"
          onKeyDown={handleKeyDown}
          value={""} 
          onChange={() => {}} 
          autoFocus
          onBlur={() => {if (testStatus !== TestStatus.FINISHED) inputRef.current?.focus();}}
          disabled={testStatus === TestStatus.FINISHED}
        />

        <div className="text-2xl text-center mb-4 text-lifewood-castleton-green font-mono font-semibold min-h-[2rem]">
          {testStatus === TestStatus.RUNNING ? `${elapsedTime.toFixed(1)}s` : `${testDurationSeconds.toFixed(1)}s`}
        </div>

        <div 
          ref={wordsContainerRef}
          className="text-2xl md:text-3xl leading-relaxed font-mono p-4 bg-lifewood-sea-salt rounded-lg h-48 overflow-y-auto custom-scrollbar relative select-none"
          style={{ filter: testStatus === TestStatus.FINISHED ? 'blur(3px)' : 'none' }}
        >
          {displayableWords.map((wordCharStates, wordIdx) => (
            <span key={wordIdx} className="inline-block mr-3 mb-2" data-word-idx={wordIdx}>
              {wordCharStates.map(({ char, status }, charIdx) => (
                <React.Fragment key={charIdx}>
                  {currentWordIndex === wordIdx && charIdx === currentTypedValue.length && <span className="caret"></span>}
                  <span className={getCharClass(status)}>{char === ' ' ? '\u00A0' : char}</span>
                </React.Fragment>
              ))}
              {currentWordIndex === wordIdx && currentTypedValue.length >= wordCharStates.length && <span className="caret"></span>}
            </span>
          ))}
        </div>
      </div>
      <Keyboard 
        onKeyPress={handleVirtualKeyPress}
        disabled={testStatus === TestStatus.FINISHED || isAccuracyChallenge}
        physicalKeyPressed={physicalKeyPressed}
      />
    </div>
  );
};

export default TypingTest;