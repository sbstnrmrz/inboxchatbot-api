import mongoose from 'mongoose';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const db = mongoose.connection.db!;
  const memberships = db.collection('memberships');

  console.log('Dropping old tenantId index...');
  try {
    await memberships.dropIndex('tenantId_1');
    console.log('✓ Dropped tenantId_1');
  } catch (error: any) {
    console.log('Index might not exist:', error.message);
  }

  console.log('\nCreating unique tenantId index...');
  await memberships.createIndex({ tenantId: 1 }, { unique: true });
  console.log('✓ Created unique index on tenantId');

  console.log('\n=== Updated MEMBERSHIPS indexes ===');
  const indexes = await memberships.indexes();
  indexes.forEach((idx) => {
    console.log(JSON.stringify(idx, null, 2));
  });

  await mongoose.disconnect();
  console.log('\n✓ Done!');
}

main().catch(console.error);
