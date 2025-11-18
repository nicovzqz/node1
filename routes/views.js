const express = require('express');
const router = express.Router();

const getAppData = () => global.appData;
const getProducts = () => getAppData().products;

// Home: muestra lista de productos renderizada en server
router.get('/home', (req, res) => {
    const products = getProducts();
    res.render('home', { products });
});

// Vista en tiempo real con sockets
router.get('/realtimeproducts', (req, res) => {
    const products = getProducts();
    res.render('realTimeProducts', { products });
});

module.exports = router;