const express = require("express");
const cors = require("cors");
const User = require("./db/User");
require("./db/config");
const Product = require("./db/Product");
const jwt = require("jsonwebtoken");
const jwtKey = "e-com";
const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3500;

//Sign up
app.post("/api/register", async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(200)
        .send({ message: "User with this email already exists" });
    }
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
      if (err) {
        res.send("Something went wrong");
      }
      res.status(200).send({ result, token, message: "Signup successful" });
    });
  } catch (error) {
    console.error("Error:", error);
  }
});

//login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "All fields are required" });
    }
    let user = await User.findOne({ email, password }).select("-password");
    if (user) {
      jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send("Something went wrong");
        }
        res.send({ user, token, message: "login successful" });
      });
    } else {
      res.send({ result: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
//add product
app.post("/api/add-product", async (req, resp) => {
  let product = new Product(req.body);
  let result = await product.save();
  resp.send(result);
});

app.post("/api/cart-item", async (req, resp) => {
  let product = new Product(req.body);
  let result = await product.save();
  resp.send(result);
});
//get products
app.get("/api/products", async (req, resp) => {
  let products = await Product.find();
  if (products.length > 0) {
    resp.send(products);
  } else {
    resp.send({ result: "No Products found" });
  }
});
app.listen(PORT, () => {
  console.log("server is started", PORT);
});
