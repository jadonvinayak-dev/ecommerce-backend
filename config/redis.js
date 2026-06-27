const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null 
});

module.exports = redisConnection;
