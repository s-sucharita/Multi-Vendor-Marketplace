const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/products";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
  cb(null, uploadDir);
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
  const allowedTypes = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes.includes(ext)) {
    cb(new Error("Images only!"), false);
  } else {
    cb(null, true);
  }
}




module.exports = multer({ storage, fileFilter });