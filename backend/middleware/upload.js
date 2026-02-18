const multer = require("multer");
const path = require("path");

// Storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/products");
  },

  filename(req, file, cb) {
    cb(
      null,
      `${Date.now()}-${file.originalname.replace(/\s+/g, "")}`
    );
  },
});

// File filter
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
    cb(new Error("Images only!"), false);
  } else {
    cb(null, true);
  }
}

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
