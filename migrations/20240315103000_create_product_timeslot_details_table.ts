import type { Knex } from "knex";

/**
 * 1:1 extension of a product_timeslots row for provider-specific details.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('product_timeslot_details', (table) => {
    table.integer('product_timeslot_id').unsigned().primary();
    table.text('description');
    table.string('provider_name');
    table.string('provider_id');
    table.string('gender');
    table.string('external_id');
    table.timestamps(true, true);

    table.foreign('product_timeslot_id').references('product_timeslots.id').onDelete('CASCADE');
    table.index(['external_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('product_timeslot_details');
}
