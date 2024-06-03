const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;
const MONGO_URI =
  "mongodb+srv://sujal:%40Sujal6021@cluster0.jembkt7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const productSchema = new mongoose.Schema({
  type: String,
  name: String,
  size: String,
  thickness: String,
  quantity: Number,
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user._id }, "secretkey", {
      expiresIn: "1h",
    });

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, "secretkey", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post("/products", authenticateToken, async (req, res) => {
  const { type, name, size, thickness, quantity } = req.body;

  const newProduct = new Product({
    type,
    name,
    size,
    thickness,
    quantity,
    addedBy: req.user.userId,
  });

  try {
    await newProduct.save();
    res.json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/products", authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({ addedBy: req.user.userId }).populate(
      "addedBy",
      "username"
    );
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/products/:id/quantity", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.addedBy.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    product.quantity = quantity;

    await product.save();
    res.json({
      success: true,
      message: "Product quantity updated successfully",
    });
  } catch (error) {
    console.error("Error updating product quantity:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating product quantity" });
  }
});

app.put("/products/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, size, thickness, quantity } = req.body;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.addedBy.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    product.name = name;
    product.size = size;
    product.thickness = thickness;
    product.quantity = quantity;

    await product.save();
    res.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Error updating product" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
