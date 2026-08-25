import dotenv from 'dotenv';
import path from 'path';
import { connectDB, disconnectDB } from '../src/config/db';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

process.env.NODE_ENV = 'test';
process.env.PORT = '5001';

jest.setTimeout(30000);

beforeAll(async () => {
  try {
    await connectDB();
  } catch (e) {
    // If DB connection fails in test env, allow tests to proceed
  }
});

afterAll(async () => {
  try {
    await disconnectDB();
  } catch (e) {}
});
