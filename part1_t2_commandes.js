const { redisClient, connectAll } = require('./client');

async function initCommandes() {
  await connectAll();

  const commandes = [
    { id: 'c1', client: 'Client A', destination: 'Marais',     montant: 25, creee: '14:00' },
    { id: 'c2', client: 'Client B', destination: 'Belleville', montant: 15, creee: '14:05' },
    { id: 'c3', client: 'Client C', destination: 'Bercy',      montant: 30, creee: '14:10' },
    { id: 'c4', client: 'Client D', destination: 'Auteuil',    montant: 20, creee: '14:15' },
    { id: 'c5', client: 'Client E', destination: 'Marais',     montant: 35, creee: '14:20' },
    { id: 'c6', client: 'Client F', destination: 'Belleville', montant: 18, creee: '14:25' },
  ];

  for (const c of commandes) {
    // Hash pour stocker les infos de la commande
    await redisClient.hSet(`commande:${c.id}`, {
      client: c.client,
      destination: c.destination,
      montant: c.montant,
      creee: c.creee,
      statut: 'en_attente'
    });

    // Set pour regrouper les commandes par statut
    await redisClient.sAdd('commandes:en_attente', c.id);
  }

  console.log('✅ Commandes initialisées\n');

  // Afficher toutes les commandes en attente
  const enAttente = await redisClient.sMembers('commandes:en_attente');
  console.log('📋 Commandes en attente:', enAttente);

  // Afficher les détails d'une commande
  const details = await redisClient.hGetAll('commande:c1');
  console.log('\n🔍 Détails de c1:', details);

  await redisClient.disconnect();
}

initCommandes().catch(console.error);