import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

/**
 * Test Module Setup Utilities
 * Helper functions untuk setup testing module
 */

/**
 * Create test database module
 */
export function createTestDatabaseModule() {
  return TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    entities: [__dirname + '/../../database/entities/**/*.entity.ts'],
    synchronize: true,
    logging: false,
    dropSchema: true,
  });
}

/**
 * Setup test application with common configuration
 */
export async function setupTestApp(
  module: any,
  applyValidation = true,
): Promise<INestApplication> {
  const testingModule: TestingModule = await Test.createTestingModule(
    module,
  ).compile();

  const app = testingModule.createNestApplication();

  if (applyValidation) {
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
  }

  await app.init();
  return app;
}

/**
 * Get repository from testing module
 */
export function getRepository(testingModule: TestingModule, Entity: any) {
  return testingModule.get(getRepositoryToken(Entity));
}

/**
 * Cleanup test database
 */
export async function cleanupTestDatabase(app: INestApplication) {
  // Get all repositories and delete all data
  const dataSource = app.get('DataSource') || app.get('DATABASE_CONNECTION');
  if (dataSource) {
    const entities = dataSource?.entityMetadatas || [];
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
  await app.close();
}

/**
 * Seed test database with initial data
 */
export async function seedTestDatabase(
  testingModule: TestingModule,
  seeds: Array<{ entity: any; data: any[] }>,
) {
  for (const seed of seeds) {
    const repository = getRepository(testingModule, seed.entity);
    await repository.save(seed.data);
  }
}
