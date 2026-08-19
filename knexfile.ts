import type { Knex } from "knex";

// SQLite does not enforce foreign keys (incl. ON DELETE CASCADE) unless enabled per connection
const sqlitePool = {
  afterCreate: (conn: any, done: (err?: Error) => void) => {
    conn.run('PRAGMA foreign_keys = ON', done);
  }
};

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./dev.sqlite3"
    },
    useNullAsDefault: true,
    pool: sqlitePool,
    migrations: {
      directory: "./migrations",
      extension: "ts"
    },
    seeds: {
      directory: "./seeds"
    }
  },

  test: {
    client: "sqlite3",
    connection: ":memory:",
    useNullAsDefault: true,
    pool: sqlitePool,
    migrations: {
      directory: "./migrations",
      extension: "ts"
    },
    seeds: {
      directory: "./seeds"
    }
  },

  production: {
    client: "postgresql",
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: "./migrations",
      extension: "ts"
    },
    seeds: {
      directory: "./seeds"
    }
  }
};

export default config;
