/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Based on the SuperMemo SM-2 algorithm.
 * Quality ratings: 0-5
 *   0: Complete blackout
 *   1: Incorrect, but remembered upon seeing answer
 *   2: Incorrect, but answer seemed easy to recall
 *   3: Correct with serious difficulty
 *   4: Correct with some hesitation
 *   5: Perfect response
 *
 * Simplified to 4 buttons for UX:
 *   Again = 0, Hard = 2, Good = 4, Easy = 5
 */

export type SRSQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSState {
  easeFactor: number;
  interval: number; // in days
  repetitions: number;
}

export interface SRSResult extends SRSState {
  nextReviewDate: Date;
}

export function calculateNextReview(
  quality: SRSQuality,
  currentState: SRSState
): SRSResult {
  let { easeFactor, interval, repetitions } = currentState;

  if (quality < 3) {
    // Failed review - reset
    repetitions = 0;
    interval = 1;
  } else {
    // Successful review
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Minimum ease factor is 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    nextReviewDate,
  };
}

/**
 * Map user-friendly button labels to SM-2 quality values
 */
export const qualityMap = {
  again: 0 as SRSQuality,
  hard: 2 as SRSQuality,
  good: 4 as SRSQuality,
  easy: 5 as SRSQuality,
};

/**
 * Default initial SRS state for a new word
 */
export const defaultSRSState: SRSState = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
};
