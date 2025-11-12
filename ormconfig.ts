import { DataSource } from 'typeorm';
import 'dotenv/config';
import path from 'path';

// File này được sử dụng cho TypeORM CLI
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [path.join(__dirname, 'src/api/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'src/migrations/**/*{.ts,.js}')],
  subscribers: [],
  migrationsTableName: 'migrations',
});
