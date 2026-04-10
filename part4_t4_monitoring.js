const { redisClient, connectAll } = require('./client');

// Centre de Paris (Notre-Dame)
const CENTRE_PARIS_LNG = 2.3488;
const CENTRE_PARIS_LAT = 48.8534;
const ZONE_MAX_KM = 5;

async function distanceAuCentre(livreurId) {
  const dist = await redisClient.geoDistWith(
    'drivers_locations',
    livreurId,
    { longitude: CENTRE_PARIS_LNG, latitude: CENTRE_PARIS_LAT },
    'km'
  );
  return dist;
}

async function mettreAJourPosition(livreurId, lng, lat) {
  await redisClient.geoAdd('drivers_locations', {
    longitude: lng,
    latitude: lat,
    member: livreurId
  });
  console.log(`Position de ${livreurId} mise a jour : (${lng}, ${lat})`);
}

async function verifierZone(livreurId) {
  // Chercher le livreur dans un rayon de 5km du centre
  const dansZone = await redisClient.geoSearchWith(
    'drivers_locations',
    { longitude: CENTRE_PARIS_LNG, latitude: CENTRE_PARIS_LAT },
    { radius: ZONE_MAX_KM, unit: 'km' },
    ['WITHDIST'],
    { SORT: 'ASC' }
  );

  const trouve = dansZone.find(l => l.member === livreurId);
  if (!trouve) {
    console.log(`ALERTE : ${livreurId} est sorti de la zone de service (> ${ZONE_MAX_KM} km du centre)`);
    return false;
  } else {
    console.log(`${livreurId} est dans la zone (${parseFloat(trouve.distance).toFixed(2)} km du centre)`);
    return true;
  }
}

async function monitoring() {
  await connectAll();

  console.log('--- Simulation monitoring toutes les 10 secondes ---\n');

  // Etat initial
  console.log('Etat initial :');
  await verifierZone('d1');
  await verifierZone('d3');

  // Simuler d1 qui se deplace legerement
  console.log('\nMise a jour position d1...');
  await mettreAJourPosition('d1', 2.370, 48.865);
  await verifierZone('d1');

  // Simuler d4 qui sort de la zone
  console.log('\nMise a jour position d4 (sort de la zone)...');
  await mettreAJourPosition('d4', 2.500, 48.700);
  await verifierZone('d4');

  await redisClient.disconnect();
}

monitoring().catch(console.error);