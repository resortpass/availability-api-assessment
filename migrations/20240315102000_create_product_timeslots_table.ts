import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('product_timeslots', (table) => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.date('date').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.boolean('available').notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.foreign('product_id').references('products.id').onDelete('CASCADE');

    // Note: no unique constraint on (product_id, date, start_time) —
    // the same service can be offered by multiple providers at the same time.
    table.index(['product_id', 'date']);
    table.index(['date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('product_timeslots');
}
