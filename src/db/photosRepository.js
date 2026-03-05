export async function listPhotos(db, businessId) {
  const result = await db
    .prepare("SELECT id, file_id FROM business_photos WHERE business_id = ? ORDER BY id DESC")
    .bind(businessId)
    .all();

  return result.results ?? [];
}

export async function addPhoto(db, businessId, fileId) {
  await db.prepare("INSERT INTO business_photos (business_id, file_id) VALUES (?, ?)").bind(businessId, fileId).run();
}

export async function deletePhoto(db, photoId, businessId) {
  await db
    .prepare("DELETE FROM business_photos WHERE id = ? AND business_id = ?")
    .bind(photoId, businessId)
    .run();
}
