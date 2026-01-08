const Queue = require('bull');

const testQueue = new Queue('test-connection', {
    redis: { port: 6379, host: '127.0.0.1' },
    settings: {
        maxStalledCount: 0
    }
});

console.log('Attempting to connect to Redis...');

testQueue.client.on('ready', () => {
    console.log('Redis connected successfully!');
    testQueue.close().then(() => process.exit(0));
});

testQueue.client.on('error', (err) => {
    console.error('Redis connection error:', err.message);
    testQueue.close().then(() => process.exit(1));
});

setTimeout(() => {
    console.error('Timeout waiting for Redis connection.');
    process.exit(1);
}, 5000);
