const { redisClient, connectAll } = require('./client');

async function affectationOptimale() {
  await connectAll();

  const maraisLng = 2.364;
  const maraisLat = 48.861;

  // Trouver tous les livreurs dans un rayon de 3km du Marais
  const livreursDansRayon = await redisClient.geoSearchWith(
    'drivers_locations',
    { longitude: maraisLng, latitude: maraisLat },
    { radius: 3, unit: 'km' },
    ['WITHDIST'],
    { SORT: 'ASC' }
  );

  console.log('Livreurs dans un rayon de 3km du Marais:');
  const candidats = [];
  for (const l of livreursDansRayon) {
    const infos = await redisClient.hGetAll(`livreur:${l.member}`);
    candidats.push({
      id:       l.member,
      distance: parseFloat(l.distance).toFixed(3),
      rating:   parseFloat(infos.rating)
    });
    console.log(`  ${l.member} -> distance: ${parseFloat(l.distance).toFixed(3)} km, rating: ${infos.rating}`);
  }

  // Option 1 : le plus proche
  const plusProche = candidats[0];
  console.log(`\nOption 1 - Le plus proche : ${plusProche.id} (${plusProche.distance} km)`);

  // Option 2 : le mieux note
  const mieuxNote = candidats.reduce((best, l) => l.rating > best.rating ? l : best, candidats[0]);
  console.log(`Option 2 - Le mieux note  : ${mieuxNote.id} (rating ${mieuxNote.rating})`);

  // Recommandation finale : score combiné (distance normalisee + rating)
  const maxDist = Math.max(...candidats.map(l => parseFloat(l.distance)));
  const meilleur = candidats.reduce((best, l) => {
    const score = l.rating - (parseFloat(l.distance) / maxDist);
    const scoreBest = best.rating - (parseFloat(best.distance) / maxDist);
    return score > scoreBest ? l : best;
  }, candidats[0]);

  console.log(`\nRecommandation finale (score combine distance + rating) : ${meilleur.id}`);
  console.log(`  Distance : ${meilleur.distance} km`);
  console.log(`  Rating   : ${meilleur.rating}`);

  await redisClient.disconnect();
}

affectationOptimale().catch(console.error);