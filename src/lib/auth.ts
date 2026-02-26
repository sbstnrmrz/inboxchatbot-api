import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins/admin';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { ac, user, admin as adminRole, superAdmin } from './permissions';

export const client = new MongoClient(process.env.MONGODB_URI!);

const isProduction = process.env.NODE_ENV === 'production';

client.connect().then(() => {
  client.db().collection('user').createIndex({ tenantId: 1 });
});

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Build trusted origins list: include exact origins + subdomain wildcards
const trustedOrigins = allowedOrigins.flatMap((origin) => {
  const { hostname, port, protocol } = new URL(origin);
  const portSuffix = port ? `:${port}` : '';
  return [origin, `${protocol}//*.${hostname}${portSuffix}`];
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: '/auth',
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  advanced: {
    useSecureCookies: isProduction,
    crossSubDomainCookies: {
      enabled: true,
      domain: isProduction ? process.env.FRONTEND_URL : 'localtest.me', // your domain
    },
  },

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
    },
  },
  plugins: [
    admin({
      ac,
      roles: {
        user,
        admin: adminRole,
        superadmin: superAdmin,
      },
      defaultRole: 'user',
    }),
  ],
});
