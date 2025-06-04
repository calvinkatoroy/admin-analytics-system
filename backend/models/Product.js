const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Other']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    url: String,
    alt: String
  }],
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  vendor: {
    name: String,
    email: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ viewCount: -1 });
productSchema.index({ purchaseCount: -1 });

module.exports = mongoose.model('Product', productSchema);