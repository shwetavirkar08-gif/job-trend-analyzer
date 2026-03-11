const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.warn('MONGODB_URI not set. Please configure your MongoDB connection string in the environment.');
}

let client = null;
let db = null;

async function connectToDatabase() {
  if (db && client) {
    return db;
  }
  const mongoClient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  await mongoClient.connect();
  // Optional ping to verify connection
  await mongoClient.db('admin').command({ ping: 1 });
  console.log('✅ Connected to MongoDB (ping ok)');

  client = mongoClient;
  const dbName = process.env.MONGODB_DB || 'vedika';
  db = client.db(dbName);

  // Ensure indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return db;
}

async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  connectToDatabase,
  getDb,
  closeDatabase,
};


