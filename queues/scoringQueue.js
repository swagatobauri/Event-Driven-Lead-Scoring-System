const Queue = require('bull');

const redisUrl = process.env.REDIS_URL;

console.log(redisUrl ? 'Using REDIS_URL from env' : 'Using Localhost Redis fallback');

const queueOptions = {
    redis: redisUrl ? {
        tls: { rejectUnauthorized: false } // Required for Upstash/Render securely
    } : {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
    },
    // Common settings for reliability
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 100,
    }
};

// If using REDIS_URL, pass it as the second argument, options as third
// If not, pass options as second
const scoringQueue = redisUrl
    ? new Queue('scoring-queue', redisUrl, queueOptions)
    : new Queue('scoring-queue', queueOptions);

module.exports = scoringQueue;
