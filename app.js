require ("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");



app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});app.use(cors());

