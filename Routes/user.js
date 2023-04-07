const express = require("express");
const router = express.Router()
const Banner = require('../Models/banner')
const Product = require('../models/product');
const User = require('../Models/user')
const newOTP = require('../Models/otp')
const Category = require('../Models/category')
const Order = require('../Models/orders')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const userController = require("../Controllers/userController");
const cartController = require('../Controllers/cartController')
const wishlistController = require('../Controllers/wishlistController')
const Cart = require('../Models/cart')
const Contact = require('../Models/contact')
const { userLoginVerify, verifyUserLogout } = require('../Middlewares/session');
const { render } = require("ejs");
const order = require("../Models/orders");
const product = require("../models/product");
// const Contact = require("../Models/contact");
let msg = ""
// let showProduct=""

router.get('/', userController.getHome);

router.get('/profile', verifyUserLogout, userController.getProfile);

router.post('/login', userController.postLogin);

router.get('/register', userController.getRegister);

router.post('/register', userController.postRegister);

router.get('/otp', userController.getOTP)

router.post('/otp', userController.postOTP)

router.get('/product', userController.getProduct)

router.get('/productDetail', userController.getProductDetails)

router.post('/addToCart', userLoginVerify, userController.postAddToCart)

router.get('/cart', userLoginVerify, userController.getCart)

router.post('/countInc', userLoginVerify, userController.postCountIncrease)

router.post('/countDec', userLoginVerify, userController.postCountDesrease)

router.get('/delCartItem/:id', userLoginVerify, userController.getDelCartItem)

router.post('/getProceedToBuy', userLoginVerify, userController.PostProceedToBuy)

router.get('/checkout', userLoginVerify, userController.getCheckout)

router.get('/addAddress', userLoginVerify, userController.getAddAddress)

router.post('/addAddress', userLoginVerify, userController.postAddaddress)

router.get('/deleteOrderAddress', userLoginVerify, userController.getdeleteOrderAddress);

router.post('/postCheckout/:method',userLoginVerify,userController.postCheckOut)

router.post('/verifyPayment', userLoginVerify,userController.verifyPayment)

router.get('/orderSuccess',userLoginVerify,userController.getOrderSuccess)

router.post('/addToWish',userLoginVerify,userController.addToWishlist)

router.get('/whishlist',userLoginVerify,userController.getWishlist)

router.get('/delWishlisttItem',userLoginVerify,userController.getDelWishlistItem)

router.get('/buyNow',userLoginVerify,userController.getBuyNow)

router.post('/postBuyNow/:method',userLoginVerify,userController.postBuyNow)

router.post('/buyNowVerifyPayment', userLoginVerify,userController.buyNowVerifyPayment)

router.get('/category',userController.getCategory)

router.get('/about', userController.getAbout)

router.get('/contact', userController.getContact)

router.post('/contact', userController.postContact)

router.get('/orders', userLoginVerify, userController.getOrders )

router.get('/cancelItem',userLoginVerify,userController.cancelItem)

router.post('/addReview',userLoginVerify,userController.AddReview)

router.get('/loginUser',userLoginVerify,userController.getUserProfile)

router.get('/forgetPassword',userController.getforgetPassword)

router.post('/forgetPassword',userController.PostforgotPassword)

router.get('/reset',userController.getNewPassword)

router.post('/reset',userController.postNewPassword)

router.get('/logout',userController.getLogOut)

module.exports = router;
