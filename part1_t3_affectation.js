const { redisClient, connectAll } = require('./client');

async function affecterCommande() {
  await connectAll();

  // Transaction Redis (MULTI/EXEC) pour garantir l'atomicité
  const multi = redisClient.multi();

  // 1. Mettre à jour le statut de c1 → "assignée"
  multi.hSet('commande:c1', 'statut', 'assignée');

  // 2. Retirer c1 du set "en_attente" et l'ajouter à "assignée"
  multi.sRem('commandes:en_attente', 'c1');
  multi.sAdd('commandes:assignées', 'c1');

  // 3. Enregistrer que d3 prend c1
  multi.hSet('livreur:d3', 'commande_en_cours', 'c1');

  // 4. Incrémenter le nombre de livraisons en cours de d3
  multi.hIncrBy('livreur:d3', 'livraisons_en_cours', 1);

  // Exécuter toutes les opérations atomiquement
  await multi.exec();
  console.log('✅ Affectation atomique effectuée : c1 → d3\n');

  // Vérifications
  const commande = await redisClient.hGetAll('commande:c1');
  console.log('📋 Statut de c1:', commande.statut);

  const livreur = await redisClient.hGetAll('livreur:d3');
  console.log('🚴 Livreur d3:', livreur);

  await redisClient.disconnect();
}

affecterCommande().catch(console.error);