

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
export type ExerciseKey =
  | 'warmup_home_row'
  | 'warmup_alphabet'
  | 'basic_simple_sentences'
  | 'basic_common_words'
  | 'intermediate_complex_sentences'
  | 'intermediate_paragraph'
  | 'advanced_technical_vocab'
  | 'advanced_special_chars'
  | 'drill_timed_1_min'
  | 'drill_timed_3_min'
  | 'drill_accuracy_challenge'
  | 'final_exam';

export type ActiveTestType = ExerciseKey | null;