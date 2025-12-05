// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * GET /api/products/
 * Obtiene productos con filtrado, paginación y ordenamiento
 * Query params:
 *  - limit: número de elementos por página (default: 10)
 *  - page: página a buscar (default: 1)
 *  - query: filtro por categoría o disponibilidad (e.g., "category=Electrónicos" o "status=true")
 *  - sort: ordenamiento por precio (asc/desc)
 */
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, query, sort } = req.query;

        // Convertir a números
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Number(limit));

        // Construir filtro
        let filter = {};

        if (query) {
            // Permitir búsqueda por categoría o estado
            if (query.includes('=')) {
                const [key, value] = query.split('=');
                if (key === 'category') {
                    filter.category = { $regex: value, $options: 'i' }; // búsqueda insensible a mayúsculas
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

        // Respuesta estructurada según especificación
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
 * Obtiene un producto específico por ID
 */
router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        // Validar que sea un ObjectId válido
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
 * Crea un nuevo producto
 */
router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;

        // Validar campos requeridos
        if (!title || !description || !code || price === undefined || stock === undefined || !category) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan campos requeridos: title, description, code, price, stock, category'
            });
        }

        // Verificar que el código sea único
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

        // Emitir evento a todos los clientes conectados
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

        // Validar que sea un ObjectId válido
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

        // Emitir evento a todos los clientes conectados
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

        // Validar que sea un ObjectId válido
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

        // Emitir evento a todos los clientes conectados
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