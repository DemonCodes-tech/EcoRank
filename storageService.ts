import { User } from '../types';

const DB_KEY = 'ecorank_db_v1';
const USERS_API = '/api/users';
const LEADERBOARD_API = '/api/leaderboard';
const ME_API = '/api/auth/me';

/**
 * Checks if the current user is authenticated and returns their data.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(ME_API);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch current user:', error);
  }
  return null;
};

/**
 * Loads the leaderboard data.
 */
export const getLeaderboard = async (): Promise<User[]> => {
  try {
    const response = await fetch(LEADERBOARD_API);
    if (response.ok) {
      const users = await response.json();
      if (Array.isArray(users)) {
        return users;
      }
    }
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
  }
  return [];
};

/**
 * Loads all users (Admin/Moderator only).
 */
export const getStoredUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(USERS_API);
    if (response.ok) {
      const users = await response.json();
      if (Array.isArray(users)) {
        localStorage.setItem(DB_KEY, JSON.stringify(users));
        return users;
      }
    }
  } catch (error) {
    console.warn('API fetch failed, falling back to local storage:', error);
  }

  try {
    const serializedData = localStorage.getItem(DB_KEY);
    return serializedData ? JSON.parse(serializedData) : [];
  } catch (error) {
    console.error("Failed to load local database:", error);
    return [];
  }
};

/**
 * Saves a single user update.
 */
export const saveUserUpdate = async (user: User): Promise<void> => {
  try {
    await fetch(`${USERS_API}/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  } catch (error) {
    console.error('Failed to sync user update with server:', error);
  }
};

/**
 * Saves multiple users (Admin only).
 */
export const saveStoredUsers = async (users: User[]): Promise<void> => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(users));
    await fetch(USERS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users)
    });
  } catch (error) {
    console.error('Failed to sync with server:', error);
  }
};

/**
 * Helper to clear database (useful for testing)
 */
export const clearDatabase = (): void => {
  localStorage.removeItem(DB_KEY);
};
