const STATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS bot_states (
  owner_tg_id INTEGER PRIMARY KEY,
  state TEXT NOT NULL,
  payload TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)`;

export async function ensureStateTable(db) {
  await db.prepare(STATE_TABLE_SQL).run();
}

export async function setUserState(db, ownerTgId, state, payload = null) {
  await db
    .prepare(
      `INSERT INTO bot_states (owner_tg_id, state, payload)
       VALUES (?, ?, ?)
       ON CONFLICT(owner_tg_id)
       DO UPDATE SET state = excluded.state, payload = excluded.payload, updated_at = CURRENT_TIMESTAMP`
    )
    .bind(ownerTgId, state, payload ? JSON.stringify(payload) : null)
    .run();
}

export async function getUserState(db, ownerTgId) {
  const result = await db
    .prepare("SELECT state, payload FROM bot_states WHERE owner_tg_id = ?")
    .bind(ownerTgId)
    .first();

  if (!result) return null;

  return {
    state: result.state,
    payload: result.payload ? JSON.parse(result.payload) : null,
  };
}

export async function clearUserState(db, ownerTgId) {
  await db.prepare("DELETE FROM bot_states WHERE owner_tg_id = ?").bind(ownerTgId).run();
}
