const pg = require('pg');
const con = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pune',
  password: 'Jiyanpostgres@5195',
  port: 5432, // default PostgreSQL port
});

module.exports = con; 