import db from '../db';
import { Product } from '../types';

export class ProductRepository {
  async findById(id: number): Promise<Product | undefined> {
    return db<Product>('products')
      .where({ id })
      .first();
  }

  async findByExternalId(externalId: string): Promise<Product | undefined> {
    return db<Product>('products')
      .where({ external_id: externalId })
      .first();
  }

  async findAll(filters?: { active?: boolean }): Promise<Product[]> {
    let query = db<Product>('products');

    if (filters?.active !== undefined) {
      query = query.where({ active: filters.active });
    }

    return query;
  }

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const [created] = await db<Product>('products')
      .insert(product)
      .returning('*');
    return created;
  }
}

export default new ProductRepository();
