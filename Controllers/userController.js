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
      res.render('user/index', { banner, products, category, user });
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
    res.render('user/login', { msg, userData })
    msg = ""

  },


  getRegister: (req, res) => {
    res.render('user/register', { msg })
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
    res.render('user/otp', { user })
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

  },


  getProduct: async (req, res) => {
    const perPage = 2;
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

    res.render('user/product', { products, totalPages, page, user, category, categ, sort, search });

  },

  getProductDetails: async (req, res) => {
    const mail = req.session.email
    const user = await User.findOne({ email: mail })
    const id = req.query.id
    const product = await Product.findById(id).populate('category')
    const review = await Review.findOne({ productId: id })
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", review);
    const c_id = product.category._id
    const category = await Product.find({ category: c_id })
    // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$", product);
    // console.log(product.category);
    res.render('user/product-detail', { product, category, user, review })
  },

  postAddToCart: async (req, res) => {
    const mail = req.session.email
    const user = await User.findOne({ email: mail })
    const productId = req.body.productId
    const existingUser = await Cart.findOne({ user: user._id })
    const product = await Product.findById({ _id: productId })
    if (existingUser) {
      const existingProduct = await Cart.findOne({
        user: user._id,
        'product.productId': productId
      })
      if (existingProduct) {
        await Cart.findOneAndUpdate({ user: user._id, 'product.productId': productId },
          {
            $inc: {
              'product.$.quantity': 1,
              'product.$.total': product.price
            }
          })
        res.redirect('/profile')
      } else {
        await Cart.findOneAndUpdate({ user: user._id },
          {
            $push: {
              product: {
                productId: productId,
                quantity: 1,
                total: product.price
              }
            }
          }
        )
      }
    } else {
      const newCart = new Cart({
        product: {
          productId: productId,
          quantity: 1,
          total: product.price
        },
        user: user._id
      })
      newCart.save()
    }


  },

  getCart: async (req, res) => {
    try {
      const mail = req.session.email
      const user = await User.findOne({ email: mail })
      if (user) {
        const cart = await Cart.findOne({ user: user._id }).populate('product.productId')
        let total = [];
        let totals;
        console.log(cart);
        if (cart) {

          cart.product.forEach((data) => {
            total.push(data.productId.price * data.quantity)
          })
          console.log(total);
          totals = total.reduce(getSum)

          function getSum(totals, total) {
            return totals + total

          }
          // totals = total.reduce((value,currentTotal) => value + currentTotal, 0 )

          res.render('user/shoping-cart', { user, cart, total, totals })
        } else {
          res.render('user/shoping-cart', { user, cart, total, totals })
        }
      }
      else {
        res.redirect('/profile')
        msg = "Please Do Login"
      }
    } catch (error) {
      console.log("eroorrr", error);
    }
  },

  postCountIncrease: async (req, res) => {
    const inc = req.body.add;
    const productId = req.body.productId;
    const mail = req.session.email;
    const user = await User.findOne({ email: mail });
    const product = await Product.findById({ _id: productId });

    let data;
    if (product.stock > inc) {
      data = await Cart.findOneAndUpdate({ user: user._id, 'product.productId': productId },
        {
          $inc: {
            'product.$.quantity': 1,
            'product.$.total': product.price
          }
        })
    }

    const cart = await Cart.findOne({ user: user._id })
    let quantity = 0;
    cart.product.forEach(data => {
      quantity = data.quantity
    })

    const total = product.price * inc
    if (data) {
      res.json({ success: true, product, inc, total })
    } else {
      res.json({ success: false, product })
    }

  },

  postCountDesrease: async (req, res) => {
    const inc = req.body.less;
    const productId = req.body.productId;
    const mail = req.session.email;
    const user = await User.findOne({ email: mail })
    const product = await Product.findById({ _id: productId })
    if (inc >= 1) {
      const data = await Cart.findOneAndUpdate({ user: user._id, 'product.productId': productId },
        {
          $inc: {
            'product.$.quantity': -1,
            'product.$.total': -product.price
          }
        })
    }

    const cart = await Cart.findOne({ user: user._id })
    let quantity = 0;
    cart.product.forEach(data => {
      quantity = data.quantity
      console.log(data.quantity);
    })

    const total = product.price * inc
    console.log(total);
    if (product) {
      res.json({ success: true, product, inc, total })
    } else {
      res.json({ success: false })
    }

  },

  getDelCartItem: async (req, res) => {
    const productId = req.params.id
    const mail = req.session.email

    const user = await User.findOne({ email: mail })
    await Cart.findOneAndUpdate({ user: user._id }, { $pull: { product: { productId: productId } } })

    res.redirect('/cart')
  },

  PostProceedToBuy: async (req, res) => {
    res.redirect(`/checkout`)
  },

  getCheckout: async (req, res) => {
    const mail = req.session.email
    const user = await User.findOne({ email: mail })

    const cart = await Cart.findOne({ user: user._id }).populate('product.productId')

    let total = [];

    cart.product.forEach((data) => {
      total.push(data.productId.price * data.quantity)
    })
    let totals = total.reduce((value, total) => value + total, 0)

    res.render('user/checkout', { totals, data: user, user })
  },

  getAddAddress: (req, res) => {
    const total = req.body.total
    res.render('user/addAddress', { total })
  },

  postAddaddress: async (req, res) => {
    const email = req.session.email
    const address = req.body
    const user = await User.findOneAndUpdate({ email: email },
      {
        $push: {
          address: {
            fname: req.body.fname,
            lname: req.body.lname,
            housename: req.body.housename,
            city: req.body.city,
            state: req.body.state,
            pin: req.body.pin,
            country: req.body.country
          }
        }
      });

    res.redirect('/checkout')


  },

  getdeleteOrderAddress: async (req, res) => {
    const mail = req.session.email;
    const addressId = req.query.id;
    await User.findOneAndUpdate({ email: mail }, { $pull: { address: { _id: addressId } } });
    res.redirect('/checkout');
  },

  postCheckOut: async (req, res) => {
    const method = req.params.method
    // console.log(method);
    const addressId = req.body.address
    if (addressId && method == "cod") {

      const mail = req.session.email
      const address = await User.findOne({ email: mail, "address._id": addressId }, { "address.$": 1 })
      const user = await User.findOne({ email: mail })
      const userId = user._id
      const detail = await Cart.findOne({ user: userId })

      let totals = [];

      console.log(detail.product);

      detail.product.forEach(async (data) => {
        totals.push(data.total)
      })

      let total = totals.reduce((total, value) => total + value);

      const existingUser = await order.findOne({ userId: user._id })

      if (existingUser) {
        let datas;
        address.address.forEach(data => {
          datas = data
        })

        order.findOneAndUpdate({ userId: user._id },
          {
            $push: {
              orderDetail: {
                productDetail: detail.product,
                address: datas,
                paymentMethod: method,
                total: total
              }
            }
          })
          .then(async (data) => {
            await Cart.findOneAndDelete({ user: user._id });

            detail.product.forEach(async (data) => {
              await Product.findOneAndUpdate({ _id: data.productId }, { $inc: { stock: -data.quantity } })
            })

          })



      } else {
        let datas;
        address.address.forEach(data => {
          datas = data
        })

        console.log(detail.product, 'detail.product');

        const newOrder = new order({
          userId: user._id,
          orderDetail: {
            productDetail: detail.product,
            address: datas,
            paymentMethod: method,
            total: total
          },
        })
        newOrder.save()
          .then(async (data) => {
            await Cart.findOneAndDelete({ user: user._id });

            detail.product.forEach(async (data) => {
              await Product.findOneAndUpdate({ _id: data.productId }, { $inc: { stock: -data.quantity } })
            })

          })
      }

      res.json({ success: true })

    } else if (addressId && method == "online") {

      const mail = req.session.email
      const address = await User.findOne({ email: mail, "address._id": addressId }, { "address.$": 1 })
      const user = await User.findOne({ email: mail })
      const userId = user._id
      const detail = await Cart.findOne({ user: userId })

      let totals = [];

      detail.product.forEach(data => {
        totals.push(data.total)
      })

      let total = totals.reduce((accumulator, currentValue) => accumulator + currentValue);

      const razorpayInstance = new Razorpay({
        key_id: process.env.Razor_Pay_Key,
        key_secret: process.env.Razor_Pay_Secret
      });

      razorpayInstance
      let amt = total
      Math.round(amt);
      const amount = parseInt(amt);

      razorpayInstance.orders.create({

        amount: amount * 100,
        currency: "INR",
        receipt: "" + detail._id,
      }, (err, order) => {
        if (err) {
          msg = err;
          console.log(err, 'error on notes');
          res.redirect('/500')
        } else {
          console.log('successs', order);
          res.json({ success: true, order, amount, addressId, method })
        }
      })

    }
  },



  postBuyNow: async (req, res) => {
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    const method = req.params.method
    const addressId = req.body.address
    const productId = req.body.productId

    if (addressId && method == "cod") {

      const mail = req.session.email
      const address = await User.findOne({ email: mail, "address._id": addressId }, { "address.$": 1 })
      const user = await User.findOne({ email: mail })
      const userId = user._id
      const detail = await Product.findOne({ _id: productId })

      let total = detail.price

      const existingUser = await order.findOne({ userId: userId })

      let product = [{
        productId: detail._id,
        quantity: 1,
        total: detail.price,
      }]

      console.log(address);

      if (existingUser) {
        let datas;
        address.address.forEach(data => {
          datas = data
        })
        console.log(datas);

        order.findOneAndUpdate({ userId: user._id },
          {
            $push: {
              orderDetail: {
                productDetail: product,
                address: datas,
                paymentMethod: method,
                total: total,
              }
            }
          })
          .then(async () => {
            await Product.findOneAndUpdate({ _id: productId }, { $inc: { stock: -1 } })
          })



      } else {
        let datas;
        address.address.forEach(data => {
          datas = data
        })

        const newOrder = new order({
          userId: user._id,
          orderDetail: {
            productDetail: product,
            address: datas,
            paymentMethod: method,
            total: total,
          },
        })
        newOrder.save()
          .then(async () => {
            await Product.findOneAndUpdate({ _id: productId }, { $inc: { stock: -1 } })
          })
      }

      res.json({ success: true })

    } else if (addressId && method == "online") {

      const mail = req.session.email
      const address = await User.findOne({ email: mail, "address._id": addressId }, { "address.$": 1 })
      const user = await User.findOne({ email: mail })
      const userId = user._id
      const detail = await Product.findById({ _id: productId })



      let total = detail.price

      const razorpayInstance = new Razorpay({
        key_id: process.env.Razor_Pay_Key,
        key_secret: process.env.Razor_Pay_Secret
      });

      razorpayInstance
      let amt = total
      Math.round(amt);
      const amount = parseInt(amt);

      razorpayInstance.orders.create({

        amount: amount * 100,
        currency: "INR",
        receipt: "" + detail._id,
      }, (err, order) => {
        if (err) {
          msg = err;
          console.log(err, 'error on notes');
          res.redirect('/500')
        } else {
          console.log('successs', order);
          res.json({ success: true, order, amount, addressId, method, productId })
        }
      })

    }
  },

  buyNowVerifyPayment: async (req, res) => {
    try {
      const payment = req.body;
      const orderDetails = req.body.order;
      const addressId = orderDetails.addressId
      const method = orderDetails.method
      const productId = orderDetails.productId
      let hmac = crypto.createHmac('SHA256', process.env.Razor_Pay_Secret)

      hmac.update(payment.response.razorpay_order_id + '|' + payment.response.razorpay_payment_id)
      hmac = hmac.digest('hex');
      if (hmac == payment.response.razorpay_signature) {

        const mail = req.session.email
        const address = await User.findOne({ email: mail, "address._id": addressId }, { "address.$": 1 })
        const user = await User.findOne({ email: mail })
        const userId = user._id
        const detail = await Product.findOne({ _id: productId })

        let total = detail.price

        const existingUser = await order.findOne({ userId: userId })

        let product = [{
          productId: detail._id,
          quantity: 1,
          total: detail.price,
        }]

        console.log(address.address, product);

        if (existingUser) {
          let datas;
          address.address.forEach(data => {
            datas = data
          })
          console.log(datas);

          order.findOneAndUpdate({ userId: user._id },
            {
              $push: {
                orderDetail: {
                  productDetail: product,
                  address: datas,
                  paymentMethod: method,
                  total: total,
                }
              }
            })
            .then(async () => {
              await Product.findOneAndUpdate({ _id: productId }, { $inc: { stock: -1 } })
            })



        } else {
          let datas;
          address.address.forEach(data => {
            datas = data
          })
          console.log(datas);
          const newOrder = new order({
            userId: user._id,
            orderDetail: {
              productDetail: product,
              address: datas,
              paymentMethod: method,
              total: total,
            },
          })
          newOrder.save()
            .then(async () => {
              await Product.findOneAndUpdate({ _id: productId }, { $inc: { stock: -1 } })
            })
        }

        const orderId = orderDetails.order.receipt

        res.status(200).send({ success: orderDetails.success, orderId });
      }
    } catch (err) {
      console.error(`Error Verify Online Payment:`, err);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  },



  verifyPayment: async (req, res) => {
    try {
      const payment = req.body;
      const orderDetails = req.body.order;
      const addressId = orderDetails.addressId
      const method = orderDetails.method
      let hmac = crypto.createHmac('SHA256', process.env.Razor_Pay_Secret)

      hmac.update(payment.response.razorpay_order_id + '|' + payment.response.razorpay_payment_id)
      hmac = hmac.digest('hex');
      if (hmac == payment.response.razorpay_signature) {

        const mail = req.session.email
        const address = await User.findOne({ email: mail, "address._id": addressId }, { "address.$": 1 })
        const user = await User.findOne({ email: mail })
        const userId = user._id
        const detail = await Cart.findOne({ user: userId })

        let totals = [];


        detail.product.forEach(async (data) => {
          totals.push(data.total)
          await Product.findOneAndUpdate({ _id: data.productId }, { $inc: { stock: -data.quantity } })
        })

        let total = totals.reduce((total, value) => total + value);

        const existingUser = await order.findOne({ userId: user._id })

        if (existingUser) {
          let datas;
          address.address.forEach(data => {
            datas = data
          })

          await order.findOneAndUpdate({ userId: user._id },
            {
              $push: {
                orderDetail: {
                  productDetail: detail.product,
                  address: datas,
                  paymentMethod: method,
                  total: total,
                  paymentStatus: 'Paid'
                }
              }
            })
            .then(async (data) => {
              await Cart.findOneAndDelete({ user: user._id })
            })

        } else {
          let datas;
          address.address.forEach(data => {
            datas = data
          })

          const newOrder = new order({
            userId: user._id,
            orderDetail: {
              productDetail: detail.product
            },
            address: datas,
            paymentMethod: method,
            total: total,
            paymentStatus: 'Paid'
          })
          newOrder.save()
            .then(async (data) => {
              await Cart.findOneAndDelete({ user: user._id })
            })
        }

        const orderId = orderDetails.order.receipt

        res.status(200).send({ success: orderDetails.success, orderId });
      }
    } catch (err) {
      console.error(`Error Verify Online Payment:`, err);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  },

  getOrderSuccess: (req, res) => {
    res.render('user/orderSuccess')
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

    res.render('user/ord', { orders, user, msg })

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
    res.render('user/wishlist', { product, user })

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
    res.render('user/buynow', { product, totals, data: user, user })
  },

  getCategory: async (req, res) => {
    console.log("category");
    const id = req.query.id
    const product = await Product.find({ category: id })

  },

  getAbout: async (req, res) => {
    const id = req.session.email
    const user = await User.findOne({ email: id })
    res.render('user/about', { user })
  },

  getContact: async (req, res) => {
    const id = req.session.email
    const user = await User.findOne({ email: id })
    res.render('user/contact', { user }, msg)
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
    res.render('user/userProfile')
  },

  getforgetPassword: (req, res) => {
    res.render('user/forgetPassword')
    // message = ''
  },

  PostforgotPassword: async (req, res, next) => {
    try {
      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          console.log(err,'error on post frogot');
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
          console.log('user saved',users);
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
            transporter.sendMail(emails, (err, res)=> {
              if (err) {
                console.log(err, 'email error');
              } else {
                console.log('email sented',res);
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
          res.render('user/newPassword', { userid: usserz._id, passwordToken: token })
        })
        .catch(err => {
        })
    } catch (e) {
      console.log(e,'error on new password html');
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
        if(!users){
          console.log('user not found line - 1255');
        }
        console.log(users);
        updatedUser = users
        console.log(newpassword,'new password');
        return bcrypt.hash(newpassword, 12)
      }).then(hashedpassword => {
        updatedUser.password = hashedpassword
        updatedUser.conform = hashedpassword
        updatedUser.resetToken = undefined
        updatedUser.resetTokenExpiration = undefined
        return updatedUser.save()
      }).then(result => {
        console.log(result,'password updated succesfuly');
        res.redirect('/profile')
      })
    } catch (e) {
      console.log(e,'error occurd');
      next(new Error(e))
    }
  },

  getLogOut: (req, res) => {
    req.session.email = null
    res.redirect('/profile')
  },



}