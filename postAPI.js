require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DB CONNECTION ================= */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => console.log("❌ DB Error:", err));

/* ================= COUNTER SCHEMA (INVOICE) ================= */
const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 1 }
});

const Counter = mongoose.model("Counter", CounterSchema);

/* ================= ORDER SCHEMA ================= */
const OrderSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },

  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    cars: [
      {
        carName: String,
        carNumber: String
      }
    ]
  },

  service: { type: String, required: true },

  bill: {
    quantity: { type: Number, required: true },
    totalAmount: { type: Number, required: true }
  },

  payment: {
    method: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Credit"],
      required: true
    },
    status: {
      type: String,
      enum: ["completed", "pending"],
      default: "pending"
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", OrderSchema);

/* ================= POST ORDER ================= */
app.post("/api/orders", async (req, res) => {
  try {
    const {
      service,
      data,
      TotalPrice,
      paymentMethod,
      paymentStatus
    } = req.body;

    // 🔒 VALIDATIONS
    if (
      !service ||
      !data?.name ||
      !data?.phone ||
      !data?.cars?.length ||
      !data?.quantity ||
      !TotalPrice ||
      !paymentMethod
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🧾 SAFE INVOICE NUMBER (DB BASED)
    const counter = await Counter.findOneAndUpdate(
      { name: "invoice" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const invoiceNo = `INV-${String(counter.seq).padStart(5, "0")}`;

    // 🧾 CREATE ORDER
    const newOrder = new Order({
      invoiceNo,
      customer: {
        name: data.name,
        phone: data.phone,
        cars: data.cars
      },
      service,
      bill: {
        quantity: data.quantity,
        totalAmount: TotalPrice
      },
      payment: {
        method: paymentMethod,
        status: paymentStatus || "pending"
      }
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order & invoice stored successfully",
      data: savedOrder
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET ORDERS ================= */
app.get("/api/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

/* ================= SERVER ================= */
app.listen(process.env.PORT || 4000, () => {
  console.log("🚀 Server running");
});
