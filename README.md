# Servidor Node.js con Express - API de Productos y Carritos (Entrega Final)

## 📋 Descripción

Servidor profesional desarrollado con **Node.js**, **Express** y **MongoDB** que proporciona una API REST completa para el manejo de productos y carritos de compra con funcionalidades avanzadas como filtrado, paginación, ordenamiento y vistas en tiempo real con WebSockets.

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm (incluido con Node.js)
- MongoDB (local o conexión remota)

### Pasos para ejecutar

1. **Clonar o descargar el proyecto**
2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crear archivo `.env` en la raíz del proyecto:
   ```env
   MONGO_URI=mongodb://localhost:27017/ecommerce
   MONGO_DB_NAME=ecommerce
   PORT=8080
   NODE_ENV=development
   ```

4. **Asegurarse de que MongoDB esté ejecutándose:**
   ```bash
   # En Windows
   mongod
   
   # En macOS (con Homebrew)
   brew services start mongodb-community
   
   # En Linux
   sudo systemctl start mongod
   ```

5. **Iniciar el servidor:**
   ```bash
   npm start
   ```
   o
   ```bash
   node app.js
   ```

El servidor se ejecutará en `http://localhost:8080`

## 🌐 Vistas Disponibles

- `GET /products` — Catálogo de productos con paginación, filtros y ordenamiento
- `GET /products/:pid` — Detalles completos de un producto específico
- `GET /carts/:cid` — Visualización de un carrito con todos sus productos
- `GET /home` — Lista simple de productos (compatibilidad)
- `GET /realtimeproducts` — Vista en tiempo real con WebSockets

## 📚 Endpoints de la API

### 🛍️ Productos (`/api/products`)

#### `GET /api/products/`
Obtiene todos los productos con filtrado, paginación y ordenamiento profesional.

**Query params:**
- `limit` (opcional, default: 10): Número de productos por página
- `page` (opcional, default: 1): Número de página
- `query` (opcional): Filtro en formato `key=value` (ej: `category=Electrónicos`, `status=true`)
- `sort` (opcional): Ordenamiento por precio (`asc` para menor a mayor, `desc` para mayor a menor)

**Respuesta exitosa:**
```json
{
  "status": "success",
  "payload": [ /* array de productos */ ],
  "totalPages": 3,
  "prevPage": null,
  "nextPage": 2,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevLink": null,
  "nextLink": "http://localhost:8080/api/products?page=2&limit=10"
}
```

**Ejemplos de uso:**
```bash
# Todos los productos (página 1, 10 por página)
GET /api/products

# Con paginación personalizada
GET /api/products?limit=5&page=2

# Filtrar por categoría
GET /api/products?query=category=Electrónicos

# Ordenar por precio de menor a mayor
GET /api/products?sort=asc

# Combinar todos los filtros
GET /api/products?limit=10&page=1&query=category=Accesorios&sort=desc
```

#### `GET /api/products/:pid`
Obtiene un producto específico por su ID.

**Parámetros:**
- `pid`: ID del producto (ObjectId de MongoDB)

