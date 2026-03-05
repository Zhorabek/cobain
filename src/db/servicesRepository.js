export async function listServices(db, businessId) {
  const result = await db
    .prepare("SELECT id, name, price, duration FROM services WHERE business_id = ? ORDER BY id DESC")
    .bind(businessId)
    .all();

  return result.results ?? [];
}

export async function addService(db, businessId, name, price, duration) {
  await db
    .prepare("INSERT INTO services (business_id, name, price, duration) VALUES (?, ?, ?, ?)")
    .bind(businessId, name, price, duration)
    .run();
}

export async function updateService(db, serviceId, businessId, name, price, duration) {
  await db
    .prepare("UPDATE services SET name = ?, price = ?, duration = ? WHERE id = ? AND business_id = ?")
    .bind(name, price, duration, serviceId, businessId)
    .run();
}

export async function deleteService(db, serviceId, businessId) {
  await db.prepare("DELETE FROM services WHERE id = ? AND business_id = ?").bind(serviceId, businessId).run();
}
