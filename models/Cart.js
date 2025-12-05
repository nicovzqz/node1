// models/Cart.js
const mongoose = require('mongoose');

/**
 * Esquema de Carrito
 * Define la estructura de los carritos en la BD de MongoDB
 */
const cartSchema = new mongoose.Schema(
  {
    // Array de productos en el carrito
    // Cada producto es una referencia (populate) al modelo Product
    products: [
      {
        // Referencia al producto (ID de Product)
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        // Cantidad de este producto en el carrito
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        _id: false, // No generar ID para subdocumentos
      },
    ],
  },
  {
    // Agregar timestamps automáticos (createdAt, updatedAt)
    timestamps: true,
  }
);

// Crear e exportar el modelo
const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
