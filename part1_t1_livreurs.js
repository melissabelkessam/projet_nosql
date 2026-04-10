const { redisClient, connectAll } = require('./client');

async function initLivreurs() {
  await connectAll();

  const livreurs = [
    { id: 'd1', nom: 'Alice Dupont',    region: 'Paris',    rating: 4.8 },
    { id: 'd2', nom: 'Bob Martin',      region: 'Paris',    rating: 4.5 },
    { id: 'd3', nom: 'Charlie Lefevre', region: 'Banlieue', rating: 4.9 },
    { id: 'd4', nom: 'Diana Russo',     region: 'Banlieue', rating: 4.3 },
    { id: 'd5', nom: 'Eve Lambert',     region: 'Paris',    rating: 4.7 },
    { id: 'd6', nom: 'Frank Morel',     region: 'Banlieue', rating: 4.6 },
  ];

  for (const l of livreurs) {
    // Hash pour stocker toutes les infos du livreur
    await redisClient.hSet(`livreur:${l.id}`, {
      nom: l.nom,
      region: l.region,
      rating: l.rating,
      livraisons_en_cours: 0,
      livraisons_completees: 0
    });

    // Sorted Set pour chercher par rating
    await redisClient.zAdd('livreurs:rating', { score: l.rating, value: l.id });
  }

  console.log('✅ Livreurs initialisés\n');

  // 1. Accéder rapidement au rating d'un livreur
  const rating = await redisClient.hGet('livreur:d1', 'rating');
  console.log('⭐ Rating de d1 (Alice):', rating);

  // 2. Liste de tous les livreurs avec leur rating
  const tous = await redisClient.zRangeWithScores('livreurs:rating', 0, -1);
  console.log('\n📋 Tous les livreurs par rating:');
  tous.forEach(l => console.log(`  ${l.value} → ${l.score}`));

  // 3. Meilleurs livreurs (rating >= 4.7)
  const meilleurs = await redisClient.zRangeByScoreWithScores('livreurs:rating', 4.7, '+inf');
  console.log('\n🏆 Meilleurs livreurs (rating ≥ 4.7):');
  meilleurs.forEach(l => console.log(`  ${l.value} → ${l.score}`));

  await redisClient.disconnect();
}

initLivreurs().catch(console.error);