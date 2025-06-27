import React from 'react';

interface SettingsBarProps {
  currentDuration: number;
  onDurationChange: (duration: number) => void;
  disabled: boolean;
}

const DURATIONS = [15, 30, 60, 120];

const SettingsBar: React.FC<SettingsBarProps> = ({ currentDuration, onDurationChange, disabled }) => {
  return (
    <div className="flex justify-center items-center space-x-2 sm:space-x-4 my-6">
      <span className="text-gray-400 text-sm sm:text-base">Time:</span>
      {DURATIONS.map((duration) => (
        <button
          key={duration}
          onClick={() => onDurationChange(duration)}
          disabled={disabled}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-medium transition-colors
            ${currentDuration === duration 
              ? 'bg-yellow-400 text-gray-900' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {duration}s
        </button>
      ))}
    </div>
  );
};

export default SettingsBar;
