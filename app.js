const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');

const app = express();
const PORT = 8080;


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar Handlebars
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Arrays 
let products = [];
let carts = [];

// Productos de ejemplo para probar la vista
products.push(
    {
        id: 1,
        title: "Laptop Gaming",
        description: "Laptop para gaming de alta gama",
        code: "LAPTOP001",
        price: 2000000,
        status: true,
        stock: 10,
        category: "Electrónicos",
        thumbnails: ["/images/laptop1.jpg", "/images/laptop2.jpg"]
    },
    {
        id: 2,
        title: "Mouse Inalámbrico",
        description: "Mouse gaming inalámbrico RGB",
        code: "MOUSE001",
        price: 50000,
        status: true,
        stock: 25,
        category: "Accesorios",
        thumbnails: ["/images/mouse1.jpg"]
    }
);

// Funciones auxiliares para generar IDs únicos
const generateProductId = () => {
    return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
};

const generateCartId = () => {
    return carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1;
};

// global
global.appData = {
    products,
    carts,
    generateProductId,
    generateCartId
};

// rutas
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);


app.get('/', (req, res) => {
    res.json({ 
        message: 'Servidor funcionando correctamente',
        endpoints: {
            products: '/api/products',
            carts: '/api/carts'
        }
    });
});

// Iniciar servidor HTTP + socket.io
const server = http.createServer(app);
const io = new Server(server);

// Inyectar io en las referencias globales para usar desde routers
global.appData.io = io;

// Socket handlers: actualizar clientes cuando haya cambios
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado, socket id=', socket.id);

    // Enviar la lista actual al conectar
    socket.emit('updateProducts', products);

    // Cuando se recibe una petición de agregar por socket
    socket.on('addProduct', (prod) => {
        try {
            const newProduct = {
                id: generateProductId(),
                title: prod.title,
                description: prod.description,
                code: prod.code,
                price: Number(prod.price) || 0,
                status: prod.status !== undefined ? Boolean(prod.status) : true,
                stock: Number(prod.stock) || 0,
                category: prod.category || 'General',
                thumbnails: prod.thumbnails || []
            };
            products.push(newProduct);
            io.emit('updateProducts', products);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // Cuando se recibe una petición de eliminar por socket
    socket.on('deleteProduct', (pid) => {
        const pidNum = Number(pid);
        const index = products.findIndex(p => p.id === pidNum);
        if (index !== -1) {
            products.splice(index, 1);
            io.emit('updateProducts', products);
        } else {
            socket.emit('error', { message: 'Producto no encontrado' });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// global
global.appData.products = products;
global.appData.carts = carts;