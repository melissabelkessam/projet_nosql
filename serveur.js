const express = require('express');
const { redisClient, mongoClient, connectAll } = require('./client');
const path = require('path');

const app = express();
app.use(express.static('public'));

app.get('/api/dashboard', async (req, res) => {
  try {
    // Livreurs
    const livreurIds = ['d1','d2','d3','d4','d5','d6'];
    const livreurs = [];
    for (const id of livreurIds) {
      const data = await redisClient.hGetAll(`livreur:${id}`);
      const rating = await redisClient.zScore('livreurs:rating', id);
      livreurs.push({ id, ...data, rating });
    }

    // Commandes par statut
    const enAttente = await redisClient.sMembers('commandes:en_attente');
    const assignees = await redisClient.sMembers('commandes:assignées');
    const livrees   = await redisClient.sMembers('commandes:livrées');

    // Details commandes
    const toutesCommandes = [...enAttente, ...assignees, ...livrees];
    const commandes = [];
    for (const id of toutesCommandes) {
      const data = await redisClient.hGetAll(`commande:${id}`);
      commandes.push({ id, ...data });
    }

    // Top 2 livreurs
    const top2 = await redisClient.zRangeWithScores('livreurs:rating', -2, -1);

    // Stats MongoDB
    const col = mongoClient.db('livraison').collection('deliveries');
    const totalLivraisons = await col.countDocuments();
    const statsRegions = await col.aggregate([
      { $group: { _id: '$region', revenu: { $sum: '$amount' }, nombre: { $sum: 1 } } }
    ]).toArray();

    res.json({ livreurs, commandes, enAttente, assignees, livrees, top2, totalLivraisons, statsRegions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

connectAll().then(() => {
  app.listen(3000, () => console.log('Interface disponible sur http://localhost:3000'));
});