// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');


router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, query, sort } = req.query;

        // Convertir a num
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Number(limit));

        // filtro
        let filter = {};

        if (query) {
            if (query.includes('=')) {
                const [key, value] = query.split('=');
                if (key === 'category') {
                    filter.category = { $regex: value, $options: 'i' }; // búsqueda insensible a mayúsculas
                } else if (key === 'status') {
                    filter.status = value === 'true';
                }
            }
        }

        // ordenamiento
        let sortOptions = {};
        if (sort === 'asc') {
            sortOptions.price = 1;
        } else if (sort === 'desc') {
            sortOptions.price = -1;
        }

        // skip
        const skip = (pageNum - 1) * limitNum;

       
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

        // Construir links
        const baseUrl = `${req.protocol}://${req.get('host')}/api/products`;
        const queryParams = query ? `&query=${query}` : '';
        const sortParams = sort ? `&sort=${sort}` : '';
        const limitParams = `&limit=${limitNum}`;

        const prevLink = hasPrevPage
            ? `${baseUrl}?page=${pageNum - 1}${limitParams}${queryParams}${sortParams}`
            : null;

        const nextLink = hasNextPage
            ? `${baseUrl}?page=${pageNum + 1}${limitParams}${queryParams}${sortParams}`
            : null;

        // Respuesta 
        res.json({
            status: 'success',
            payload: products,
            totalPages,
            prevPage: hasPrevPage ? pageNum - 1 : null,
            nextPage: hasNextPage ? pageNum + 1 : null,
            page: pageNum,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * GET /api/products/:pid
 * Obtiene un producto x ID
 */
router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        // ObjectId
        if (!pid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de producto inválido'
            });
        }

        const product = await Product.findById(pid);

        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado'
            });
        }

        res.json({
            status: 'success',
            payload: product
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * POST /api/products/
 * Crea nuevo producto
 */
router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;

        // Validar 
        if (!title || !description || !code || price === undefined || stock === undefined || !category) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan campos requeridos: title, description, code, price, stock, category'
            });
        }

        // Verificr
        const existingProduct = await Product.findOne({ code });
        if (existingProduct) {
            return res.status(400).json({
                status: 'error',
                message: 'El código del producto ya existe'
            });
        }

        // Crear nuevo producto
        const newProduct = new Product({
            title,
            description,
            code,
            price: Number(price),
            status: status !== undefined ? Boolean(status) : true,
            stock: Number(stock),
            category,
            thumbnails: thumbnails || []
        });

        await newProduct.save();

        
        if (global.appData.io) {
            const allProducts = await Product.find();
            global.appData.io.emit('updateProducts', allProducts);
        }

        res.status(201).json({
            status: 'success',
            message: 'Producto creado exitosamente',
            payload: newProduct
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * PUT /api/products/:pid
 * Actualiza un producto existente
 */
router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        // ObjectId
        if (!pid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de producto inválido'
            });
        }

        // No permitir actualizar el ID
        const updateData = { ...req.body };
        delete updateData._id;

        const updatedProduct = await Product.findByIdAndUpdate(
            pid,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado'
            });
        }

        
        if (global.appData.io) {
            const allProducts = await Product.find();
            global.appData.io.emit('updateProducts', allProducts);
        }

        res.json({
            status: 'success',
            message: 'Producto actualizado exitosamente',
            payload: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * DELETE /api/products/:pid
 * Elimina un producto
 */
router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        // Objectid
        if (!pid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de producto inválido'
            });
        }

        const deletedProduct = await Product.findByIdAndDelete(pid);

        if (!deletedProduct) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado'
            });
        }

       
        if (global.appData.io) {
            const allProducts = await Product.find();
            global.appData.io.emit('updateProducts', allProducts);
        }

        res.json({
            status: 'success',
            message: 'Producto eliminado exitosamente',
            payload: deletedProduct
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
