const { Queue } = require('bullmq');
const redisConnection = require('../../config/redis');

const notificationQueue = new Queue('NotificationQueue', { 
    connection: redisConnection 
});

async function addNotificationTask(data) {
    await notificationQueue.add('sendOrderConfirmation', data, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        }
    });
}

module.exports = { addNotificationTask };
