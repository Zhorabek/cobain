export async function listReviews(db, businessId, limit = 10) {
  const result = await db
    .prepare(
      `SELECT id, rating, comment, created_at
       FROM reviews
       WHERE business_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .bind(businessId, limit)
    .all();

  return result.results ?? [];
}
