const express = require("express");
const router_product = express.Router();
const Product = require("../models/product");
const {getProducts,getProduct,createProduct,updateProduct,deleteProduct} = require("../controllers/products.controllers")


router_product.get("/", getProducts);
router_product.get("/:name",getProduct);

router_product.post("/", createProduct);

router_product.put("/:name", updateProduct);
router_product.delete("/:name",deleteProduct);



module.exports = router_product;