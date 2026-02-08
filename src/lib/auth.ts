import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

client.connect().then(() => {
  client.db().collection('user').createIndex({ tenantId: 1 });
});

export const auth = betterAuth({
  basePath: '/auth',
  database: mongodbAdapter(client.db(), { client }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      tenantId: {
        type: 'string',
        required: true,
      },
      role: {
        type: 'string',
        required: true,
        defaultValue: 'AGENT',
      },
    },
  },
});
