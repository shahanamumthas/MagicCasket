const express = require("express");
const router = express.Router();
const Category = require('../Models/category');
const multer = require('../Middlewares/multer');
const { adminLoginVerify } = require('../Middlewares/session')
const productController = require("../Controllers/productController");
const product = require("../Models/product");

router.get('/products', adminLoginVerify, productController.getProducts)

router.get('/addProduct', adminLoginVerify, productController.getaddProduct)

router.post('/addProduct', adminLoginVerify, multer.array('image', 3), productController.postaddProduct)

router.get('/editProduct', adminLoginVerify, productController.geteditProduct)

router.put('/editProduct', adminLoginVerify, productController.puteditProduct)

router.get('/deleteProduct', adminLoginVerify, productController.getdeleteProduct)

module.exports = router;