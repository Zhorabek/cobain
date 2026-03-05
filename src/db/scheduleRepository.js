export async function listSlots(db, businessId) {
  const result = await db
    .prepare("SELECT id, day_of_week, start_time, end_time FROM business_slots WHERE business_id = ? ORDER BY day_of_week, start_time")
    .bind(businessId)
    .all();

  return result.results ?? [];
}

export async function addSlot(db, businessId, dayOfWeek, startTime, endTime) {
  await db
    .prepare("INSERT INTO business_slots (business_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)")
    .bind(businessId, dayOfWeek, startTime, endTime)
    .run();
}

export async function deleteSlot(db, slotId, businessId) {
  await db
    .prepare("DELETE FROM business_slots WHERE id = ? AND business_id = ?")
    .bind(slotId, businessId)
    .run();
}

export async function replaceWorkingHours(db, businessId, startTime, endTime) {
  await db.prepare("DELETE FROM business_slots WHERE business_id = ?").bind(businessId).run();
  for (let day = 1; day <= 7; day += 1) {
    await addSlot(db, businessId, day, startTime, endTime);
  }
}
