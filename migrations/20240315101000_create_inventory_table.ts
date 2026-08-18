import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('inventory', (table) => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.date('date').notNullable();
    table.integer('total_quantity').notNullable();
    table.integer('available_quantity').notNullable();
    table.integer('reserved_quantity').defaultTo(0);
    table.timestamps(true, true);

    table.foreign('product_id').references('products.id').onDelete('CASCADE');
    table.unique(['product_id', 'date']);
    table.index(['date']);
    table.index(['product_id', 'date']);

    // Sanity checks: quantities can never go negative
    table.check('available_quantity >= 0');
    table.check('reserved_quantity >= 0');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('inventory');
}
