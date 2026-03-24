
export interface User {
  id: string;
  name: string;
  totalPoints: number;
  actions: EcoAction[];
  currentStreak: number;
  lastLogDate: string; // YYYY-MM-DD
  hasCompletedTutorial?: boolean;
  hasCompletedModTutorial?: boolean;
  reminders?: Reminder[]; // New field for reminders
  section?: string; // e.g. "10b1", "11b1"
  cheatingFlags?: number;
  rejectionCount?: number;
  dailyLimit?: number;
  role?: 'student' | 'moderator' | 'admin' | 'beta';
  pin?: string;
  bio?: string;
  pendingBio?: string;
  bioStatus?: 'approved' | 'pending' | 'rejected';
  nickname?: string;
  pendingNickname?: string;
  nicknameStatus?: 'approved' | 'pending' | 'rejected';
  realName?: string;
  profilePicture?: string;
  pendingProfilePicture?: string;
  profilePictureStatus?: 'approved' | 'pending' | 'rejected';
  securityQuestion?: string;
  securityAnswer?: string;
  pendingPin?: string;
  pinResetStatus?: 'approved' | 'pending' | 'rejected';
  borderType?: 'none' | 'cat' | 'snake' | 'pixel-cat-gray' | 'pixel-cat-white' | 'pixel-snake';
  createdBy?: string; // User ID of the creator
}

export interface Reminder {
  id: string;
  title: string;
  time: string; // HH:MM (24h format)
  isEnabled: boolean;
}

export interface EcoAction {
  id: string;
  description: string;
  points: number;
  timestamp: number;
  aiComment: string;
  confidenceScore?: number;
  status?: 'approved' | 'rejected' | 'pending_review';
  assignedTo?: string; // User ID of moderator or admin
  videoData?: string; // base64 video data
  mimeType?: string;
  proposedPoints?: number;
}

export interface EcoAnalysisResult {
  points: number;
  comment: string;
  category: string;
  isVerified: boolean;
  confidenceScore: number;
}

export enum AppView {
  HOME = 'HOME',
  LEADERBOARD = 'LEADERBOARD',
  LOG_ACTION = 'LOG_ACTION',
  REWARDS = 'REWARDS',
  PROTOCOLS = 'PROTOCOLS',
  ABOUT = 'ABOUT',
  ANALYTICS = 'ANALYTICS',
  FAQ = 'FAQ',
  PROFILE = 'PROFILE',
  MODERATION = 'MODERATION'
}

export type Language = 'en' | 'ar';
