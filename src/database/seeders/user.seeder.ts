import { getRepository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

export class UserSeeder {
  async run() {
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

    const userRepository = getRepository(User);

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
        console.log(`User ${userData.email} seeded successfully`);
      }
    }
  }
}
