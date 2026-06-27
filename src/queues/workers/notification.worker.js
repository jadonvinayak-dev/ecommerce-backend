const { Worker } = require('bullmq');
const redisConnection = require('../../../config/redis');

console.log('Background Worker Initialized. Waiting for jobs...');

const worker = new Worker('NotificationQueue', async (job) => {
    if (job.name === 'sendOrderConfirmation') {
        const { orderId, userId, totalAmount } = job.data;
        
        console.log(`[Worker] Job ${job.id}: Processing invoice email for Order #${orderId}...`);
        
        // Simulating 2-second external SMTP/API delay
        await new Promise((resolve) => setTimeout(resolve, 2000)); 
        
        console.log(`[Worker] Success: Invoice sent to User #${userId} for $${totalAmount}`);
    }
}, { connection: redisConnection });

worker.on('failed', (job, err) => {
    console.error(`[Worker] Critical: Job ${job.id} failed. Error: ${err.message}`);
});
