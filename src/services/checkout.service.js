const pool = require('../../config/db');
const { addNotificationTask } = require('../queues/notification.queue');

class CheckoutService {
    async createOrder(userId, cartItems) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN'); // Start transaction isolation block
            
            let totalAmount = 0;
            const itemsToProcess = [];

            for (const item of cartItems) {
                const productRes = await client.query(
                    'SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE',
                    [item.productId]
                );

                if (productRes.rows.length === 0) {
                    throw new Error(`Product ID ${item.productId} does not exist.`);
                }

                const product = productRes.rows[0];

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
                }

                await client.query(
                    'UPDATE products SET stock = stock - $1 WHERE id = $2',
                    [item.quantity, item.productId]
                );

                totalAmount += Number(product.price) * item.quantity;
                itemsToProcess.push({
                    id: product.id,
                    quantity: item.quantity,
                    price: product.price
                });
            }

            const orderRes = await client.query(
                'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id',
                [userId, totalAmount, 'completed']
            );
            const orderId = orderRes.rows[0].id;

            for (const item of itemsToProcess) {
                await client.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
                    [orderId, item.id, item.quantity, item.price]
                );
            }

            await client.query('COMMIT');

            await addNotificationTask({ orderId, userId, totalAmount });

            return { orderId, totalAmount };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new CheckoutService();
