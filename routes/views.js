// routes/views.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Cart = require('../models/Cart');

/**
 * GET /products
 * Muestra lista de productos con paginación, filtros y ordenamiento
 * Query params: limit, page, query, sort
 */
router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, query, sort } = req.query;

        // Convertir a números
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Number(limit));

        // Construir filtro
        let filter = {};

        if (query) {
            if (query.includes('=')) {
                const [key, value] = query.split('=');
                if (key === 'category') {
                    filter.category = { $regex: value, $options: 'i' };
                } else if (key === 'status') {
                    filter.status = value === 'true';
                }
            }
        }

        // Construir opciones de ordenamiento
        let sortOptions = {};
        if (sort === 'asc') {
            sortOptions.price = 1;
        } else if (sort === 'desc') {
            sortOptions.price = -1;
        }

        // Calcular skip
        const skip = (pageNum - 1) * limitNum;

        // Ejecutar consultas en paralelo
        const [products, totalProducts] = await Promise.all([
            Product.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum),
            Product.countDocuments(filter)
        ]);

        // Calcular totales
        const totalPages = Math.ceil(totalProducts / limitNum);
        const hasPrevPage = pageNum > 1;
        const hasNextPage = pageNum < totalPages;

        // Construir URLs para navegación
        const baseUrl = `/products`;
        const queryParams = query ? `&query=${query}` : '';
        const sortParams = sort ? `&sort=${sort}` : '';
        const limitParams = `&limit=${limitNum}`;

        const prevLink = hasPrevPage
            ? `${baseUrl}?page=${pageNum - 1}${limitParams}${queryParams}${sortParams}`
            : null;

        const nextLink = hasNextPage
            ? `${baseUrl}?page=${pageNum + 1}${limitParams}${queryParams}${sortParams}`
            : null;

        res.render('products', {
            products,
            totalPages,
            page: pageNum,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
            limit: limitNum,
            currentQuery: query || '',
            currentSort: sort || ''
        });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

/**
 * GET /products/:pid
 * Muestra detalles completos de un producto específico
 */
router.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        // Validar que sea un ObjectId válido
        if (!pid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).render('error', { message: 'ID de producto inválido' });
        }

        const product = await Product.findById(pid);

        if (!product) {
            return res.status(404).render('error', { message: 'Producto no encontrado' });
        }

        res.render('productDetail', { product });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

/**
 * GET /carts/:cid
 * Muestra los productos de un carrito específico
 */
router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        // Validar que sea un ObjectId válido
        if (!cid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).render('error', { message: 'ID de carrito inválido' });
        }

        // Usar populate para obtener detalles completos de los productos
        const cart = await Cart.findById(cid).populate('products.product');

        if (!cart) {
            return res.status(404).render('error', { message: 'Carrito no encontrado' });
        }

        // Calcular total del carrito
        const total = cart.products.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);

        res.render('cart', { cart, total });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

// Home: muestra lista de productos renderizada en server (mantener para compatibilidad)
router.get('/home', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('home', { products });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

// Vista en tiempo real con sockets (mantener para compatibilidad)
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

module.exports = router;