const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// TEST API
app.post("/api/customers", (req, res) => {
  const data = req.body;

  res.status(200).json({
    message: "Data received successfully",
    receivedData: data
  });
});

app.get("/api/customers", (req, res) => {
  res.json([
    {
      name: "Rahul",
      phone: "9999999999",
      serviceType: "SUV Wash"
    }
  ]);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
