const { redisClient, connectAll } = require('./client');

async function initGeo() {
  await connectAll();

  // Supprimer les anciennes cles geo si elles existent
  await redisClient.del('delivery_points');
  await redisClient.del('drivers_locations');

  // Lieux de livraison
  const lieux = [
    { nom: 'Marais',     lng: 2.364, lat: 48.861 },
    { nom: 'Belleville', lng: 2.379, lat: 48.870 },
    { nom: 'Bercy',      lng: 2.381, lat: 48.840 },
    { nom: 'Auteuil',    lng: 2.254, lat: 48.851 },
  ];

  for (const l of lieux) {
    await redisClient.geoAdd('delivery_points', {
      longitude: l.lng,
      latitude:  l.lat,
      member:    l.nom
    });
  }
  console.log('Lieux de livraison ajoutes');

  // Positions des livreurs
  const livreurs = [
    { id: 'd1', lng: 2.365, lat: 48.862 },
    { id: 'd2', lng: 2.378, lat: 48.871 },
    { id: 'd3', lng: 2.320, lat: 48.920 },
    { id: 'd4', lng: 2.400, lat: 48.750 },
  ];

  for (const l of livreurs) {
    await redisClient.geoAdd('drivers_locations', {
      longitude: l.lng,
      latitude:  l.lat,
      member:    l.id
    });
  }
  console.log('Positions des livreurs ajoutees\n');

  // Verification : position de d1
  const posD1 = await redisClient.geoPos('drivers_locations', 'd1');
  console.log('Position de d1:', posD1[0]);

  // Verification : position du Marais
  const posMarais = await redisClient.geoPos('delivery_points', 'Marais');
  console.log('Position Marais:', posMarais[0]);

  await redisClient.disconnect();
}

initGeo().catch(console.error);