const { redisClient, connectAll } = require('./client');

async function multiRegions() {
  await connectAll();

  // Suppression forcee
  const keys = [
    'livreur:d1:regions', 'livreur:d2:regions', 'livreur:d3:regions',
    'livreur:d4:regions', 'livreur:d5:regions', 'livreur:d6:regions',
    'region:Paris:livreurs', 'region:Banlieue:livreurs'
  ];
  for (const k of keys) await redisClient.del(k);
  console.log('Cles supprimees');

  // Ajout une valeur a la fois
  await redisClient.sAdd('livreur:d1:regions', 'Paris');
  await redisClient.sAdd('livreur:d1:regions', 'Banlieue');
  await redisClient.sAdd('livreur:d2:regions', 'Paris');
  await redisClient.sAdd('livreur:d3:regions', 'Banlieue');
  await redisClient.sAdd('livreur:d4:regions', 'Banlieue');
  await redisClient.sAdd('livreur:d5:regions', 'Paris');
  await redisClient.sAdd('livreur:d6:regions', 'Paris');
  await redisClient.sAdd('livreur:d6:regions', 'Banlieue');

  await redisClient.sAdd('region:Paris:livreurs', 'd1');
  await redisClient.sAdd('region:Paris:livreurs', 'd2');
  await redisClient.sAdd('region:Paris:livreurs', 'd5');
  await redisClient.sAdd('region:Paris:livreurs', 'd6');
  await redisClient.sAdd('region:Banlieue:livreurs', 'd1');
  await redisClient.sAdd('region:Banlieue:livreurs', 'd3');
  await redisClient.sAdd('region:Banlieue:livreurs', 'd4');
  await redisClient.sAdd('region:Banlieue:livreurs', 'd6');

  // Verification
  const regionsD1 = await redisClient.sMembers('livreur:d1:regions');
  console.log('Regions de d1:', regionsD1);

  const livreursParis = await redisClient.sMembers('region:Paris:livreurs');
  console.log('Livreurs operant a Paris:', livreursParis);

  await redisClient.disconnect();
}

multiRegions().catch(console.error);