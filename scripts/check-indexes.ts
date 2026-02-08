import mongoose from 'mongoose';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const db = mongoose.connection.db!;

  console.log('\n=== TENANTS COLLECTION ===');
  const tenantsIndexes = await db.collection('tenants').indexes();
  tenantsIndexes.forEach((idx) => {
    console.log(JSON.stringify(idx, null, 2));
  });

  console.log('\n=== MEMBERSHIPS COLLECTION ===');
  const membershipsIndexes = await db.collection('memberships').indexes();
  membershipsIndexes.forEach((idx) => {
    console.log(JSON.stringify(idx, null, 2));
  });

  console.log('\n=== USER COLLECTION (Better Auth) ===');
  const userIndexes = await db.collection('user').indexes();
  userIndexes.forEach((idx) => {
    console.log(JSON.stringify(idx, null, 2));
  });

  await mongoose.disconnect();
}

main().catch(console.error);
