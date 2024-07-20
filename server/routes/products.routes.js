const express = require("express");
const router_product = express.Router();
const Product = require("../models/product");
const {getProducts,getProduct,createProduct,updateProduct,deleteProduct} = require("../controllers/products.controllers")


router.get("/", getProducts);
router.get("/:name",getProduct);

router.post("/", createProduct);

router.put("/:name", updateProduct);
router.delete("/:name",deleteProduct);



module.exports = router_product;