import knex, { Knex } from 'knex';
import knexConfig from '../knexfile';

const environment = process.env.NODE_ENV || 'development';

/**
 * Shared knex instance. All repositories should import this rather than
 * creating their own connection.
 */
const db: Knex = knex(knexConfig[environment]);

export default db;
