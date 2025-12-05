// models/Product.js
const mongoose = require('mongoose');

/**
 * Esquema de Producto
 * Define la estructura de los productos en la BD de MongoDB
 */
const productSchema = new mongoose.Schema(
  {
    // Nombre del producto
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Descripción del producto
    description: {
      type: String,
      required: true,
    },
    // Código único del producto
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Precio del producto
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Estado del producto (disponible o no)
    status: {
      type: Boolean,
      default: true,
    },
    // Stock disponible
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    // Categoría del producto
    category: {
      type: String,
      required: true,
      trim: true,
    },
    // Miniaturas del producto (URLs de imágenes)
    thumbnails: {
      type: [String],
      default: [],
    },
  },
  {
    // Agregar timestamps automáticos (createdAt, updatedAt)
    timestamps: true,
  }
);

// Crear e exportar el modelo
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
