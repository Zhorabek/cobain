export async function ensureUserPreferencesTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS user_preferences (
        owner_tg_id INTEGER PRIMARY KEY,
        lang TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    )
    .run();
}

export async function getUserLanguage(db, ownerTgId) {
  const row = await db.prepare("SELECT lang FROM user_preferences WHERE owner_tg_id = ?").bind(ownerTgId).first();
  return row?.lang ?? null;
}

export async function setUserLanguage(db, ownerTgId, lang) {
  await db
    .prepare(
      `INSERT INTO user_preferences (owner_tg_id, lang)
       VALUES (?, ?)
       ON CONFLICT(owner_tg_id)
       DO UPDATE SET lang = excluded.lang, updated_at = CURRENT_TIMESTAMP`
    )
    .bind(ownerTgId, lang)
    .run();
}
