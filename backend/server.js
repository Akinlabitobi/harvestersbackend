const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const connectDB = require("./config/connectDB");
const userRoutes = require("./routes/userRoute");

connectDB();

const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/harvesters/backend", userRoutes);

app.get("/", (req, res) => {
  res.send("Home page");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
