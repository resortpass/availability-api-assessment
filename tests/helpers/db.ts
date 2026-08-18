import db from '../../src/db';

/**
 * Jest sets NODE_ENV=test, so `db` is the in-memory SQLite database from
 * knexfile.ts. Each test file gets its own fresh database.
 *
 * Usage:
 *   beforeAll(setupTestDb);
 *   afterAll(teardownTestDb);
 */
export async function setupTestDb(): Promise<void> {
  await db.migrate.latest();
  await db.seed.run();
}

export async function teardownTestDb(): Promise<void> {
  await db.destroy();
}

export default db;
