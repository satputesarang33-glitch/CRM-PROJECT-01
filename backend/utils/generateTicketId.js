/**
 * Generate human-readable unique Support Ticket identifiers
 * Format: TICK-XXXXXX (e.g., TICK-482910)
 */
export const generateTicketId = () => {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `TICK-${randomSuffix}`;
};
