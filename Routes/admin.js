const express = require("express");
const router = express.Router();
const Product = require('../Models/product.js');
const Category = require('../Models/category');
const multer = require('../Middlewares/multer');
const Banner = require("../Models/banner");
const { adminLoginVerify } = require('../Middlewares/session')
const admindController = require("../Controllers/admindController");
const order = require("../Models/orders");
const category = require("../Models/category");

router.get('/', admindController.getLogin)

router.post('/login', admindController.postLogin)

router.get('/users', adminLoginVerify, admindController.getUsers);

router.post('/blockUser', adminLoginVerify, admindController.blockUser);

router.post('/unBlockUser', adminLoginVerify, admindController.unBlockUser);

router.get('/home', adminLoginVerify, admindController.getHome)

router.get('/addCategory', adminLoginVerify, admindController.getaddCategory)

router.post('/addCategory', adminLoginVerify, multer.array('image', 1), admindController.postaddCategory)

router.get('/deleteCategory', adminLoginVerify, admindController.getDeleteCategory)

router.get('/adminSearch', adminLoginVerify, admindController.getAdminSearch)

router.get('/banner', adminLoginVerify, admindController.getBanner)

router.get('/addBanner', adminLoginVerify, admindController.getaddBanner)

router.post('/addBanner', adminLoginVerify, multer.array('image', 1), admindController.postaddBanner)

router.get('/deleteBanner', adminLoginVerify, admindController.getDeleteBanner)

router.get('/editBanner', adminLoginVerify, admindController.geteditBanner)

router.put('/editBanner', adminLoginVerify, admindController.puteditBanner)

router.get('/orders', adminLoginVerify, admindController.getOrder)

router.get('/viewOrder',adminLoginVerify,admindController.viewOrder)

router.post('/changeOrderStatus',adminLoginVerify,admindController.changeOrderStatus)

router.get('/invoice',adminLoginVerify,admindController.getInvoice)

router.get('/404', admindController.get404)

router.get('/signout', admindController.getSignout)

module.exports = router;