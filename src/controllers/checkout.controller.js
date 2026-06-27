const checkoutService = require('../services/checkout.service');

exports.processCheckout = async (req, res, next) => {
    try {
        const { userId, cartItems } = req.body;

        if (!userId || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid payload components structure." });
        }

        const orderDetails = await checkoutService.createOrder(userId, cartItems);

        return res.status(201).json({
            success: true,
            message: 'Order created successfully and locked down.',
            data: orderDetails
        });
    } catch (error) {
        next(error);
    }
};
