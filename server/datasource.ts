import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'webrtc-prototype',
  entities: ['src/**/*.entity.ts'],
  migrations: ['database/migrations/*.ts'],
  synchronize: false,
});
