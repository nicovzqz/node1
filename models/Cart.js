// models/Cart.js
const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema(
  {
    // Array de productos
    products: [
      {
        // ID de Produc
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        // Cantidad
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        _id: false, 
      },
    ],
  },
  {
   
    timestamps: true,
  }
);

// Crear
const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
