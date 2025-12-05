// routes/carts.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * POST /api/carts/
 * Crea un nuevo carrito vacío
 */
router.post('/', async (req, res) => {
    try {
        const newCart = new Cart({
            products: []
        });

        await newCart.save();

        res.status(201).json({
            status: 'success',
            message: 'Carrito creado exitosamente',
            payload: newCart
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * GET /api/carts/:cid
 * Obtiene los productos de un carrito específico con populate
 */
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        // Validar que sea un ObjectId válido
        if (!cid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de carrito inválido'
            });
        }

        // Usar populate para obtener los detalles completos de los productos
        const cart = await Cart.findById(cid).populate('products.product');

        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        res.json({
            status: 'success',
            payload: cart
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * POST /api/carts/:cid/product/:pid
 * Agrega un producto al carrito o incrementa su cantidad si ya existe
 */
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        // Validar que sean ObjectIds válidos
        if (!cid.match(/^[0-9a-fA-F]{24}$/) || !pid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de carrito o producto inválido'
            });
        }

        // Verificar que exista el carrito
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        // Verificar que exista el producto
        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado'
            });
        }

        // Buscar si el producto ya está en el carrito
        const existingProductIndex = cart.products.findIndex(
            p => p.product.toString() === pid
        );

        if (existingProductIndex !== -1) {
            // Incrementar cantidad
            cart.products[existingProductIndex].quantity += 1;
        } else {
            // Agregar nuevo producto
            cart.products.push({
                product: pid,
                quantity: 1
            });
        }

        await cart.save();

        // Populate para devolver los detalles completos
        await cart.populate('products.product');

        res.json({
            status: 'success',
            message: 'Producto agregado al carrito exitosamente',
            payload: cart
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * DELETE /api/carts/:cid/products/:pid
 * Elimina un producto específico del carrito
 */
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        // Validar que sean ObjectIds válidos
        if (!cid.match(/^[0-9a-fA-F]{24}$/) || !pid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de carrito o producto inválido'
            });
        }

        // Buscar el carrito
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        // Filtrar el producto del carrito
        const initialLength = cart.products.length;
        cart.products = cart.products.filter(
            p => p.product.toString() !== pid
        );

        if (cart.products.length === initialLength) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado en el carrito'
            });
        }

        await cart.save();

        // Populate para devolver los detalles completos
        await cart.populate('products.product');

        res.json({
            status: 'success',
            message: 'Producto eliminado del carrito exitosamente',
            payload: cart
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * PUT /api/carts/:cid
 * Actualiza todos los productos del carrito con un arreglo de productos
 * Body esperado: { products: [ { product: ID, quantity: N }, ... ] }
 */
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        // Validar que sea un ObjectId válido
        if (!cid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de carrito inválido'
            });
        }

        // Validar que se proporcione un array de productos
        if (!Array.isArray(products)) {
            return res.status(400).json({
                status: 'error',
                message: 'El body debe contener un array de productos'
            });
        }

        // Buscar el carrito
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        // Reemplazar los productos
        cart.products = products;
        await cart.save();

        // Populate para devolver los detalles completos
        await cart.populate('products.product');

        res.json({
            status: 'success',
            message: 'Carrito actualizado exitosamente',
            payload: cart
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * PUT /api/carts/:cid/products/:pid
 * Actualiza SOLO la cantidad de un producto en el carrito
 * Body esperado: { quantity: N }
 */
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        // Validar que sean ObjectIds válidos
        if (!cid.match(/^[0-9a-fA-F]{24}$/) || !pid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de carrito o producto inválido'
            });
        }

        // Validar que se proporcione una cantidad válida
        if (quantity === undefined || Number(quantity) < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'La cantidad debe ser un número mayor a 0'
            });
        }

        // Buscar el carrito
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        // Buscar el producto en el carrito
        const productIndex = cart.products.findIndex(
            p => p.product.toString() === pid
        );

        if (productIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado en el carrito'
            });
        }

        // Actualizar la cantidad
        cart.products[productIndex].quantity = Number(quantity);
        await cart.save();

        // Populate para devolver los detalles completos
        await cart.populate('products.product');

        res.json({
            status: 'success',
            message: 'Cantidad actualizada exitosamente',
            payload: cart
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * DELETE /api/carts/:cid
 * Elimina todos los productos del carrito
 */
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        // Validar que sea un ObjectId válido
        if (!cid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de carrito inválido'
            });
        }

        // Buscar y vaciar el carrito
        const cart = await Cart.findByIdAndUpdate(
            cid,
            { products: [] },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        res.json({
            status: 'success',
            message: 'Carrito vaciado exitosamente',
            payload: cart
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;


