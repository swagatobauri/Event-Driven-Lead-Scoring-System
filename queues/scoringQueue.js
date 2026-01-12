const Queue = require('bull');

// Initialize the queue
// Assumes Redis is running on default port 6379 locally
const scoringQueue = new Queue('scoring-queue', process.env.REDIS_URL || {
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
    }
});

module.exports = scoringQueue;
