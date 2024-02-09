const redis = require('redis');

// Configure Redis client
const redisClient = redis.createClient({
  password: process.env.REDIS_PASS,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  }
});

redisClient.on('error', (error) => {
  console.error(error);
});

redisClient.connect().catch(console.error);

module.exports = redisClient;
