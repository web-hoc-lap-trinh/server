import mysql, { Pool, PoolOptions } from "mysql2/promise";
import 'dotenv/config'; 

const poolOptions: PoolOptions = {
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0
};

const db: Pool = mysql.createPool(poolOptions);

export default db;