const express = require("express");
const router = express.Router()
const Banner = require('../Models/banner')
const Product = require('../Models/product');
const User = require('../Models/user')
const newOTP = require('../Models/otp')
const Category = require('../Models/category')
const Cart = require('../Models/cart')
const Wishlist = require('../Models/wishlist')
const Contact = require('../Models/contact')
const order = require("../Models/orders");
const Review = require('../Models/review')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const { countDocuments } = require("../Models/banner");
const Razorpay = require("razorpay");
const crypto = require('crypto');
const { log } = require("console");
require('dotenv').config({ path: '.env' });

let msg = ""

module.exports = {



  getHome: async (req, res) => {
    try {
      const mail = req.session.email;
      const user = await User.findOne({ email: mail })
      const banner = await Banner.find()
      const products = await Product.find()
      const category = await Category.find()
      let count = 0
      let cart;
      let wishlist;
      
      if (user ) {
        cart = await Cart.findOne({ user: user._id })
        if(cart){
          console.log(cart);
          if (cart.product) {
            count = cart.product.length
            console.log(count);
          }
        }
        wishlist = await Wishlist.findOne({ user: user._id })

       
      }
      res.render('../Views/user/index.ejs', { banner, products, category, user,count });
    } catch (error) {
      console.log(error);
    }

  },

  postLogin: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email })
    if (user) {

      bcrypt.compare(password, user.password).then((data) => {
        console.log(data + "asdfghj data");
        if (data) {
          req.session.email = req.body.email;
          res.redirect('/');
        } else {
          res.redirect('/profile')
        }

      })

    }
    else {
      res.redirect('/profile')
      msg = "User Not Found"

    }
  },


  getProfile: async (req, res) => {
    const mail = req.session.email
    const userData = await User.findOne({ email: mail })
    res.render('../Views/user/login', { msg, userData })
    msg = ""

  },


  getRegister: (req, res) => {
    res.render('../Views/user/register', { msg })
    msg = ""
  },

  postRegister: async (req, res) => {
    try {
      const myUser = req.body
      const email = req.body.email
      console.log("This is email", email);
      console.log("-------------------------------------------------------------");
      let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'magiccaasket@gmail.com',
          pass: 'stfgyumzikoqmpst'
        }
      })
      const user = await User.findOne({ email: email });
      console.log("This is user", user);
      console.log("-------------------------------------------------------------");

      if (user) {
        msg = "user already exist"
        res.redirect('/register')
      } else {
        const emailOtp = email;
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`
        console.log(otp + "otp");
        console.log("-------------------------------------------------------------");
        req.session.otp = otp

        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 5);
        const nwOTP = new newOTP({ email: emailOtp, otp: otp, expiration: expiration });
        nwOTP.save((err) => {
          if (err) {
            msg = err;
            console.log("error occured");
            console.error(err + "error ");
          } else {
            console.log("This is email =>,", email);
            let mailOptions = {
              from: 'magiccaasket@gmail.com',
              to: email,
              subject: 'OTP from Magic Casket',
              text: `Your OTP is: ${otp}`
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                msg = error;
                console.log("error occured");
                console.log(error);
              } else {
                console.log("no error occured");
                console.log(`OTP sent to ${email}: ${otp}`);
                res.alert(`OTP sent to ${email}`);
              }
            })
          }

          res.redirect(`/otp?fname=${myUser.fname}&email=${myUser.email}&cpassword${myUser.cpassword}&password=${myUser.password}&lname=${myUser.lname}&number=${myUser.number}`);
        });
      }

    } catch (error) {
      console.error(error);
    }
  },

  getOTP: (req, res) => {
    const user = req.query;
    console.log("otp");
    res.render('../Views/user/otp', { user })
  },

  postOTP: async (req, res) => {
    const password = await bcrypt.hash(req.body.password, 10)
    let myDetails = new User({
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      number: req.body.number,
      password: password

    })
    const otp = req.body.emailOtp;
    newOTP.findOne({ otp: otp }, (err, otpDetails) => {
      if (err) {
        msg = err
        console.error(err + "err");
      } else {
        if (otpDetails) {
          if (otpDetails.expiration > Date.now()) {
            myDetails.save().then(item => {
              res.redirect('/')
            })
          } else {
            msg = "OTP expired"
            res.redirect('/register');
          }
        } else {
          msg = "Invalid OTP"
          console.error(err + "err");
        }
      }
    });

    const otpNew = req.session.otp
    const mail = req.body.email

    newOTP.findOneAndDelete({ email: mail, otp: otpNew }, (err) => {
      if (err) {
        msg = err;
        console.error(err + "delete");
      }
    })
    res.redirect('/profile')

  },


  getProduct: async (req, res) => {
    const perPage = 4;
    const page = req.query.page;
    const search = req.query.search
    console.log(req.query);
    const totalDocs = await Product.countDocuments({});
    const totalPages = Math.ceil(totalDocs / perPage);
    let products;

    const category = await Category.find()
    const mail = req.session.email;
    const user = await User.findOne({ email: mail });

    const sort = req.query.sort;
    const categ = req.query.category;

    console.log(search);

    if (search) {
      products = await Product.find({ name: { $regex: new RegExp(search, "i") } })
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate('category', 'name');
    } else if (sort) {
      if (sort == 'HighToLow') {
        if (categ) {
          products = await Product.find({ category: categ })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .populate('category', 'name')
            .sort({ price: -1 })
          console.log(products);
        } else {
          products = await Product.find({})
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .populate('category', 'name')
            .sort({ price: -1 })
        }
      } else {
        if (categ) {
          products = await Product.find({ category: categ })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .populate('category', 'name')
            .sort({ price: 1 })
        } else {
          products = await Product.find({})
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .populate('category', 'name')
            .sort({ price: 1 })
        }
      }
    } else if (categ) {
      if (sort) {
        if (sort == 'HighToLow') {
          products = await Product.find({ category: categ })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .populate('category', 'name')
            .sort({ price: -1 })
          console.log(products);
        } else {
          products = await Product.find({ category: categ })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .populate('category', 'name')
            .sort({ price: 1 })
        }
      } else {
        products = await Product.find({ category: categ })
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .populate('category', 'name');
      }
    } else {
      products = await Product.find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate('category', 'name');
    }

    res.render('../Views/user/product', { products, totalPages, page, user, category, categ, sort, search });

  },

  getProductDetails: async (req, res) => {
    const mail = req.session.email
    const user = await User.findOne({ email: mail })
    const id = req.query.id
    const product = await Product.findById(id).populate('category')
    const review = await Review.findOne({ productId: id })
    // console.log(review);
    const c_id = product.category._id
    const category = await Product.find({ category: c_id })
    // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$", product);
    // console.log(product.category);
    res.render('../Views/user/product-detail', { product, category, user, review })
  },



  getOrderSuccess: (req, res) => {
    res.render('../Views/user/orderSuccess')
  },

  getOrders: async (req, res) => {
    const mail = req.session.email;
    const user = await User.findOne({ email: mail })
    let orders = await order.find({ userId: user._id }).populate('userId')
      .populate({
        path: 'orderDetail.productDetail.productId',
        model: 'product'
      }).sort({ 'orderDetail.time': -1 })
    let total = []

    let ordersAlive = await order.find({ userId: user._id, 'orderDetail.productDetail.orderStatus': 'Pending' }).populate('userId')
      .populate({
        path: 'orderDetail.productDetail.productId',
        model: 'product'
      }).sort({ 'orderDetail.time': -1 })

    ordersAlive.forEach(data => {
      data.orderDetail.forEach(proData => {
        proData.productDetail.forEach(dataPro => {
          total.push(dataPro.productId.price * dataPro.quantity)
        })
      })
    })

    res.render('../Views/user/ord', { orders, user, msg })

  },

  cancelItem: async (req, res) => {
    const productId = req.query.id;
    const orderId = req.query.orderId;
    const mail = req.session.email
    const user = await User.findOne({ email: mail })
    try {
      const result = await order.updateOne(
        {
          userId: user._id,
          'orderDetail._id': orderId,
          'orderDetail.productDetail.productId': productId
        },
        {
          $set: {
            'orderDetail.$.productDetail.$[prod].orderStatus': 'Cancel'
          }
        },
        {
          arrayFilters: [
            {
              'prod.productId': productId
            }
          ]
        }
      )
        .then(() => {
          console.log('Order status updated successfully');
        })
        .catch((error) => {
          console.error(error);
        })

      res.redirect('/orders')
    } catch (err) {
      console.log(err)
      //handle the error
    }

  },

  AddReview: async (req, res) => {
    const head = req.body.head;
    const description = req.body.description;
    const produId = req.body.produId;
    const mail = req.session.email
    const product = await Review.findOne({ productId: produId });
    const userId = await User.findOne({ email: mail })

    if (product) {
      msg = 'Already Posted One Review'
      res.redirect('/orders')
    } else {
      msg = ''
      const newReview = new Review({
        userId: userId._id,
        productId: produId,
        description: description,
        head: head,
      })
      newReview.save()
    }

    res.redirect('/orders')
  },

  addToWishlist: async (req, res) => {
    try {
      const mail = req.session.email
      const user = await User.findOne({ email: mail })
      const id = req.body.productId
      const currentUser = await Wishlist.findOne({ userId: user.id })
      const data = await Product.findById({ _id: id })
      const name = data.name
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
    res.render('../Views/user/wishlist', { product, user })

  },

  getDelWishlistItem: async (req, res) => {
    const productId = req.query.id
    const mail = req.session.email

    const user = await User.findOne({ email: mail })
    await Wishlist.findOneAndUpdate({ userId: user._id }, { $pull: { productId: productId } })

    res.redirect('/whishlist')
  },

  PostProceedToBuy: async (req, res) => {
    res.redirect(`/checkout`)
  },

  getBuyNow: async (req, res) => {
    const mail = req.session.email;
    const p_id = req.query.id;
    const product = await Product.findById({ _id: p_id })
    const user = await User.findOne({ email: mail })
    totals = product.price;
    res.render('../Views/user/buynow', { product, totals, data: user, user })
  },

  getCategory: async (req, res) => {
    console.log("category");
    const id = req.query.id
    const product = await Product.find({ category: id })

  },

  getAbout: async (req, res) => {
    const id = req.session.email
    const user = await User.findOne({ email: id })
    res.render('../Views/user/about', { user })
  },

  getContact: async (req, res) => {
    const id = req.session.email
    const user = await User.findOne({ email: id })
    res.render('../Views/user/contact', { user }, msg)
    msg = ""
  },

  postContact: async (req, res) => {
    const email = req.body.email
    console.log(email);

    const message = req.body.message
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'magiccaasket@gmail.com',
        pass: 'stfgyumzikoqmpst'
      }
    });
    const user = await User.findOne({ email: email });
    if (user) {
      let contact = new Contact({
        email: email,
        message: message

      })
      console.log(email);

      await contact.save()
      let mailOptions = {
        from: email,
        to: 'magiccaasket@gmail.com',
        subject: `Message for MAGIC CASKETW`,
        text: contact.message
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          msg = "Something went wrong. Please try again later"
        } else {
          console.log('Email sent: ' + info.response);
          msg = "Your message has been sent successfully."
        }
        res.redirect('/')

      });

    }
  },

  getUserProfile: (req, res) => {
    res.render('../Views/user/userProfile')
  },

  getforgetPassword: (req, res) => {
    res.render('../Views/user/forgetPassword')
    // message = ''
  },

  PostforgotPassword: async (req, res, next) => {
    try {
      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          console.log(err, 'error on post frogot');
          return res.redirect('/forgetPassword')
        }
        const token = buffer.toString('hex')
        User.findOne({ email: req.body.email }).then(users => {
          if (!users) {

            message = 'Sorry No such account with this email,Please enter a valid email id';
            console.log(message);
            return res.redirect('/forgetPassword')
          }
          users.resetToken = token;
          users.resetTokenExpiration = Date.now() + 3600000
          users.save()
          console.log('user saved', users);
        })
          .then(result => {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'magiccaasket@gmail.com',
                pass: 'stfgyumzikoqmpst'
              }
            })
            var emails = {
              to: req.body.email,
              from: ` magiccaasket@gmail.com `,
              subject: 'password reset',
              html: `
            <p>You Requested  a Password reset </p>
             <p>Click this <a href="http://localhost:3000/reset?token=${token}">link</a> to set a password.</p>
     `
            }
            console.log('We have send an email to your email Id, It may be in spam messages');
            transporter.sendMail(emails, (err, res) => {
              if (err) {
                console.log(err, 'email error');
              } else {
                console.log('email sented', res);
              }

            })
            res.redirect('/')

          })
          .catch(err => {
            console.log(err, 'catched error');
            res.redirect('/');
          })
      })
    } catch (e) {
      next(new Error(e))
    }
  },

  getNewPassword: (req, res, next) => {
    try {
      const token = req.query.token;
      User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(usserz => {
          res.render('../Views/user/newPassword', { userid: usserz._id, passwordToken: token })
        })
        .catch(err => {
        })
    } catch (e) {
      console.log(e, 'error on new password html');
    }
  },

  postNewPassword: (req, res, next) => {
    try {
      let updatedUser;
      const newpassword = req.body.pass;
      const userId = req.body.userid;
      const passwordToken = req.body.passwordToken
      User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
      }).then(users => {
        if (!users) {
          console.log('user not found line - 1255');
        }
        console.log(users);
        updatedUser = users
        console.log(newpassword, 'new password');
        return bcrypt.hash(newpassword, 12)
      }).then(hashedpassword => {
        updatedUser.password = hashedpassword
        updatedUser.conform = hashedpassword
        updatedUser.resetToken = undefined
        updatedUser.resetTokenExpiration = undefined
        return updatedUser.save()
      }).then(result => {
        console.log(result, 'password updated succesfuly');
        res.redirect('/profile')
      })
    } catch (e) {
      console.log(e, 'error occurd');
      next(new Error(e))
    }
  },

  getLogOut: (req, res) => {
    req.session.email = null
    res.redirect('/profile')
  },



}