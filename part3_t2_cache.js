const { redisClient, mongoClient, connectAll } = require('./client');

async function gererCache() {
  await connectAll();
  const col = mongoClient.db('livraison').collection('deliveries');
  const TTL = 30; // 30 secondes

  // Cache 1 : Top 5 livreurs par rating
  const top5 = await redisClient.zRangeWithScores('livreurs:rating', -5, -1);
  const top5Data = top5.reverse().map(l => `${l.value}:${l.score}`).join(',');
  await redisClient.set('cache:top5_livreurs', top5Data, { EX: TTL });
  console.log('Cache top5 livreurs cree (TTL 30s)');

  // Cache 2 : Commandes en attente par region
  const commandes = await redisClient.sMembers('commandes:en_attente');
  const parRegion = {};
  for (const id of commandes) {
    const data = await redisClient.hGetAll(`commande:${id}`);
    const region = data.destination;
    if (!parRegion[region]) parRegion[region] = [];
    parRegion[region].push(id);
  }
  await redisClient.set('cache:commandes_par_region', JSON.stringify(parRegion), { EX: TTL });
  console.log('Cache commandes par region cree (TTL 30s)\n');

  // Afficher les caches
  const cachedTop5 = await redisClient.get('cache:top5_livreurs');
  console.log('Top 5 livreurs (depuis cache):');
  cachedTop5.split(',').forEach((l, i) => {
    const [id, rating] = l.split(':');
    console.log(`  ${i+1}. ${id} -> rating ${rating}`);
  });

  const cachedRegions = await redisClient.get('cache:commandes_par_region');
  console.log('\nCommandes en attente par region (depuis cache):');
  const regions = JSON.parse(cachedRegions);
  for (const [region, ids] of Object.entries(regions)) {
    console.log(`  ${region}: ${ids.join(', ')}`);
  }

  // Verifier le TTL restant
  const ttlTop5 = await redisClient.ttl('cache:top5_livreurs');
  console.log(`\nTTL restant cache top5 : ${ttlTop5}s`);

  await redisClient.disconnect();
  await mongoClient.close();
}

gererCache().catch(console.error);