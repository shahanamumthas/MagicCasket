const express = require("express");
const router = express.Router()
const Banner = require('../Models/banner')
const Product = require('../models/product');
const User = require('../Models/user')
const newOTP = require('../Models/otp')
const Category = require('../Models/category')
const Cart = require('../Models/cart')
const Wishlist = require('../Models/wishlist')
const Contact = require('../Models/contact')
const order = require("../Models/orders");
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const { countDocuments } = require("../Models/banner");
const Razorpay = require("razorpay");
const crypto = require('crypto');
require('dotenv').config({ path: '.env' });

let msg = ""

module.exports = {
    addToWishlist: async (req, res) => {
        const id = req.body.productId
        const data = await Product.findById({ _id: id })
        const name = data.name
        try {
          const mail = req.session.email
          const user = await User.findOne({ email: mail })
          const currentUser = await Wishlist.findOne({ userId: user.id })
          if (currentUser) {
            await Wishlist.findOneAndUpdate({ userId: currentUser.userId }, { $push: { productId: data._id } }).then(() => {
              res.json({ success: true, name })
            })
          } else {
    
            let newWishlist = new Wishlist({
              userId: user,
              productId: data._id
            })
    
            newWishlist.save().then((datas => {
              console.log(datas);
              res.json({ success: true, name })
            }))
          }
        } catch {
          console.log('catch');
          res.json({ success: false, name })
        }
    
      },
      getWishlist: async (req, res) => {
        const mail = req.session.email
        const user = await User.findOne(({ email: mail }))
        const id = user._id
        const data = await Wishlist.findOne({ userId: id })
        const proId = data?.productId
        const product = await Product.find({ _id: proId })
        res.render('user/wishlist', { product, user })
    
      },
    
      getDelWishlistItem: async (req, res) => {
        const productId = req.query.id
        const mail = req.session.email
    
        const user = await User.findOne({ email: mail })
        await Wishlist.findOneAndUpdate({ userId: user._id } , { $pull: { productId: productId } })
    
        res.redirect('/whishlist')
      },
}
