const express = require("express");
const router = express.Router()
const Banner = require('../Models/banner')
const Product = require('../Models/product');
const User = require('../Models/user')
const newOTP = require('../Models/otp')
const Category = require('../Models/category')
const Order = require('../Models/orders')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const userController = require("../Controllers/userController");
const wishlistController = require('../Controllers/productController')
const Cart = require('../Models/cart')
const Contact = require('../Models/contact')
const { userLoginVerify, verifyUserLogout } = require('../Middlewares/session');
const { render } = require("ejs");
const order = require("../Models/orders");
const product = require("../Models/product");
let msg = ""
// let showProduct=""

router.get('/', userController.getHome);

router.get('/login', verifyUserLogout, userController.getLogin);

router.post('/login', userController.postLogin);

router.get('/register', userController.getRegister);

router.post('/register', userController.postRegister);

router.get('/otp', userController.getOTP)

router.post('/otp', userController.postOTP)

router.get('/product', userController.getProduct)

router.get('/productDetail', userController.getProductDetails)

router.post('/addToWish',userController.addToWishlist)

router.get('/whishlist',userLoginVerify,userController.getWishlist)

router.get('/delWishlisttItem',userLoginVerify,userController.getDelWishlistItem)

router.get('/category',userController.getCategory)

router.get('/about', userController.getAbout)

router.get('/contact', userController.getContact)

router.post('/contact', userController.postContact)

router.get('/userProfile',userController.getUserProfile)

router.get('/orders', userLoginVerify, userController.getOrders )

router.get('/cancelItem',userLoginVerify,userController.cancelItem)

router.post('/addReview',userLoginVerify,userController.AddReview)

router.get('/loginUser',userLoginVerify,userController.getUserProfile)

router.get('/forgetPassword',userController.getforgetPassword)

router.post('/forgetPassword',userController.PostforgotPassword)

router.get('/reset',userController.getNewPassword)

router.post('/reset',userController.postNewPassword)

router.get('/logout',userController.getLogOut)

router.get('/404',userController.get404)

module.exports = router;
