// models/Product.js
const mongoose = require('mongoose');


const productSchema = new mongoose.Schema(
  {
    // Nombre del produto
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Descripcion del producto
    description: {
      type: String,
      required: true,
    },
    // Codigo
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Precio 
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Estado 
    status: {
      type: Boolean,
      default: true,
    },
    // Stock 
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    // Categproducto
    category: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnails: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Crear
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
