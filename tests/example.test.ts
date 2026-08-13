import request from 'supertest';
import app from '../src/index';

describe('Health Check', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

// TODO: Add your tests here
// Examples:
// - Test availability endpoint for internal products
// - Test availability endpoint for 3rd party products
// - Test error handling
// - Test data transformations
