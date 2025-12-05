// routes/views.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Cart = require('../models/Cart');


router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, query, sort } = req.query;

        // Convertir a numeros
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

        // rdenamiento
        let sortOptions = {};
        if (sort === 'asc') {
            sortOptions.price = 1;
        } else if (sort === 'desc') {
            sortOptions.price = -1;
        }

        // skip
        const skip = (pageNum - 1) * limitNum;

        // consultaso
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

        // Construir URL
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

        
        const productsPlain = products.map(p => p.toObject());

        console.log('📊 Renderizando /products con:', { productsCount: productsPlain.length, totalPages });
        console.log('🔍 Primer producto:', productsPlain[0]);

        res.render('products', {
            products: productsPlain,
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
 
 */
router.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        // Objectid
        if (!pid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).render('error', { message: 'ID de producto inválido' });
        }

        const product = await Product.findById(pid);

        if (!product) {
            return res.status(404).render('error', { message: 'Producto no encontrado' });
        }

        
        const productPlain = product.toObject();
        res.render('productDetail', { product: productPlain });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

/**
 * GET /carts/:cid
 */
router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        // Objectid
        if (!cid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).render('error', { message: 'ID de carrito inválido' });
        }

        // p0pulate
        const cart = await Cart.findById(cid).populate('products.product');

        if (!cart) {
            return res.status(404).render('error', { message: 'Carrito no encontrado' });
        }

        // Calcular total del carrito
        const total = cart.products.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);

        const plainCart = cart.toObject();

        res.render('cart', { cart: plainCart, total });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

// Home: 
router.get('/home', async (req, res) => {
    try {
        const products = await Product.find();
         const plainProducts = products.map(p => p.toObject());
        res.render('home', { products: plainProducts });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

router.get('/demo', async (req, res) => {
    try {
        const { limit = 5, sort } = req.query;
        res.render('productosDemo', { limit, sort });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

// Vista en tiempo real 
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find();
      const plainProducts = products.map(p => p.toObject());
        res.render('realTimeProducts', { products: plainProducts });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

module.exports = router;
