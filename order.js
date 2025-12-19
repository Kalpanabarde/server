const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: {
    id: Number,
    name: { type: String, required: true },
    phoneNo: { type: String, required: true },
    cars: [
      {
        carName: String,
        carNumber: String
      }
    ]
  },
  service: {
    serviceType: String,
    quantity: Number,
    price: Number
  },
  payment: {
    paymentType: String,
    paymentStatus: String
  },
  bill: {
    tax: Number,
    totalAmount: Number
  }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
