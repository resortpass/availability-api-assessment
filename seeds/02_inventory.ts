import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex('inventory').del();

  const products = await knex('products').select('id', 'external_id');
  const idFor = (externalId: string): number => {
    const product = products.find((p) => p.external_id === externalId);
    if (!product) {
      throw new Error(`Missing seeded product: ${externalId} (run seeds in order)`);
    }
    return product.id;
  };

  await knex('inventory').insert([
    {
      product_id: idFor('pool-pass-001'),
      date: '2024-03-15',
      total_quantity: 50,
      available_quantity: 35,
      reserved_quantity: 15,
    },
    {
      product_id: idFor('cabana-001'),
      date: '2024-03-15',
      total_quantity: 10,
      available_quantity: 3,
      reserved_quantity: 7,
    },
    {
      product_id: idFor('gym-pass-001'),
      date: '2024-03-15',
      total_quantity: 100,
      available_quantity: 87,
      reserved_quantity: 13,
    },
  ]);
}
