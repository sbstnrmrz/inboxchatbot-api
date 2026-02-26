import { Logger } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { auth, client } from './lib/auth.js';
import { MembershipStatus } from './tenants/schemas/membership.schema.js';

const SYSTEM_TENANT_SLUG = 'system';
const SYSTEM_TENANT_NAME = 'System';

export async function bootstrapRootData(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const db = client.db();

  // If a superadmin already exists, nothing to do regardless of env vars
  const existingSuperadmin = await db
    .collection('user')
    .findOne({ role: 'superadmin' });

  if (existingSuperadmin) {
    logger.log('Superadmin already exists — skipping bootstrap.');
    return;
  }

  const email = process.env.ROOT_EMAIL;
  const password = process.env.ROOT_PASSWORD;

  if (!email || !password) {
    logger.warn(
      'No superadmin found and ROOT_EMAIL/ROOT_PASSWORD are not set — skipping bootstrap.',
    );
    return;
  }

  // --- Tenant ---
  let tenant = await db
    .collection('tenants')
    .findOne({ slug: SYSTEM_TENANT_SLUG });

  if (!tenant) {
    const tenantId = new ObjectId();
    const now = new Date();

    await db.collection('tenants').insertOne({
      _id: tenantId,
      slug: SYSTEM_TENANT_SLUG,
      name: SYSTEM_TENANT_NAME,
      createdAt: now,
      updatedAt: now,
    });

    await db.collection('memberships').insertOne({
      tenantId,
      status: MembershipStatus.Active,
      createdAt: now,
      updatedAt: now,
    });

    tenant = { _id: tenantId };
    logger.log(`Tenant "${SYSTEM_TENANT_SLUG}" created.`);
  } else {
    logger.log(`Tenant "${SYSTEM_TENANT_SLUG}" already exists — skipping.`);
  }

  // --- Superadmin ---
  await auth.api.createUser({
    body: {
      email,
      password,
      name: 'Superadmin',
      role: 'superadmin',
      data: { tenantId: tenant._id.toString() },
    },
  });

  logger.log(`Superadmin "${email}" created.`);
}
