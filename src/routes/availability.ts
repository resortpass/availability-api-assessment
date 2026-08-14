import { Router, Request, Response } from 'express';
import availabilityService from '../services/availabilityService';

const router = Router();

/**
 * GET /api/availability?productId={id}&date={YYYY-MM-DD}
 *
 * Query product availability for a given date
 */
router.get('/availability', async (req: Request, res: Response) => {
  try {
    const { productId, date } = req.query;

    if (!productId || !date) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both productId and date are required',
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date as string)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Date must be in YYYY-MM-DD format',
      });
    }

    const availability = await availabilityService.getAvailability(
      productId as string,
      date as string
    );

    if (!availability) {
      return res.status(404).json({
        error: 'Product not found',
        message: `No active product found with ID: ${productId}`,
      });
    }

    return res.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching availability',
    });
  }
});

export default router;
