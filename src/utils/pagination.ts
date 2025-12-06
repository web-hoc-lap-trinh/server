/**
 * Utility functions for generating pagination parameters.
 * Assumes 1-based indexing for page numbers.
 */

interface PaginationOptions {
  skip: number; // OFFSET in SQL
  take: number; // LIMIT in SQL
}

/**
 * Calculates SQL LIMIT and OFFSET (skip/take) values.
 * @param page Current page number (default 1).
 * @param limit Items per page (default 10).
 * @returns { skip, take }
 */
export const getPaginationOptions = (
  page: number = 1,
  limit: number = 10
): PaginationOptions => {
  const finalLimit = Math.max(1, Math.min(100, limit));
  const finalPage = Math.max(1, page);

  const skip = (finalPage - 1) * finalLimit;
  const take = finalLimit;

  return { skip, take };
};