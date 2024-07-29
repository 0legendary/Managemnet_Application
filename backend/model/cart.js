import mongoose from 'mongoose'

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      },
      price: {
        type: Number,
        required: true
      },
      discountedPrice: {
        type: Number,
        required: false
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  totalDiscount: {
    type: Number,
    required: false,
    default: 0
  }
}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);

export default Cart;
