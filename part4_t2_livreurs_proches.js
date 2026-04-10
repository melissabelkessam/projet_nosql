const { redisClient, connectAll } = require('./client');

async function livreursProches() {
  await connectAll();

  // Position du Marais comme point de reference
  const maraisLng = 2.364;
  const maraisLat = 48.861;

  // 1. Livreurs dans un rayon de 2km autour du Marais
  const dansRayon = await redisClient.geoSearchWith(
    'drivers_locations',
    { longitude: maraisLng, latitude: maraisLat },
    { radius: 2, unit: 'km' },
    ['WITHDIST'],
    { SORT: 'ASC' }
  );
  console.log('Livreurs dans un rayon de 2km autour du Marais:');
  dansRayon.forEach(l => console.log(`  ${l.member} -> ${parseFloat(l.distance).toFixed(3)} km`));

  // 2. Tous les livreurs avec leur distance exacte
  const avecDistance = await redisClient.geoSearchWith(
    'drivers_locations',
    { longitude: maraisLng, latitude: maraisLat },
    { radius: 100, unit: 'km' },
    ['WITHDIST'],
    { SORT: 'ASC' }
  );
  console.log('\nTous les livreurs avec distance au Marais:');
  avecDistance.forEach(l => console.log(`  ${l.member} -> ${parseFloat(l.distance).toFixed(3)} km`));

  // 3. Les 2 livreurs les plus proches
  const top2 = await redisClient.geoSearchWith(
    'drivers_locations',
    { longitude: maraisLng, latitude: maraisLat },
    { radius: 100, unit: 'km' },
    ['WITHDIST'],
    { SORT: 'ASC', COUNT: 2 }
  );
  console.log('\nLes 2 livreurs les plus proches du Marais:');
  top2.forEach((l, i) => console.log(`  ${i+1}. ${l.member} -> ${parseFloat(l.distance).toFixed(3)} km`));

  await redisClient.disconnect();
}

livreursProches().catch(console.error);