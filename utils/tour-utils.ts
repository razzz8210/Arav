/**
 * Tour utility functions for managing tour state and behavior
 */

export const TOUR_STORAGE_KEY = 'tour-completed';

export interface TourState {
  userId: string;
  completed: boolean;
  completedAt: string;
  version: string; // For future tour updates
}

export class TourManager {
  private static readonly CURRENT_TOUR_VERSION = '1.0.0';

  /**
   * Check if user has completed the tour
   */
  static hasCompletedTour(userId: string): boolean {
    try {
      const tourData = localStorage.getItem(`${TOUR_STORAGE_KEY}-${userId}`);
      if (!tourData) return false;

      const parsed: TourState = JSON.parse(tourData);
      return parsed.completed && parsed.version === this.CURRENT_TOUR_VERSION;
    } catch {
      return false;
    }
  }

  /**
   * Mark tour as completed for user
   */
  static markTourCompleted(userId: string): void {
    try {
      const tourState: TourState = {
        userId,
        completed: true,
        completedAt: new Date().toISOString(),
        version: this.CURRENT_TOUR_VERSION,
      };
      localStorage.setItem(`${TOUR_STORAGE_KEY}-${userId}`, JSON.stringify(tourState));
    } catch (error) {
      console.error('Failed to save tour completion state:', error);
    }
  }

  /**
   * Reset tour for user (useful for testing or tour updates)
   */
  static resetTour(userId: string): void {
    try {
      localStorage.removeItem(`${TOUR_STORAGE_KEY}-${userId}`);
    } catch (error) {
      console.error('Failed to reset tour state:', error);
    }
  }

  /**
   * Get tour completion data
   */
  static getTourState(userId: string): TourState | null {
    try {
      const tourData = localStorage.getItem(`${TOUR_STORAGE_KEY}-${userId}`);
      return tourData ? JSON.parse(tourData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if tour should auto-start for new users
   */
  static shouldAutoStartTour(userId: string, isFirstLogin: boolean = false): boolean {
    return !this.hasCompletedTour(userId) && isFirstLogin;
  }
}

/**
 * Delay function for tour timing
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if element exists and is visible
 */
export const isElementReady = (selector: string): boolean => {
  const element = document.querySelector(selector);
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

/**
 * Wait for element to be ready
 */
export const waitForElement = async (
  selector: string, 
  timeout: number = 5000
): Promise<boolean> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (isElementReady(selector)) {
      return true;
    }
    await delay(100);
  }
  
  return false;
};