const { mongoClient, connectAll } = require('./client');

async function performanceParRegion() {
  await connectAll();
  const col = mongoClient.db('livraison').collection('deliveries');

  const resultats = await col.aggregate([
    {
      $group: {
        _id: '$region',
        nombre_livraisons: { $sum: 1 },
        revenu_total:      { $sum: '$amount' },
        duree_moyenne:     { $avg: '$duration_minutes' },
        rating_moyen:      { $avg: '$rating' }
      }
    },
    { $sort: { revenu_total: -1 } }
  ]).toArray();

  console.log('📊 Performance par région (tri revenu décroissant) :\n');
  resultats.forEach(r => {
    console.log(`🗺️  Région : ${r._id}`);
    console.log(`   Livraisons  : ${r.nombre_livraisons}`);
    console.log(`   Revenu total: ${r.revenu_total}€`);
    console.log(`   Durée moy.  : ${r.duree_moyenne.toFixed(1)} min`);
    console.log(`   Rating moy. : ${r.rating_moyen.toFixed(2)}`);
    console.log('');
  });

  await mongoClient.close();
}

performanceParRegion().catch(console.error);