const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkout.controller');
const rateLimiter = require('../middlewares/rateLimiter');


router.post('/checkout', rateLimiter(5, 60), checkoutController.processCheckout);

module.exports = router;
