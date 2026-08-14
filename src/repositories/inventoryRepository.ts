import knex from 'knex';
import knexConfig from '../../knexfile';
import { Inventory } from '../types';

const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

export class InventoryRepository {
  async findByProductAndDate(productId: number, date: string): Promise<Inventory | undefined> {
    return db<Inventory>('inventory')
      .where({ product_id: productId, date })
      .first();
  }

  async findByProductIdAndDateRange(
    productId: number,
    startDate: string,
    endDate: string
  ): Promise<Inventory[]> {
    return db<Inventory>('inventory')
      .where({ product_id: productId })
      .whereBetween('date', [startDate, endDate])
      .orderBy('date', 'asc');
  }

  async create(inventory: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>): Promise<Inventory> {
    const [created] = await db<Inventory>('inventory')
      .insert(inventory)
      .returning('*');
    return created;
  }

  async updateAvailability(
    productId: number,
    date: string,
    availableQuantity: number
  ): Promise<Inventory | undefined> {
    const [updated] = await db<Inventory>('inventory')
      .where({ product_id: productId, date })
      .update({ available_quantity: availableQuantity, updated_at: new Date() })
      .returning('*');
    return updated;
  }
}

export default new InventoryRepository();
