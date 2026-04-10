const { redisClient, connectAll } = require('./client');

async function simulerLivraison() {
  await connectAll();

  // Transaction atomique pour simuler la fin de livraison de c1 par d3
  const multi = redisClient.multi();

  // 1. Passer le statut de c1 à "livrée"
  multi.hSet('commande:c1', 'statut', 'livrée');

  // 2. Retirer c1 du set "assignées" et l'ajouter à "livrées"
  multi.sRem('commandes:assignées', 'c1');
  multi.sAdd('commandes:livrées', 'c1');

  // 3. Décrémenter les livraisons en cours de d3
  multi.hIncrBy('livreur:d3', 'livraisons_en_cours', -1);

  // 4. Incrémenter les livraisons complétées de d3
  multi.hIncrBy('livreur:d3', 'livraisons_completees', 1);

  // 5. Supprimer la commande en cours de d3
  multi.hDel('livreur:d3', 'commande_en_cours');

  await multi.exec();
  console.log('✅ Livraison de c1 par d3 simulée avec succès !\n');

  // Vérifications
  const commande = await redisClient.hGetAll('commande:c1');
  console.log('📋 Statut de c1:', commande.statut);

  const livreur = await redisClient.hGetAll('livreur:d3');
  console.log('🚴 Livreur d3 après livraison:', livreur);

  await redisClient.disconnect();
}

simulerLivraison().catch(console.error);