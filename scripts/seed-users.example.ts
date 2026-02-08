import mongoose from 'mongoose';
import { auth } from '../src/lib/auth';
import { TenantSchema } from '../src/tenants/schemas/tenant.schema';

const Tenant = mongoose.model('Tenant', TenantSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const tenant = await Tenant.findOne({ slug: 'example' });
  if (!tenant) {
    console.error('Tenant "crazybot" not found. Run seed-tenant.ts first.');
    await mongoose.disconnect();
    process.exit(1);
  }

  const user = await auth.api.createUser({
    body: {
      email: 'email@example.com',
      password: 'password.example',
      name: 'User example',
      role: 'user',
      data: {
        tenantId: tenant._id.toString(),
      },
    },
  });

  console.log('User created:', user);
  await mongoose.disconnect();
}

main().catch(console.error);
