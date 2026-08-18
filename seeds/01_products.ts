import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Clear tables in FK-safe order
  await knex('product_timeslot_details').del();
  await knex('product_timeslots').del();
  await knex('inventory').del();
  await knex('products').del();

  await knex('products').insert([
    // Internal products (availability tracked in the inventory table)
    {
      external_id: 'pool-pass-001',
      name: 'Pool Day Pass - Weekday',
      description: 'Full-day access to the resort pool, Monday through Friday',
      base_price: 45.0,
      currency: 'USD',
      active: true,
    },
    {
      external_id: 'cabana-001',
      name: 'Poolside Cabana',
      description: 'Private poolside cabana with seating for up to 6 guests',
      base_price: 250.0,
      currency: 'USD',
      active: true,
    },
    {
      external_id: 'gym-pass-001',
      name: 'Fitness Center Day Pass',
      description: 'Full-day access to the fitness center and locker rooms',
      base_price: 25.0,
      currency: 'USD',
      active: true,
    },

    // Spa catalog (time-slotted services fulfilled by the 3rd-party provider)
    {
      external_id: 'massage-swedish-60',
      name: '60-Minute Swedish Massage',
      description: 'A relaxing full-body Swedish massage',
      base_price: 120.0,
      currency: 'USD',
      active: true,
    },
    {
      external_id: 'massage-deep-90',
      name: '90-Minute Deep Tissue Massage',
      description: 'A therapeutic deep tissue massage targeting problem areas',
      base_price: 165.0,
      currency: 'USD',
      active: true,
    },
    {
      external_id: 'facial-express-30',
      name: '30-Minute Express Facial',
      description: 'A quick refreshing facial treatment',
      base_price: 75.0,
      currency: 'USD',
      active: true,
    },
  ]);
}
