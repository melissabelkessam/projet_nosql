const { mongoClient, connectAll } = require('./client');

async function topLivreurs() {
  await connectAll();
  const col = mongoClient.db('livraison').collection('deliveries');

  const resultats = await col.aggregate([
    {
      $group: {
        _id: { driver_id: '$driver_id', driver_name: '$driver_name' },
        nombre_livraisons: { $sum: 1 },
        revenu_total:      { $sum: '$amount' },
        duree_moyenne:     { $avg: '$duration_minutes' },
        rating_moyen:      { $avg: '$rating' }
      }
    },
    { $sort: { revenu_total: -1 } },
    { $limit: 2 }
  ]).toArray();

  console.log('🏆 Top 2 livreurs (par revenu décroissant) :\n');
  resultats.forEach((r, i) => {
    console.log(`${i + 1}. ${r._id.driver_name} (${r._id.driver_id})`);
    console.log(`   Livraisons  : ${r.nombre_livraisons}`);
    console.log(`   Revenu total: ${r.revenu_total}€`);
    console.log(`   Durée moy.  : ${r.duree_moyenne.toFixed(1)} min`);
    console.log(`   Rating moy. : ${r.rating_moyen.toFixed(2)}`);
    console.log('');
  });

  await mongoClient.close();
}

topLivreurs().catch(console.error);