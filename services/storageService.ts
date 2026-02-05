import { User } from '../types';

const DB_KEY = 'ecorank_db_v1';

/**
 * Loads users from the local browser database.
 */
export const getStoredUsers = (): User[] => {
  try {
    const serializedData = localStorage.getItem(DB_KEY);
    if (!serializedData) {
      return [];
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error("Failed to load database:", error);
    return [];
  }
};

/**
 * Saves the entire list of users to the local browser database.
 */
export const saveStoredUsers = (users: User[]): void => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save to database:", error);
  }
};

/**
 * Helper to clear database (useful for testing)
 */
export const clearDatabase = (): void => {
  localStorage.removeItem(DB_KEY);
};
