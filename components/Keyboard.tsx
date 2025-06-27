
import React, { useState } from 'react';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  disabled: boolean;
  physicalKeyPressed: string | null;
}

const KEY_LAYOUT = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ['Space']
];

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, disabled, physicalKeyPressed }) => {
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handleKeyPress = (key: string) => {
    if (disabled) return;

    if (key === 'Shift') {
      setIsShiftActive(prev => !prev);
      return;
    }
    
    let keyToSend = key;
    if (key === 'Space') {
      keyToSend = ' ';
    } else if (isShiftActive && key.length === 1) {
      keyToSend = key.toUpperCase();
    }
    
    onKeyPress(keyToSend);
    
    // Deactivate shift after a letter is pressed
    if (isShiftActive && key !== 'Shift' && key.length === 1) {
      setIsShiftActive(false);
    }
    
    // Visual feedback for pressed key
    setPressedKey(keyToSend);
    setTimeout(() => setPressedKey(null), 150);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 p-2 sm:p-3 bg-lifewood-white rounded-lg shadow-md border border-lifewood-dark-serpent border-opacity-10" aria-label="On-screen keyboard">
      <div className="space-y-1 sm:space-y-2">
        {KEY_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center items-stretch space-x-1 sm:space-x-2">
            {row.map(key => {
              const displayKey = isShiftActive && key.length === 1 ? key.toUpperCase() : key;
              
              // For click feedback
              const keyIdentifierForClick = isShiftActive && key.length === 1 ? key.toUpperCase() : (key === 'Space' ? ' ' : key);
              const isClickPressed = pressedKey === keyIdentifierForClick;

              // For physical keyboard feedback
              let isPhysicalMatch = false;
              if (physicalKeyPressed) {
                  if (key === 'Space' && physicalKeyPressed === ' ') {
                      isPhysicalMatch = true;
                  } else if (key.length === 1 && physicalKeyPressed.length === 1 && key.toLowerCase() === physicalKeyPressed.toLowerCase()) {
                      isPhysicalMatch = true;
                  } else if (key.length > 1 && key === physicalKeyPressed) { // Handles 'Shift', 'Backspace'
                      isPhysicalMatch = true;
                  }
              }

              const isHighlighted = isClickPressed || isPhysicalMatch;
              
              let buttonClass = `
                h-11 sm:h-12 rounded-md font-mono text-sm sm:text-base font-medium transition-all duration-100 flex items-center justify-center
                border-b-4 border-lifewood-dark-serpent border-opacity-20
                focus:outline-none focus:ring-2 focus:ring-lifewood-saffaron focus:z-10
              `;

              if (key === 'Space') {
                buttonClass += ' flex-grow max-w-xs ';
              } else if (key === 'Shift' || key === 'Backspace') {
                buttonClass += ' flex-[1.75] text-xs sm:text-sm ';
              } else {
                buttonClass += ' flex-1 ';
              }

              if (key === 'Shift' || key === 'Backspace') {
                 buttonClass += ' bg-gray-200 hover:bg-gray-300 text-lifewood-dark-serpent ';
              } else {
                 buttonClass += ' bg-lifewood-sea-salt hover:bg-gray-200 text-lifewood-dark-serpent ';
              }
              
              if (isShiftActive && key === 'Shift') {
                buttonClass += ' bg-lifewood-saffaron !text-lifewood-dark-serpent border-lifewood-earth-yellow';
              }
              
              if (isHighlighted) {
                buttonClass += ' transform scale-95 !bg-lifewood-saffaron border-b-2';
              }

              if (disabled) {
                buttonClass += ' opacity-60 cursor-not-allowed hover:bg-gray-200';
              }

              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  disabled={disabled}
                  className={buttonClass}
                  aria-label={key === ' ' ? 'Spacebar' : key}
                >
                  {key === 'Backspace' ? '⌫' : displayKey}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Keyboard;
