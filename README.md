# Servidor Node.js con Express - API de Productos y Carritos

## 📋 Descripción

Servidor básico desarrollado con Node.js y Express que proporciona una API REST para el manejo de productos y carritos de compra. Los datos se almacenan en memoria durante la ejecución del servidor.

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

### Pasos para ejecutar

1. **Clonar o descargar el proyecto**
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Iniciar el servidor:**
   ```bash
   npm start
   ```
   o
   ```bash
   node app.js
   ```

El servidor se ejecutará en `http://localhost:8080`

## 📚 Endpoints de la API

### 🛍️ Productos (`/api/products`)

#### `GET /api/products/`
Obtiene todos los productos.

**Respuesta:**
```json
{
  "status": "success",
  "payload": [
    {
      "id": 1,
      "title": "Producto ejemplo",
      "description": "Descripción del producto",
      "code": "PROD001",
      "price": 100,
      "status": true,
      "stock": 50,
      "category": "Categoría",
      "thumbnails": ["ruta/imagen1.jpg"]
    }
  ]
}
```

#### `GET /api/products/:pid`
Obtiene un producto específico por su ID.

**Parámetros:**
- `pid`: ID del producto

**Respuesta exitosa:**
```json
{
  "status": "success",
  "payload": {
    "id": 1,
    "title": "Producto ejemplo",
    "description": "Descripción del producto",
    "code": "PROD001",
    "price": 100,
    "status": true,
    "stock": 50,
    "category": "Categoría",
    "thumbnails": ["ruta/imagen1.jpg"]
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
  "thumbnails": ["ruta/imagen1.jpg", "ruta/imagen2.jpg"]
}
```

**Campos:**
- `title` (String, requerido): Nombre del producto
- `description` (String, requerido): Descripción del producto
- `code` (String, requerido): Código único del producto
- `price` (Number, requerido): Precio del producto
- `status` (Boolean, opcional): Estado del producto (por defecto: true)
- `stock` (Number, requerido): Cantidad en stock
- `category` (String, requerido): Categoría del producto
- `thumbnails` (Array, opcional): Array de rutas de imágenes

**Nota:** El `id` se genera automáticamente.

#### `PUT /api/products/:pid`
Actualiza un producto existente.

**Parámetros:**
- `pid`: ID del producto a actualizar

**Body:** Cualquier combinación de campos del producto (excepto `id`)

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
    "id": 1,
    "products": []
  }
}
```

#### `GET /api/carts/:cid`
Obtiene los productos de un carrito específico.

**Parámetros:**
- `cid`: ID del carrito

**Respuesta:**
```json
{
  "status": "success",
  "payload": {
    "id": 1,
    "products": [
      {
        "product": {
          "id": 1,
          "title": "Producto ejemplo",
          "description": "Descripción",
          "code": "PROD001",
          "price": 100,
          "status": true,
          "stock": 50,
          "category": "Categoría",
          "thumbnails": []
        },
        "quantity": 2
      }
    ]
  }
}
```

#### `POST /api/carts/:cid/product/:pid`
Agrega un producto al carrito o incrementa su cantidad si ya existe.

**Parámetros:**
- `cid`: ID del carrito
- `pid`: ID del producto

**Comportamiento:**
- Si el producto no está en el carrito: se agrega con cantidad 1
- Si el producto ya está en el carrito: se incrementa la cantidad en 1

## 🗂️ Estructura del Proyecto

```
node/
├── app.js                 # Servidor principal
├── routes/
│   ├── products.js        # Rutas de productos
│   └── carts.js          # Rutas de carritos
├── package.json          # Configuración del proyecto
└── README.md            # Este archivo
├── public/               # Archivos estáticos
│   └── js/
│       └── realtimeProducts.js
├── views/                # Plantillas Handlebars
│   ├── home.handlebars
│   └── realTimeProducts.handlebars
```

## 💾 Almacenamiento

Los datos se almacenan en memoria durante la ejecución del servidor:
- **Productos:** Array en memoria
- **Carritos:** Array en memoria

**Importante:** Los datos se perderán al reiniciar el servidor.

## 🔧 Características Técnicas

- **Puerto:** 8080
- **Framework:** Express.js
- **Middleware:** express.json() para parsear JSON
- **IDs:** Autogenerados e incrementales
- **Validaciones:** Campos requeridos y códigos únicos para productos
- **Manejo de errores:** Respuestas JSON estructuradas

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

### Crear un carrito
```bash
curl -X POST http://localhost:8080/api/carts
```

### Agregar producto al carrito
```bash
curl -X POST http://localhost:8080/api/carts/1/product/1
```

## 🛠️ Scripts Disponibles

- `npm start`: Inicia el servidor
- `npm run dev`: Inicia el servidor (alias de start)

## 🔁 WebSockets y Vistas en Tiempo Real

El proyecto expone una vista en tiempo real que usa `socket.io` + `Handlebars`:

- `GET /home` — Muestra la lista de productos (renderizado por servidor, sin websockets)
- `GET /realtimeproducts` — Muestra la lista de productos en tiempo real (usando websockets).

En la vista `/realtimeproducts` encontrarás un formulario simple para crear productos (este formulario envía los datos por websocket) y botones para eliminar productos. Cada vez que se crea o elimina un producto (ya sea por websocket o por HTTP), el servidor emite un evento `updateProducts` a todos los clientes conectados y la lista se actualiza automáticamente.

### ¿Cómo se integra la creación por HTTP con sockets?

La integración es directa: el router de productos (`/api/products`) emite un `io.emit('updateProducts', products)` luego de crear, actualizar o eliminar un producto — así todos los clientes suscritos ven la actualización.

Si deseas emitir un evento desde dentro del `POST /api/products` puedes usar la instancia de `io` que está guardada en `global.appData.io`. El código que ya está en el proyecto hace exactamente eso — por eso la vista en tiempo real se actualiza cuando usas `POST /api/products`.

### Probar la vista en tiempo real

1. Inicia el servidor:
```bash
npm start
```
2. Abre dos pestañas del navegador en `http://localhost:8080/realtimeproducts`.
3. En una pestaña agrega un producto mediante el formulario; verás que en la otra pestaña la lista se actualiza.
4. También puedes usar el endpoint HTTP `POST /api/products` para agregar un producto y comprobar que la lista se actualiza automáticamente en las vistas en tiempo real.

---
## 💡 Notas y Sugerencias

- Esto es una implementación de ejemplo: los datos se almacenan en memoria por simplicidad. Para producción, se recomienda usar una base de datos persistente (MongoDB, MySQL) y agregar autenticación y validación más robusta.
- Si quieres que la creación por formulario en `realTimeProducts` no use sockets, puedes convertir el `form` para que haga una petición `fetch` a `POST /api/products`; pero si lo haces, asegúrate de continuar emitiendo `updateProducts` desde el servidor luego de crear el producto para que los demás clientes reciban la actualización.


## 🐛 Manejo de Errores

La API devuelve respuestas estructuradas para todos los casos:

**Éxito:**
```json
{
  "status": "success",
  "payload": { ... }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

## 📋 Estados de Respuesta HTTP

- `200`: Operación exitosa
- `201`: Recurso creado exitosamente
- `400`: Error en la solicitud (datos faltantes/inválidos)
- `404`: Recurso no encontrado
- `500`: Error interno del servidor