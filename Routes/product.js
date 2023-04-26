const express = require("express");
const router = express.Router();
const Category = require('../Models/category');
const multer = require('../Middlewares/multer');
const { adminLoginVerify } = require('../Middlewares/session')
const admindController = require("../Controllers/admindController");
const product = require("../models/product");

router.get('/products', adminLoginVerify, admindController.getProducts)

router.get('/addProduct', adminLoginVerify, admindController.getaddProduct)

router.post('/addProduct', adminLoginVerify, multer.array('image', 3), admindController.postaddProduct)

router.get('/addCategory', adminLoginVerify, admindController.getaddCategory)

router.post('/addCategory', adminLoginVerify, multer.array('image', 1), admindController.postaddCategory)

router.get('/deleteCategory', adminLoginVerify, admindController.getDeleteCategory)

router.get('/editProduct', adminLoginVerify, admindController.geteditProduct)

router.put('/editProduct', adminLoginVerify, admindController.puteditProduct)

router.get('/deleteProduct', adminLoginVerify, admindController.getdeleteProduct)

module.exports = router;