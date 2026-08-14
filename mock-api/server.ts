import express from 'express';
import mockData from './example-response.json';

const app = express();
const PORT = 3001;

app.use(express.json());

/**
 * Mock 3rd Party API
 *
 * This simulates an external SPA booking service API.
 * In the real world, this would be a completely separate service.
 */

// Get all services
app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    data: mockData.services
  });
});

app.get('/api/availability/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'Date parameter is required (format: YYYY-MM-DD)'
    });
  }

  const dateStr = date as string;

  if (Math.random() < 0.1) {
    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable'
    });
  }

  const service = mockData.services.find(s => s.serviceId === serviceId);
  if (!service) {
    return res.status(404).json({
      success: false,
      error: 'Service not found'
    });
  }

  const dateAvailability = mockData.availability[dateStr as keyof typeof mockData.availability];
  if (!dateAvailability) {
    return res.json({
      success: true,
      data: {
        serviceId,
        serviceName: service.serviceName,
        date: dateStr,
        slots: []
      }
    });
  }

  const slots = dateAvailability[serviceId as keyof typeof dateAvailability];

  res.json({
    success: true,
    data: {
      serviceId,
      serviceName: service.serviceName,
      date: dateStr,
      duration: service.duration,
      price: service.price,
      currency: service.currency,
      slots: slots?.slots || []
    }
  });
});

app.get('/api/availability', (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'Date parameter is required (format: YYYY-MM-DD)'
    });
  }

  const dateStr = date as string;
  const dateAvailability = mockData.availability[dateStr as keyof typeof mockData.availability];

  if (!dateAvailability) {
    return res.json({
      success: true,
      data: {
        date: dateStr,
        services: []
      }
    });
  }

  const services = Object.keys(dateAvailability).map(serviceId => {
    const service = mockData.services.find(s => s.serviceId === serviceId);
    const slots = dateAvailability[serviceId as keyof typeof dateAvailability];

    return {
      serviceId,
      serviceName: service?.serviceName || 'Unknown',
      duration: service?.duration,
      price: service?.price,
      currency: service?.currency,
      slots: slots.slots
    };
  });

  res.json({
    success: true,
    data: {
      provider: mockData.provider,
      date: dateStr,
      services
    }
  });
});

app.listen(PORT, () => {
  console.log(`🧖 Mock SPA API running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET /api/services`);
  console.log(`  GET /api/availability?date=YYYY-MM-DD`);
  console.log(`  GET /api/availability/:serviceId?date=YYYY-MM-DD`);
  console.log(`\nExample:`);
  console.log(`  curl http://localhost:${PORT}/api/availability/spa-001?date=2024-03-15`);
});
