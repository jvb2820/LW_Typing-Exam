
import React from 'react';
import { TestStats } from '../types';

interface StatsDisplayProps {
  stats: TestStats; 
  onRestart: () => void;
  onSubmitResults: () => void;
  isSavingResults: boolean;
  isResultsSubmitted: boolean;
  isFinalExam: boolean;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ 
  stats, 
  onRestart,
  onSubmitResults,
  isSavingResults,
  isResultsSubmitted,
  isFinalExam
}) => {
  const isPass = isFinalExam && stats.wpm >= 25 && stats.accuracy >= 90 && stats.trueAccuracy >= 85;

  return (
    <div className="mt-8 p-6 sm:p-8 bg-lifewood-white rounded-lg shadow-xl text-center border border-lifewood-dark-serpent border-opacity-10 font-sans">
      <h2 className="text-3xl font-bold text-lifewood-castleton-green mb-8">Test Results</h2>
      
      {isFinalExam && (
        <div className={`p-4 rounded-lg mb-6 ${isPass ? 'bg-lifewood-castleton-green bg-opacity-10 border-lifewood-castleton-green' : 'bg-red-100 border-red-500'} border`}>
          <p className={`text-sm ${isPass ? 'text-lifewood-castleton-green' : 'text-red-700'} opacity-80`}>Overall Status</p>
          <p className={`text-4xl font-bold ${isPass ? 'text-lifewood-castleton-green' : 'text-red-600'}`}>
            {isPass ? 'Pass' : 'Fail'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-3 bg-lifewood-sea-salt rounded-lg border border-lifewood-dark-serpent border-opacity-5">
          <p className="text-xs text-lifewood-dark-serpent opacity-70">WPM</p>
          <p className="text-3xl font-bold text-lifewood-castleton-green">{stats.wpm.toFixed(0)}</p>
        </div>
        <div className="p-3 bg-lifewood-sea-salt rounded-lg border border-lifewood-dark-serpent border-opacity-5">
          <p className="text-xs text-lifewood-dark-serpent opacity-70">Accuracy (Word)</p>
          <p className="text-3xl font-bold text-blue-600">{stats.accuracy.toFixed(1)}%</p>
        </div>
        <div className="p-3 bg-lifewood-sea-salt rounded-lg border border-lifewood-dark-serpent border-opacity-5">
          <p className="text-xs text-lifewood-dark-serpent opacity-70">True Accuracy (Char)</p>
          <p className="text-3xl font-bold text-purple-600">{stats.trueAccuracy.toFixed(1)}%</p>
        </div>
        <div className="p-3 bg-lifewood-sea-salt rounded-lg border border-lifewood-dark-serpent border-opacity-5">
          <p className="text-xs text-lifewood-dark-serpent opacity-70">Time Elapsed</p>
          <p className="text-3xl font-bold text-teal-600">{stats.timeElapsed.toFixed(1)}s</p>
        </div>
      </div>

      <div className="text-lifewood-dark-serpent opacity-90 mb-8 space-y-1 p-4 bg-lifewood-sea-salt rounded-lg border border-lifewood-dark-serpent border-opacity-5">
        <div>
            <h3 className="text-lg font-semibold text-lifewood-dark-serpent mb-1">Word Performance:</h3>
            <p>Correct Words: <span className="text-lifewood-castleton-green font-medium">{stats.correctWords}</span></p>
            {/* Incorrect Words and Skipped Words display removed */}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        {isFinalExam && (
          <button
            onClick={onSubmitResults}
            disabled={isSavingResults || isResultsSubmitted}
            className={`px-8 py-3 font-semibold rounded-lg transition-colors text-lg
              ${isResultsSubmitted 
                ? 'bg-lifewood-castleton-green text-lifewood-paper cursor-not-allowed' 
                : isSavingResults 
                  ? 'bg-lifewood-dark-serpent bg-opacity-30 text-lifewood-dark-serpent opacity-70 cursor-wait' 
                  : 'bg-lifewood-castleton-green hover:bg-opacity-80 text-lifewood-paper'}
            `}
          >
            {isResultsSubmitted ? 'Submitted ✓' : isSavingResults ? 'Submitting...' : 'Submit Final Exam Score'}
          </button>
        )}
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-lifewood-saffaron text-lifewood-dark-serpent font-semibold rounded-lg hover:bg-lifewood-earth-yellow transition-colors text-lg"
        >
          {isFinalExam && isPass ? 'Try Another Challenge' : isFinalExam && !isPass ? 'Retake Final Exam' : 'Back to Menu'}
        </button>
      </div>
    </div>
  );
};

export default StatsDisplay;