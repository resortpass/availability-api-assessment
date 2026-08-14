import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('external_id').notNullable().unique();
    table.string('name').notNullable();
    table.text('description');
    table.decimal('base_price', 10, 2);
    table.string('currency', 3).defaultTo('USD');
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);

    table.index(['active']);
    table.index(['external_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('products');
}
