export const getLogicalDateStr = (date: Date = new Date()): string => {
  // Shift back by 4 hours to give a grace period until 4 AM
  // This accounts for users logging slightly after midnight
  const logicalDate = new Date(date.getTime() - 4 * 60 * 60 * 1000);
  
  // Use local time instead of UTC to account for time zones
  const year = logicalDate.getFullYear();
  const month = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export const getYesterdayLogicalDateStr = (date: Date = new Date()): string => {
  const logicalDate = new Date(date.getTime() - 4 * 60 * 60 * 1000);
  logicalDate.setDate(logicalDate.getDate() - 1);
  
  const year = logicalDate.getFullYear();
  const month = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
