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
      extraDetails
    } = req.body;

    // Get uploaded image paths
   const images = req.files?.map(file => `/uploads/products/${file.filename}`);

    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      extraDetails,
      images,
      vendor: req.user._id   
    });

    const savedProduct = await product.save();

    res.status(201).json(savedProduct);

  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// READ ALL with filters and search
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, vendor } = req.query;
    let filter = {};

    // if the requester is a vendor ensure they only see their own products
    if (req.user && req.user.role === "vendor") {
      filter.vendor = req.user.id;
    }

    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by vendor query param (only applies for non-vendor or admin)
    if (vendor && !(req.user && req.user.role === "vendor")) {
      filter.vendor = vendor;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort
    let sortObj = {};
    if (sortBy === "newest") {
      sortObj = { createdAt: -1 };
    } else if (sortBy === "price-low" || sortBy === "priceAsc") {
      sortObj = { price: 1 };
    } else if (sortBy === "price-high" || sortBy === "priceDesc") {
      sortObj = { price: -1 };
    } else if (sortBy === "nameAsc") {
      sortObj = { name: 1 };
    } else if (sortBy === "nameDesc") {
      sortObj = { name: -1 };
    } else {
      sortObj = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .populate("vendor", "name email")
      .sort(sortObj);

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
