export async function getBusinessByOwnerId(db, ownerTgId) {
  return db
    .prepare(
      `SELECT id, owner_tg_id, name, address_label, latitude, longitude, category_id
       FROM businesses
       WHERE owner_tg_id = ?`
    )
    .bind(ownerTgId)
    .first();
}

export async function createBusiness(db, input) {
  const result = await db
    .prepare(
      `INSERT INTO businesses (owner_tg_id, name, category_id, latitude, longitude, address_label)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.ownerTgId,
      input.name,
      input.categoryId,
      input.latitude,
      input.longitude,
      input.addressLabel
    )
    .run();

  return result;
}

export async function updateBusinessName(db, ownerTgId, name) {
  await db.prepare("UPDATE businesses SET name = ? WHERE owner_tg_id = ?").bind(name, ownerTgId).run();
}

export async function updateBusinessAddress(db, ownerTgId, latitude, longitude, addressLabel) {
  await db
    .prepare("UPDATE businesses SET latitude = ?, longitude = ?, address_label = ? WHERE owner_tg_id = ?")
    .bind(latitude, longitude, addressLabel, ownerTgId)
    .run();
}
