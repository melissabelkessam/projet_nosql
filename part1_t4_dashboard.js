const { redisClient, connectAll } = require('./client');

async function afficherEtat() {
  await connectAll();

  // Commandes en attente
  const enAttente = await redisClient.sMembers('commandes:en_attente');
  console.log(`📋 Commandes en attente (${enAttente.length}):`, enAttente);

  // Commandes assignées
  const assignees = await redisClient.sMembers('commandes:assignées');
  console.log(`🚴 Commandes assignées (${assignees.length}):`, assignees);

  // Livreur avec le rating maximal
  const meilleur = await redisClient.zRange('livreurs:rating', -1, -1);
  const ratingMax = await redisClient.zScore('livreurs:rating', meilleur[0]);
  const infos = await redisClient.hGetAll(`livreur:${meilleur[0]}`);
  console.log(`\n🏆 Meilleur livreur: ${meilleur[0]} - ${infos.nom} (rating: ${ratingMax})`);

  await redisClient.disconnect();
}

afficherEtat().catch(console.error);