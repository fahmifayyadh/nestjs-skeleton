/**
 * Jest Setup File
 * Global setup untuk semua tests
 */

// Suppress console output during tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  };
}

// Global timeout
jest.setTimeout(10000);

// Mock environment variables untuk testing
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_EXPIRATION = '24h';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_USERNAME = 'root';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_kios_db';
process.env.APP_PORT = '3001';
process.env.NODE_ENV = 'test';
