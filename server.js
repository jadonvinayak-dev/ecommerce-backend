const express = require('express');
const dotenv = require('dotenv');
const checkoutRoutes = require('./src/routes/checkout.routes');
const errorHandler = require('./src/middlewares/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', checkoutRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`📡 Main API cluster server running live on port ${PORT}`);
});
