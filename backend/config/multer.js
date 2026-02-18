const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, ""));
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"));
  }
};

module.exports = multer({ storage, fileFilter });
