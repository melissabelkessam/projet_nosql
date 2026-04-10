const { redisClient, mongoClient, connectAll } = require('./client');

async function cloturerLivraison(commandeId, livreurId, rating, review) {
  await connectAll();

  const col = mongoClient.db('livraison').collection('deliveries');

  // 1. Récupérer les infos depuis Redis
  const commande = await redisClient.hGetAll(`commande:${commandeId}`);
  const livreur  = await redisClient.hGetAll(`livreur:${livreurId}`);

  console.log(`📦 Clôture de ${commandeId} par ${livreurId}...`);

  // 2. Transaction Redis : mettre à jour les statuts
  const multi = redisClient.multi();
  multi.hSet(`commande:${commandeId}`, 'statut', 'livrée');
  multi.sRem('commandes:assignées', commandeId);
  multi.sAdd('commandes:livrées', commandeId);
  multi.hIncrBy(`livreur:${livreurId}`, 'livraisons_en_cours', -1);
  multi.hIncrBy(`livreur:${livreurId}`, 'livraisons_completees', 1);
  multi.hDel(`livreur:${livreurId}`, 'commande_en_cours');
  await multi.exec();
  console.log('✅ Redis mis à jour');

  // 3. Insérer dans MongoDB
  const now = new Date();
  const pickup = new Date(now.getTime() - 20 * 60000);

  await col.insertOne({
    command_id:       commandeId,
    client:           commande.client,
    driver_id:        livreurId,
    driver_name:      livreur.nom,
    pickup_time:      pickup,
    delivery_time:    now,
    duration_minutes: 20,
    amount:           Number(commande.montant),
    region:           livreur.region,
    rating:           rating,
    review:           review,
    status:           'completed'
  });
  console.log('✅ Livraison sauvegardée dans MongoDB');

  // 4. Vérification
  const doc = await col.findOne({ command_id: commandeId, driver_id: livreurId });
  console.log('\n📋 Document inséré dans MongoDB :');
  console.log(`  command_id : ${doc.command_id}`);
  console.log(`  driver     : ${doc.driver_name}`);
  console.log(`  montant    : ${doc.amount}€`);
  console.log(`  rating     : ${doc.rating}`);
  console.log(`  review     : ${doc.review}`);
  console.log(`  status     : ${doc.status}`);

  await redisClient.disconnect();
  await mongoClient.close();
}

// Simuler la clôture de c2 par d1
cloturerLivraison('c2', 'd1', 4.7, 'Bonne livraison, merci !').catch(console.error);