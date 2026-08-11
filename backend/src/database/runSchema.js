const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../config/env');

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
  });

  console.log('Aplicando schema.sql...');
  await connection.query(sql);
  console.log('Schema aplicado com sucesso.');

  await connection.end();
}

run().catch((err) => {
  console.error('Falha ao aplicar schema:', err.message);
  process.exit(1);
});
