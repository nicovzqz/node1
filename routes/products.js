const express = require('express');
const router = express.Router();

// Acceder a los datos compartidos
const getAppData = () => global.appData;
const getProducts = () => getAppData().products;
const generateProductId = () => getAppData().generateProductId();

// Listar todos los productos
router.get('/', (req, res) => {
    try {
        res.json({
            status: 'success',
            payload: getProducts()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener productos',
            error: error.message
        });
    }
});

// Obtener producto por ID
router.get('/:pid', (req, res) => {
    try {
        const pid = parseInt(req.params.pid);
        const products = getProducts();
        const product = products.find(p => p.id === pid);
        
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
            message: 'Error al obtener producto',
            error: error.message
        });
    }
});

// Crear nuevo producto
router.post('/', (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        
        // Validar campos requeridos
        if (!title || !description || !code || price === undefined || stock === undefined || !category) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan campos requeridos: title, description, code, price, stock, category'
            });
        }
        
        // Verificar duplicado
        const products = getProducts();
        const existingProduct = products.find(p => p.code === code);
        if (existingProduct) {
            return res.status(400).json({
                status: 'error',
                message: 'Ya existe un producto con este código'
            });
        }
        
        // Crear nuevo producto
        const newProduct = {
            id: generateProductId(),
            title,
            description,
            code,
            price: Number(price),
            status: status !== undefined ? Boolean(status) : true,
            stock: Number(stock),
            category,
            thumbnails: thumbnails || []
        };
        
        products.push(newProduct);

        // Emitir actualización por websocket
        const io = getAppData().io;
        if (io) io.emit('updateProducts', products);
        
        res.status(201).json({
            status: 'success',
            message: 'Producto creado exitosamente',
            payload: newProduct
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al crear producto',
            error: error.message
        });
    }
});

// Actualizar producto por ID
router.put('/:pid', (req, res) => {
    try {
        const pid = parseInt(req.params.pid);
        const products = getProducts();
        const productIndex = products.findIndex(p => p.id === pid);
        
        if (productIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado'
            });
        }
        
        // No permitir actualizar el ID
        const { id, ...updateData } = req.body;
        
        // Actualizar solo los campos enviados
        const updatedProduct = { ...products[productIndex] };
        
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                if (key === 'price' || key === 'stock') {
                    updatedProduct[key] = Number(updateData[key]);
                } else if (key === 'status') {
                    updatedProduct[key] = Boolean(updateData[key]);
                } else {
                    updatedProduct[key] = updateData[key];
                }
            }
        });
        
        products[productIndex] = updatedProduct;

        // Emitir actualización por websocket
        const io = getAppData().io;
        if (io) io.emit('updateProducts', products);
        
        res.json({
            status: 'success',
            message: 'Producto actualizado exitosamente',
            payload: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al actualizar producto',
            error: error.message
        });
    }
});

// Eliminar producto por ID
router.delete('/:pid', (req, res) => {
    try {
        const pid = parseInt(req.params.pid);
        const products = getProducts();
        const productIndex = products.findIndex(p => p.id === pid);
        
        if (productIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado'
            });
        }
        
        const deletedProduct = products.splice(productIndex, 1)[0];

        // Emitir actualización por websocket
        const io = getAppData().io;
        if (io) io.emit('updateProducts', products);
        
        res.json({
            status: 'success',
            message: 'Producto eliminado exitosamente',
            payload: deletedProduct
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al eliminar producto',
            error: error.message
        });
    }
});

module.exports = router;