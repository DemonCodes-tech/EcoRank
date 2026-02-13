export interface User {
  id: string;
  name: string;
  totalPoints: number;
  actions: EcoAction[];
  currentStreak: number;
  lastLogDate: string; // YYYY-MM-DD
  hasCompletedTutorial?: boolean;
}

export interface EcoAction {
  id: string;
  description: string;
  points: number;
  timestamp: number;
  aiComment: string;
}

export interface EcoAnalysisResult {
  points: number;
  comment: string;
  category: string;
  isVerified: boolean;
}

export enum AppView {
  HOME = 'HOME',
  LEADERBOARD = 'LEADERBOARD',
  LOG_ACTION = 'LOG_ACTION',
  REWARDS = 'REWARDS'
}

export type Language = 'en' | 'ar';
