import nock from 'nock';

const THIRD_PARTY_API_URL = process.env.THIRD_PARTY_API_URL || 'http://localhost:3001';

/**
 * Example: stubbing the 3rd-party spa API with nock so tests never make
 * real HTTP calls. Point your integration code at THIRD_PARTY_API_URL and
 * use this pattern to test it.
 */
describe('3rd-party spa API stubbing (nock example)', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('stubs an availability response', async () => {
    nock(THIRD_PARTY_API_URL)
      .get('/api/availability/spa-001')
      .query({ date: '2024-03-15' })
      .reply(200, {
        success: true,
        data: {
          serviceId: 'spa-001',
          serviceName: '60-Minute Swedish Massage',
          date: '2024-03-15',
          slots: [
            {
              startTime: '09:00',
              endTime: '10:00',
              available: true,
              therapistId: 'T001',
              therapistName: 'Sarah Johnson',
              gender: 'female',
              slotId: 'SLOT-20240315-0900-T001-SPA001',
            },
          ],
        },
      });

    // Replace this raw fetch with a call into your integration code.
    const response = await fetch(
      `${THIRD_PARTY_API_URL}/api/availability/spa-001?date=2024-03-15`
    );
    const body = (await response.json()) as { data: { slots: unknown[] } };

    expect(response.status).toBe(200);
    expect(body.data.slots).toHaveLength(1);
  });

  it('stubs a 503 failure', async () => {
    nock(THIRD_PARTY_API_URL)
      .get('/api/availability/spa-001')
      .query(true)
      .reply(503, { success: false, error: 'Service temporarily unavailable' });

    const response = await fetch(
      `${THIRD_PARTY_API_URL}/api/availability/spa-001?date=2024-03-15`
    );
    expect(response.status).toBe(503);
  });
});
