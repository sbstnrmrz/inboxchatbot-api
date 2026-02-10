import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

/**
 * Returns a MongooseModule configured against an in-memory MongoDB instance.
 * Call closeTestDb() in afterAll to stop the server and close the connection.
 */
export function rootMongooseTestModule() {
  return MongooseModule.forRootAsync({
    useFactory: async () => {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      return { uri };
    },
  });
}

export async function closeTestDb(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}
