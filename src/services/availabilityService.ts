import productRepository from '../repositories/productRepository';
import inventoryRepository from '../repositories/inventoryRepository';
import { AvailabilityResponse } from '../types';

export class AvailabilityService {
  async getAvailability(productId: string, date: string): Promise<AvailabilityResponse | null> {
    const product = await productRepository.findByExternalId(productId);

    if (!product || !product.active) {
      return null;
    }

    const inventory = await inventoryRepository.findByProductAndDate(product.id, date);

    if (!inventory) {
      return {
        productId: product.external_id,
        productName: product.name,
        date,
        availability: {
          available: 0,
          total: 0,
        },
      };
    }

    return {
      productId: product.external_id,
      productName: product.name,
      date,
      availability: {
        available: inventory.available_quantity,
        total: inventory.total_quantity,
      },
    };
  }
}

export default new AvailabilityService();
