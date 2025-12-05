// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

// Importar modelos
const Product = require('./models/Product');
const Cart = require('./models/Cart');

// Conectar a MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('✅ Conectado a MongoDB');
        // Seeding de productos de ejemplo si la BD está vacía
        seedDatabase();
    })
    .catch((err) => {
        console.error('❌ Error conectando a MongoDB:', err);
        process.exit(1);
    });

// Función para poblar la BD con datos iniciales
async function seedDatabase() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log('📝 Sembrando base de datos con productos iniciales...');
            await Product.insertMany([
                {
                    title: "Laptop Gaming",
                    description: "Laptop para gaming de alta gama con procesador Intel i9",
                    code: "LAPTOP001",
                    price: 2000000,
                    status: true,
                    stock: 10,
                    category: "Electrónicos",
                    thumbnails: ["/images/laptop1.jpg"]
                },
                {
                    title: "Mouse Inalámbrico",
                    description: "Mouse gaming inalámbrico con RGB y 8000 DPI",
                    code: "MOUSE001",
                    price: 50000,
                    status: true,
                    stock: 25,
                    category: "Accesorios",
                    thumbnails: ["/images/mouse1.jpg"]
                },
                {
                    title: "Teclado Mecánico",
                    description: "Teclado mecánico RGB con switches Cherry MX",
                    code: "KEYBOARD001",
                    price: 150000,
                    status: true,
                    stock: 15,
                    category: "Accesorios",
                    thumbnails: ["/images/keyboard1.jpg"]
                },
                {
                    title: "Monitor 4K",
                    description: "Monitor 4K de 27 pulgadas con 144Hz",
                    code: "MONITOR001",
                    price: 800000,
                    status: true,
                    stock: 8,
                    category: "Electrónicos",
                    thumbnails: ["/images/monitor1.jpg"]
                },
                {
                    title: "Auriculares Wireless",
                    description: "Auriculares inalámbricos con cancelación de ruido",
                    code: "HEADPHONES001",
                    price: 200000,
                    status: true,
                    stock: 20,
                    category: "Accesorios",
                    thumbnails: ["/images/headphones1.jpg"]
                }
            ]);
            console.log('✅ Productos iniciales insertados');
        }
    } catch (error) {
        console.error('❌ Error al sembrar BD:', error);
    }
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar Handlebars con helpers
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        multiply: (a, b) => a * b,
        eq: (a, b) => a === b
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// global - para acceder a io y modelos desde routers
global.appData = {
    Product,
    Cart
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
    console.log('🔌 Nuevo cliente conectado, socket id=', socket.id);

    // Enviar la lista actual al conectar
    Product.find().then(products => {
        socket.emit('updateProducts', products);
    });

    // Cuando se recibe una petición de agregar por socket
    socket.on('addProduct', async (prod) => {
        try {
            const newProduct = new Product({
                title: prod.title,
                description: prod.description,
                code: prod.code,
                price: Number(prod.price) || 0,
                status: prod.status !== undefined ? Boolean(prod.status) : true,
                stock: Number(prod.stock) || 0,
                category: prod.category || 'General',
                thumbnails: prod.thumbnails || []
            });
            await newProduct.save();
            const allProducts = await Product.find();
            io.emit('updateProducts', allProducts);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // Cuando se recibe una petición de eliminar por socket
    socket.on('deleteProduct', async (pid) => {
        try {
            await Product.findByIdAndDelete(pid);
            const allProducts = await Product.find();
            io.emit('updateProducts', allProducts);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});