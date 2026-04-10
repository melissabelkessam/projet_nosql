const { mongoClient, connectAll } = require('./client');

async function importerHistorique() {
  await connectAll();
  const db = mongoClient.db('livraison');
  const col = db.collection('deliveries');

  // Vider la collection si elle existe déjà
  await col.deleteMany({});

  const livraisons = [
    {
      command_id: 'c1', client: 'Client A', driver_id: 'd3',
      driver_name: 'Charlie Lefevre',
      pickup_time: new Date('2025-12-06T14:05:00Z'),
      delivery_time: new Date('2025-12-06T14:25:00Z'),
      duration_minutes: 20, amount: 25, region: 'Paris',
      rating: 4.9, review: 'Excellent service !', status: 'completed'
    },
    {
      command_id: 'c2', client: 'Client B', driver_id: 'd1',
      driver_name: 'Alice Dupont',
      pickup_time: new Date('2025-12-06T14:10:00Z'),
      delivery_time: new Date('2025-12-06T14:25:00Z'),
      duration_minutes: 15, amount: 15, region: 'Paris',
      rating: 4.8, review: 'Très rapide, merci !', status: 'completed'
    },
    {
      command_id: 'c3', client: 'Client C', driver_id: 'd2',
      driver_name: 'Bob Martin',
      pickup_time: new Date('2025-12-06T14:15:00Z'),
      delivery_time: new Date('2025-12-06T14:40:00Z'),
      duration_minutes: 25, amount: 30, region: 'Banlieue',
      rating: 4.5, review: 'Correct mais un peu lent.', status: 'completed'
    },
    {
      command_id: 'c4', client: 'Client D', driver_id: 'd1',
      driver_name: 'Alice Dupont',
      pickup_time: new Date('2025-12-06T14:20:00Z'),
      delivery_time: new Date('2025-12-06T14:38:00Z'),
      duration_minutes: 18, amount: 20, region: 'Paris',
      rating: 4.8, review: 'Parfait, livreur très sympa !', status: 'completed'
    },
    {
      command_id: 'c5', client: 'Client E', driver_id: 'd3',
      driver_name: 'Charlie Lefevre',
      pickup_time: new Date('2025-12-06T15:00:00Z'),
      delivery_time: new Date('2025-12-06T15:22:00Z'),
      duration_minutes: 22, amount: 40, region: 'Banlieue',
      rating: 5.0, review: 'Impeccable, je recommande !', status: 'completed'
    },
    {
      command_id: 'c6', client: 'Client F', driver_id: 'd4',
      driver_name: 'Diana Russo',
      pickup_time: new Date('2025-12-06T15:10:00Z'),
      delivery_time: new Date('2025-12-06T15:40:00Z'),
      duration_minutes: 30, amount: 18, region: 'Banlieue',
      rating: 4.2, review: 'Livraison correcte.', status: 'completed'
    },
  ];

  await col.insertMany(livraisons);
  console.log(`✅ ${livraisons.length} livraisons insérées dans MongoDB\n`);

  // Vérification
  const count = await col.countDocuments();
  console.log('📦 Nombre total de documents dans deliveries:', count);

  const exemple = await col.findOne({ command_id: 'c1' });
  console.log('\n🔍 Exemple - livraison c1:', exemple);

  await mongoClient.close();
}

importerHistorique().catch(console.error);