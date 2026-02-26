import { DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  ssl: { rejectUnauthorized: false },
  extra: {
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  },
};
