const { redisClient, connectAll } = require('./client');

async function dashboardGlobal() {
  await connectAll();

  console.log('═══════════════════════════════════════');
  console.log('       📊 DASHBOARD TEMPS RÉEL         ');
  console.log('═══════════════════════════════════════\n');

  // 1. Nombre de commandes par statut
  const enAttente  = await redisClient.sCard('commandes:en_attente');
  const assignees  = await redisClient.sCard('commandes:assignées');
  const livrees    = await redisClient.sCard('commandes:livrées');

  console.log('📦 Commandes par statut :');
  console.log(`  🟡 En attente : ${enAttente}`);
  console.log(`  🔵 Assignées  : ${assignees}`);
  console.log(`  🟢 Livrées    : ${livrees}`);

  // 2. Livraisons en cours par livreur
  console.log('\n🚴 Livraisons en cours par livreur :');
  const livreurIds = ['d1','d2','d3','d4','d5','d6'];
  for (const id of livreurIds) {
    const data = await redisClient.hGetAll(`livreur:${id}`);
    console.log(`  ${id} - ${data.nom} : ${data.livraisons_en_cours} en cours, ${data.livraisons_completees} complétées`);
  }

  // 3. Top 2 meilleurs livreurs
  const top2 = await redisClient.zRangeWithScores('livreurs:rating', -2, -1);
  console.log('\n🏆 Top 2 meilleurs livreurs :');
  top2.reverse().forEach((l, i) => {
    console.log(`  ${i+1}. ${l.value} → rating ${l.score}`);
  });

  console.log('\n═══════════════════════════════════════');
  await redisClient.disconnect();
}

dashboardGlobal().catch(console.error);