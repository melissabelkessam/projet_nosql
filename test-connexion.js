const { redisClient, mongoClient, connectAll } = require('./client');

async function test() {
  await connectAll();

  // Test Redis
  await redisClient.set('test', 'hello redis');
  const val = await redisClient.get('test');
  console.log('🔴 Redis test:', val);

  // Test MongoDB
  const db = mongoClient.db('livraison');
  await db.collection('test').insertOne({ message: 'hello mongo' });
  const doc = await db.collection('test').findOne({ message: 'hello mongo' });
  console.log('🟢 MongoDB test:', doc.message);

  await redisClient.disconnect();
  await mongoClient.close();
  console.log('✅ Tout fonctionne !');
}

test().catch(console.error);