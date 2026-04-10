const { mongoClient, connectAll } = require('./client');

async function historiquelivreur() {
  await connectAll();
  const col = mongoClient.db('livraison').collection('deliveries');

  // Toutes les livraisons de d1
  const livraisons = await col.find({ driver_id: 'd1' }).toArray();
  console.log(`📋 Livraisons de d1 (Alice Dupont) :`);
  livraisons.forEach(l => {
    console.log(`  - ${l.command_id} | ${l.client} | ${l.amount}€ | rating: ${l.rating} | ${l.review}`);
  });

  // Nombre et montant total
  const stats = await col.aggregate([
    { $match: { driver_id: 'd1' } },
    { $group: {
      _id: '$driver_id',
      nombre: { $sum: 1 },
      montant_total: { $sum: '$amount' }
    }}
  ]).toArray();

  console.log(`\n📊 Stats de d1 :`);
  console.log(`  Nombre de livraisons : ${stats[0].nombre}`);
  console.log(`  Montant total        : ${stats[0].montant_total}€`);

  await mongoClient.close();
}

historiquelivreur().catch(console.error);