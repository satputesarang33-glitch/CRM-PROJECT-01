/**
 * Firestore Cursor Pagination Utility
 *
 * Implements cursor-based pagination using Firestore document snapshots / IDs.
 * By fetching (limit + 1) items, it accurately determines hasNextPage without
 * needing costly full collection counts.
 */

/**
 * Executes a paginated query on a Firestore query reference
 * @param {FirebaseFirestore.Query} queryRef - Pre-filtered Firestore query
 * @param {FirebaseFirestore.CollectionReference} collectionRef - Base collection reference (used to fetch cursor doc)
 * @param {object} options - Pagination options
 * @param {number} [options.limit=10] - Number of records to return
 * @param {string} [options.cursor=null] - Document ID to start after
 * @returns {Promise<{ docs: Array<object>, pagination: { limit: number, hasNextPage: boolean, nextCursor: string|null } }>}
 */
export const paginateQuery = async (
  queryRef,
  collectionRef,
  { limit = 10, cursor = null } = {}
) => {
  const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));
  let paginatedQuery = queryRef;

  if (cursor && collectionRef) {
    const cursorDoc = await collectionRef.doc(cursor).get();
    if (cursorDoc.exists) {
      paginatedQuery = paginatedQuery.startAfter(cursorDoc);
    }
  }

  // Fetch limit + 1 to detect if there is a next page
  const snapshot = await paginatedQuery.limit(parsedLimit + 1).get();
  const rawDocs = snapshot.docs;
  const hasNextPage = rawDocs.length > parsedLimit;

  // Trim to requested limit
  const resultDocs = hasNextPage ? rawDocs.slice(0, parsedLimit) : rawDocs;

  const data = resultDocs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const lastDoc = resultDocs[resultDocs.length - 1];
  const nextCursor = hasNextPage && lastDoc ? lastDoc.id : null;

  return {
    data,
    pagination: {
      limit: parsedLimit,
      hasNextPage,
      nextCursor,
    },
  };
};
