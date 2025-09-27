require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    console.log("✅ Connected to MySQL!");

    // Test 1: simplest
    let sql = 'SELECT 1 AS ok';
    console.log('SQL>', sql);
    let [rows] = await connection.query(sql);
    console.log('Result:', rows);

    // Test 2: server version
    sql = 'SELECT VERSION() AS version';
    console.log('SQL>', sql);
    [rows] = await connection.query(sql);
    console.log('DB version:', rows[0].version);

    // Test 3: current time (use backticks for alias)
    sql = 'SELECT NOW() AS `current_time`';
    console.log('SQL>', sql);
    [rows] = await connection.query(sql);
    console.log('DB time:', rows[0].current_time);

    await connection.end();
  } catch (err) {
    // show full error object to debug
    console.error("❌ DB error:", err);
    // if mysql2 provides err.sql, log it too
    if (err && err.sql) console.error("SQL that caused error:", err.sql);
    if (connection) await connection.end().catch(()=>{});
    process.exitCode = 1;
  }
}

main();
