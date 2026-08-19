import request from 'supertest';
import app from '../src/index';
import { setupTestDb, teardownTestDb } from './helpers/db';

beforeAll(setupTestDb);
afterAll(teardownTestDb);

describe('GET /api/availability', () => {
  it('returns availability for a seeded internal product', async () => {
    const response = await request(app).get(
      '/api/availability?productId=pool-pass-001&date=2024-03-15'
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      productId: 'pool-pass-001',
      productName: 'Pool Day Pass - Weekday',
      date: '2024-03-15',
      availability: { available: 35, total: 50 },
    });
  });

  it('returns 400 when a required parameter is missing', async () => {
    const response = await request(app).get('/api/availability?productId=pool-pass-001');
    expect(response.status).toBe(400);
  });

  it('returns 404 for an unknown product', async () => {
    const response = await request(app).get(
      '/api/availability?productId=does-not-exist&date=2024-03-15'
    );
    expect(response.status).toBe(404);
  });

  // TODO(candidate): un-skip and fill in as you build the time-slotted flow.
  describe.skip('time-slotted products', () => {
    it.todo('returns time slots for a spa product with synced availability');
    it.todo('returns one consistent response shape for both product types');
    it.todo('handles 3rd-party API failures gracefully');
  });
});
