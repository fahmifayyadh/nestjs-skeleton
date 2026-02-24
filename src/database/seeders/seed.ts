import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import * as bcrypt from 'bcryptjs';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'kios_db',
  entities: [User, RefreshToken],
  synchronize: false,
  logging: false,
});

export async function seedDatabase() {
  await AppDataSource.initialize();

  try {
    const users = [
      {
        name: 'Admin User',
        email: 'admin@kios.com',
        phone: '081234567890',
        password: 'Admin@123456',
        status: 'active',
      },
      {
        name: 'Test User',
        email: 'test@kios.com',
        phone: '081234567891',
        password: 'Test@123456',
        status: 'active',
      },
      {
        name: 'Demo User',
        email: 'demo@kios.com',
        phone: '081234567892',
        password: 'Demo@123456',
        status: 'active',
      },
    ];

    const userRepository = AppDataSource.getRepository(User);

    for (const userData of users) {
      const userExists = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (!userExists) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = userRepository.create({
          ...userData,
          password: hashedPassword,
        });
        await userRepository.save(user);
        console.log(`✓ User ${userData.email} seeded successfully`);
      } else {
        console.log(`✓ User ${userData.email} already exists, skipping`);
      }
    }

    console.log('\n✓ Database seeding completed successfully!');
  } catch (error) {
    console.error('✗ Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedDatabase();