**Respuesta exitosa:**
```json
{
  "status": "success",
  "payload": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Laptop Gaming",
    "description": "Laptop para gaming de alta gama",
    "code": "LAPTOP001",
    "price": 2000000,
    "status": true,
    "stock": 10,
    "category": "Electrónicos",
    "thumbnails": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### `POST /api/products/`
Crea un nuevo producto.

**Body requerido:**
```json
{
  "title": "Nombre del producto",
  "description": "Descripción del producto",
  "code": "PROD001",
  "price": 100,
  "status": true,
  "stock": 50,
  "category": "Categoría",
  "thumbnails": ["ruta/imagen1.jpg"]
}
```

**Campos obligatorios:** `title`, `description`, `code`, `price`, `stock`, `category`

#### `PUT /api/products/:pid`
Actualiza un producto existente.

**Parámetros:**
- `pid`: ID del producto a actualizar

**Body:** Cualquier combinación de campos del producto

#### `DELETE /api/products/:pid`
Elimina un producto.

**Parámetros:**
- `pid`: ID del producto a eliminar

### 🛒 Carritos (`/api/carts`)

#### `POST /api/carts/`
Crea un nuevo carrito vacío.

**Respuesta:**
```json
{
  "status": "success",
  "message": "Carrito creado exitosamente",
  "payload": {
    "_id": "507f1f77bcf86cd799439012",
    "products": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### `GET /api/carts/:cid`
Obtiene los productos de un carrito específico con detalles completos (populate).

**Parámetros:**
- `cid`: ID del carrito

**Respuesta:**
```json
{
  "status": "success",
  "payload": {
    "_id": "507f1f77bcf86cd799439012",
    "products": [
      {
        "product": {
          "_id": "507f1f77bcf86cd799439011",
          "title": "Laptop Gaming",
          "price": 2000000,
          // ... otros campos del producto
        },
        "quantity": 2
      }
    ]
  }
}
```

#### `POST /api/carts/:cid/product/:pid`
Agrega un producto al carrito o incrementa su cantidad.

**Parámetros:**
- `cid`: ID del carrito
- `pid`: ID del producto

**Comportamiento:**
- Si el producto no existe en el carrito: se agrega con cantidad 1
- Si el producto ya existe: se incrementa la cantidad en 1

#### `DELETE /api/carts/:cid/products/:pid`
Elimina un producto específico del carrito.

**Parámetros:**
- `cid`: ID del carrito
- `pid`: ID del producto a eliminar

#### `PUT /api/carts/:cid`
Actualiza todos los productos del carrito con un nuevo array.

**Body requerido:**
```json
{
  "products": [
    {
      "product": "507f1f77bcf86cd799439011",
      "quantity": 2
    },
    {
      "product": "507f1f77bcf86cd799439012",
      "quantity": 1
    }
  ]
}
```

#### `PUT /api/carts/:cid/products/:pid`
Actualiza SOLO la cantidad de un producto en el carrito.

**Body requerido:**
```json
{
  "quantity": 5
}
```

#### `DELETE /api/carts/:cid`
Elimina todos los productos del carrito (lo vacía).

**Parámetros:**
- `cid`: ID del carrito

## 🗂️ Estructura del Proyecto

```
node/
├── app.js                          # Servidor principal con Express y Socket.IO
├── models/
│   ├── Product.js                  # Esquema de Producto (Mongoose)
│   └── Cart.js                     # Esquema de Carrito (Mongoose)
├── routes/
│   ├── products.js                 # Rutas de API REST para productos
│   ├── carts.js                    # Rutas de API REST para carritos
│   └── views.js                    # Rutas para vistas Handlebars
├── views/
│   ├── layouts/
│   │   └── main.handlebars         # Layout principal
│   ├── products.handlebars         # Vista de catálogo con paginación
│   ├── productDetail.handlebars    # Vista de detalle del producto
│   ├── cart.handlebars             # Vista del carrito
│   ├── home.handlebars             # Vista simple de productos
│   ├── realTimeProducts.handlebars # Vista en tiempo real
│   └── error.handlebars            # Vista de errores
├── public/
│   └── js/
│       └── realtimeProducts.js     # Cliente Socket.IO
├── .env                            # Variables de entorno
├── .gitignore                      # Archivos ignorados por Git
├── package.json                    # Configuración del proyecto
└── README.md                       # Este archivo
```

## 💾 Base de Datos

### Conexión a MongoDB

La aplicación se conecta a MongoDB utilizando Mongoose. La configuración se realiza a través de la variable `MONGO_URI` en el archivo `.env`.

**Esquema de Producto:**
```javascript
{
  title: String (requerido),
  description: String (requerido),
  code: String (requerido, único),
  price: Number (requerido),
  status: Boolean (default: true),
  stock: Number (requerido),
  category: String (requerido),
  thumbnails: [String],
  createdAt: Date,
  updatedAt: Date
}
```

**Esquema de Carrito:**
```javascript
{
  products: [
    {
      product: ObjectId (referencia a Product),
      quantity: Number,
      _id: false
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Características Técnicas

- **Framework:** Express.js v5.1.0
- **Base de datos:** MongoDB con Mongoose
- **Template Engine:** Express-Handlebars
- **WebSockets:** Socket.IO para vistas en tiempo real
- **Puerto:** 8080 (configurable)
- **Validaciones:** Campos requeridos, códigos únicos, validaciones de Mongoose
- **Manejo de errores:** Respuestas JSON estructuradas
- **Populate:** Uso de populate en Mongoose para obtener referencias completas

## ✨ Funcionalidades Principales

### Filtrado de Productos
- Búsqueda por **categoría** (case-insensitive)
- Búsqueda por **estado** (disponibilidad)
- Combinable con otros filtros

### Paginación
- `limit`: Controla cantidad de elementos por página
- `page`: Especifica qué página obtener
- Incluye información de páginas anteriores/siguientes
- Links directos para navegación

### Ordenamiento
- **Ascendente (asc):** Menor precio primero
- **Descendente (desc):** Mayor precio primero
- Aplicable a cualquier consulta

### Gestión de Carritos
- Crear carritos nuevos
- Agregar/eliminar productos
- Actualizar cantidades
- Vaciar carrito
- Populate automático de detalles de productos

### WebSockets en Tiempo Real
- Conexión bidireccionional con Socket.IO
- Actualización en tiempo real de productos
- Múltiples clientes conectados simultáneamente
- Eventos: `addProduct`, `deleteProduct`, `updateProducts`

## 📝 Ejemplos de Uso

### Crear un producto
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Laptop Gamer",
    "description": "Laptop para gaming de alta gama",
    "code": "LAPTOP001",
    "price": 1500,
    "stock": 10,
    "category": "Electrónicos"
  }'
```

### Obtener productos con filtros y paginación
```bash
# Página 1 con 10 productos
curl http://localhost:8080/api/products

# Página 2 con 5 productos por página
curl "http://localhost:8080/api/products?limit=5&page=2"

# Productos de la categoría "Electrónicos" ordenados por precio ascendente
curl "http://localhost:8080/api/products?query=category=Electrónicos&sort=asc"

# Combinación de filtros
curl "http://localhost:8080/api/products?limit=10&page=1&query=category=Accesorios&sort=desc"
```

### Crear un carrito
```bash
curl -X POST http://localhost:8080/api/carts
```

### Agregar producto al carrito
```bash
curl -X POST http://localhost:8080/api/carts/[CART_ID]/product/[PRODUCT_ID]
```

### Obtener carrito con detalles de productos
```bash
curl http://localhost:8080/api/carts/[CART_ID]
```

### Actualizar cantidad de un producto en el carrito
```bash
curl -X PUT http://localhost:8080/api/carts/[CART_ID]/products/[PRODUCT_ID] \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

### Eliminar producto del carrito
```bash
curl -X DELETE http://localhost:8080/api/carts/[CART_ID]/products/[PRODUCT_ID]
```

### Vaciar carrito
```bash
curl -X DELETE http://localhost:8080/api/carts/[CART_ID]
```

## 🎨 Vistas Web Disponibles

### `/products`
Catálogo profesional de productos con:
- Paginación integrada
- Filtros por categoría
- Ordenamiento por precio
- Tarjetas de productos visualmente atractivas
- Botón "Ver Detalles" para cada producto

### `/products/:pid`
Vista de detalles del producto con:
- Información completa del producto
- Galería de imágenes (si existen)
- Botón "Agregar al Carrito"
- Selector de cantidad
- Enlaces de navegación

### `/carts/:cid`
Carrito de compras completo con:
- Lista detallada de productos en el carrito
- Cantidad editable por producto
- Botones de actualizar y eliminar por producto
- Resumen del carrito con total
- Opción para vaciar el carrito

## 🌐 WebSockets y Tiempo Real

### Vistas con WebSockets
- `/realtimeproducts` — Muestra actualizaciones en tiempo real de productos
- `/home` — Vista simple de productos sin WebSockets

### Eventos Socket.IO
- `connection` — Cliente se conecta al servidor
- `updateProducts` — Se emite cuando cambian los productos
- `addProduct` — Cliente envía para agregar producto
- `deleteProduct` — Cliente envía para eliminar producto

### Cómo funciona la integración
1. Los cambios por HTTP (`POST`, `PUT`, `DELETE`) disparan un evento `updateProducts`
2. Todos los clientes WebSocket conectados reciben la actualización en tiempo real
3. Las vistas se actualizan automáticamente sin recargar la página

## 🛠️ Scripts Disponibles

- `npm start`: Inicia el servidor en modo normal
- `npm run dev`: Alias para start

## 📋 Notas Importantes

### Variables de Entorno
Se requiere un archivo `.env` con las siguientes variables:
```env
MONGO_URI=mongodb://localhost:27017/ecommerce
MONGO_DB_NAME=ecommerce
PORT=8080
NODE_ENV=development
```

### Validaciones Implementadas
- Campos requeridos en creación de productos
- Código de producto único
- IDs de ObjectId válidos
- Validación de cantidades positivas
- Manejo de referencias de producto en carritos

### Manejo de Errores
Todas las respuestas siguen la estructura:

**Éxito:**
```json
{
  "status": "success",
  "payload": { /* datos */ },
  "message": "Mensaje opcional"
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

### Códigos HTTP Utilizados
- `200`: OK - Operación exitosa
- `201`: Created - Recurso creado
- `400`: Bad Request - Solicitud inválida
- `404`: Not Found - Recurso no encontrado
- `500`: Internal Server Error - Error del servidor

## 🚀 Mejoras Implementadas en Entrega Final

✅ **MongoDB Integration**: Persistencia profesional con Mongoose  
✅ **Advanced Queries**: Filtrado, paginación y ordenamiento en GET /products  
✅ **Structured Responses**: Formato standar con metadata de paginación  
✅ **Cart Population**: Populate automático de referencias de productos  
✅ **Professional Endpoints**: Todos los endpoints CRUD requieren especificación  
✅ **Handlebars Views**: Vistas dinámicas para catálogo, producto y carrito  
✅ **WebSocket Integration**: Socket.IO para actualizaciones en tiempo real  
✅ **Error Handling**: Validaciones robustas y respuestas estructuradas  
✅ **Bootstrap Styling**: Interfaz moderna y responsiva  
✅ **Code Documentation**: Comentarios en todos los endpoints

## 🤝 Contribuciones

Para reportar bugs o sugerir mejoras, por favor abra un issue en el repositorio.

## 📄 Licencia

Este proyecto es de código abierto bajo licencia MIT.

---

**Última actualización:** Enero 2024  
**Versión:** 2.0.0 (Entrega Final)  
**Desarrollador:** Nicolás Vázquez