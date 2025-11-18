const express = require('express');
const router = express.Router();


const getAppData = () => global.appData;
const getCarts = () => getAppData().carts;
const getProducts = () => getAppData().products;
const generateCartId = () => getAppData().generateCartId();

// Crear carrito
router.post('/', (req, res) => {
    try {
        const carts = getCarts();
        const newCart = {
            id: generateCartId(),
            products: []
        };
        
        carts.push(newCart);
        
        res.status(201).json({
            status: 'success',
            message: 'Carrito creado exitosamente',
            payload: newCart
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al crear carrito',
            error: error.message
        });
    }
});

// Productos del carrito
router.get('/:cid', (req, res) => {
    try {
        const cid = parseInt(req.params.cid);
        const carts = getCarts();
        const products = getProducts();
        const cart = carts.find(c => c.id === cid);
        
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }
        
        
        const cartWithProductDetails = {
            id: cart.id,
            products: cart.products.map(cartProduct => {
                const productDetails = products.find(p => p.id === cartProduct.product);
                return {
                    product: productDetails || { id: cartProduct.product, title: 'Producto no encontrado' },
                    quantity: cartProduct.quantity
                };
            })
        };
        
        res.json({
            status: 'success',
            payload: cartWithProductDetails
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener carrito',
            error: error.message
        });
    }
});

// Agregar producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
    try {
        const cid = parseInt(req.params.cid);
        const pid = parseInt(req.params.pid);
        const carts = getCarts();
        const products = getProducts();
        
        
        const cartIndex = carts.findIndex(c => c.id === cid);
        if (cartIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }
        
        
        const product = products.find(p => p.id === pid);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado'
            });
        }
        
        // 
        const existingProductIndex = carts[cartIndex].products.findIndex(p => p.product === pid);
        
        if (existingProductIndex !== -1) {
            // incrementar la cantidad
            carts[cartIndex].products[existingProductIndex].quantity += 1;
        } else {
            // agregarlo con cantidad 1
            carts[cartIndex].products.push({
                product: pid,
                quantity: 1
            });
        }
        
        res.json({
            status: 'success',
            message: 'Producto agregado al carrito exitosamente',
            payload: carts[cartIndex]
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al agregar producto al carrito',
            error: error.message
        });
    }
});

module.exports = router;


