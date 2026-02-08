import 'dotenv/config';
import { auth } from '../src/lib/auth';

async function main() {
  const user = await auth.api.createUser({
    body: {
      email: 'admin@example.com',
      password: 'securepassword',
      name: 'Admin',
      role: 'user',
      data: {
        tenantId: 'your-tenant-id',
      },
    },
  });

  console.log('User created:', user);
}

main().catch(console.error);
