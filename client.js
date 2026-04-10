require('dotenv').config();
const { createClient } = require('redis');
const { MongoClient } = require('mongodb');

const redisClient = createClient({ url: process.env.REDIS_URL });
const mongoClient = new MongoClient(process.env.MONGODB_URI);

async function connectAll() {
  await redisClient.connect();
  console.log('✅ Redis connecté');
  await mongoClient.connect();
  console.log('✅ MongoDB connecté');
}

module.exports = { redisClient, mongoClient, connectAll };