import mongoose from 'mongoose';
import { TenantSchema } from '../src/tenants/schemas/tenant.schema';
import {
  MembershipSchema,
  MembershipStatus,
} from '../src/tenants/schemas/membership.schema';

const Tenant = mongoose.model('Tenant', TenantSchema);
const Membership = mongoose.model('Membership', MembershipSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const existingTenant = await Tenant.findOne({ slug: 'crazybot' });
  if (existingTenant) {
    console.log('Tenant already exists:', existingTenant.toObject());
    await mongoose.disconnect();
    return;
  }

  const tenant = await Tenant.create({
    slug: 'crazybot',
    name: 'Crazybot',
  });

  await Membership.create({
    tenantId: tenant._id,
    status: MembershipStatus.Active,
  });

  console.log('Tenant created:', tenant.toObject());

  await mongoose.disconnect();
}

main().catch(console.error);
