
export enum TestStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  FINISHED = 'finished',
}

export interface CharDisplayState {
  char: string;
  status: 'pending' | 'correct' | 'incorrect' | 'extra' | 'missed';
}

export interface TestStats {
  wpm: number;
  accuracy: number; // Word-based accuracy: (Correct Words / Words Processed) * 100
  trueAccuracy: number; // Character-based accuracy
  timeElapsed: number;
  correctWords: number; 
  // incorrectWords is removed
  // skippedWords is removed
}

// New type to distinguish between different tests
export type ActiveTestType = 'exercise1' | 'exercise2' | 'final_exam' | null;