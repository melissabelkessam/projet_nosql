const { mongoClient, connectAll } = require('./client');

async function creerIndex() {
  await connectAll();
  const col = mongoClient.db('livraison').collection('deliveries');

  // Index simple sur driver_id
  await col.createIndex({ driver_id: 1 });
  console.log('✅ Index créé sur driver_id');

  // Index composé sur region + delivery_time
  await col.createIndex({ region: 1, delivery_time: 1 });
  console.log('✅ Index composé créé sur region + delivery_time');

  // Afficher tous les index de la collection
  const indexes = await col.indexes();
  console.log('\n📋 Index existants sur la collection deliveries :');
  indexes.forEach(idx => {
    console.log(`  - ${JSON.stringify(idx.key)} ${idx.name}`);
  });

  // Vérifier l'utilisation de l'index avec explain
  const explain = await col.find({ driver_id: 'd1' }).explain('executionStats');
  console.log('\n🔍 Plan d\'exécution pour driver_id = d1 :');
  console.log('  Index utilisé :', explain.queryPlanner.winningPlan.inputStage?.indexName || 'IXSCAN');
  console.log('  Docs examinés :', explain.executionStats.totalDocsExamined);
  console.log('  Docs retournés:', explain.executionStats.totalDocsReturned);

  await mongoClient.close();
}

creerIndex().catch(console.error);
