const Product = require("../models/Product");
const ActivityLog = require("../models/ActivityLog");


// CREATE - vendor only
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      extraDetails,
      discount,
      discountType
    } = req.body;

    // Get uploaded image paths
   const images = req.files?.map(file => `/uploads/products/${file.filename}`);

    // Calculate discount
    const discountValue = discount !== undefined ? Math.min(100, Math.max(0, discount)) : 0;
    const discType = discountType || "percentage";
    let discountedPrice = price;

    if (discountValue > 0) {
      if (discType === "fixed") {
        discountedPrice = Math.max(0, price - discountValue);
      } else {
        discountedPrice = price * (1 - discountValue / 100);
      }
    }

    const product = new Product({
      name,
      description,
      price,
      stock: Math.max(0, stock || 0),
      category,
      extraDetails,
      images,
      discount: discountValue,
      discountType: discType,
      discountedPrice,
      vendor: req.user._id   
    });

    const savedProduct = await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
      pricing: {
        originalPrice: savedProduct.price,
        discount: savedProduct.discount,
        discountType: savedProduct.discountType,
        finalPrice: savedProduct.discountedPrice || savedProduct.price
      }
    });

  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// READ ALL with filters and search

const getProducts = async (req, res) => {
  try {
    const {
      search,
      vendor,
      category,
      minPrice,
      maxPrice,
      sort
    } = req.query;

    let filter = {};

    // 🔎 Search
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // 🏷 Vendor
    if (vendor) {
      filter.vendor = vendor;
    }

    // 📂 Category
    if (category) {
      filter.category = category;
    }

    // 💰 Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 🔥 SORTING LOGIC
    let sortOption = {};

    if (sort === "priceAsc") {
      sortOption.price = 1;
    }

    if (sort === "priceDesc") {
      sortOption.price = -1;
    }

    if (sort === "nameAsc") {
      sortOption.name = 1;
    }

    if (sort === "nameDesc") {
      sortOption.name = -1;
    }

    const products = await Product.find(filter).sort(sortOption);

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ONE
const getProductById = async (req, res) => {
  try {
    const product = await Product
      .findById(req.params.id)
      .populate("vendor", "name email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // if a vendor is trying to view details, ensure they only access their own
    if (req.user && req.user.role === "vendor") {
      if (product.vendor._id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// UPDATE - vendor only
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user is the vendor
    if (product.vendor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    let body = { ...req.body };
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/products/${f.filename}`);
      
      // If replaceImages flag is set, replace all; otherwise append
      if (req.body.replaceImages === "true") {
        body.images = newImages;
        body.image = newImages[0];
      } else {
        // Get existing images from form data or product
        let baseImages = [];
        if (req.body.existingImages) {
          try {
            baseImages = JSON.parse(req.body.existingImages);
          } catch (e) {
            baseImages = product.images || [];
          }
        } else {
          baseImages = product.images || [];
        }
        
        // Append new images
        body.images = [...baseImages, ...newImages];
        // Keep or set primary image
        if (!body.image && baseImages.length > 0) {
          body.image = baseImages[0];
        } else if (!body.image && newImages.length > 0) {
          body.image = newImages[0];
        }
      }
    } else if (req.body.existingImages) {
      // If no new files but existingImages provided, update the images array
      try {
        body.images = JSON.parse(req.body.existingImages);
        if (body.images.length > 0 && !body.image) {
          body.image = body.images[0];
        }
      } catch (e) {
        // ignore parse error
      }
    }

    // Handle discount calculation
    if (body.price || body.discount !== undefined || body.discountType) {
      const price = body.price || product.price;
      const discount = body.discount !== undefined ? body.discount : product.discount;
      const discountType = body.discountType || product.discountType || "percentage";

      body.price = price;
      body.discount = Math.min(100, Math.max(0, discount)); // Clamp between 0-100
      body.discountType = discountType;

      // Calculate discounted price
      if (discountType === "fixed") {
        body.discountedPrice = Math.max(0, price - discount);
      } else {
        body.discountedPrice = price * (1 - discount / 100);
      }
    }

    // Ensure stock is not negative
    if (body.stock !== undefined) {
      body.stock = Math.max(0, body.stock);
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE - vendor only
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user is the vendor
    if (product.vendor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getVendorProducts: async (req, res) => {
  try {
    const products = await Product
      .find({ vendor: req.user.id })
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
};
