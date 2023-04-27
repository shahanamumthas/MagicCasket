const express = require("express");
const router = express.Router()
const Product = require('../Models/product');
const User = require('../Models/user')
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

module.exports = {

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

          res.render('../Views/user/shoping-cart', { user, cart, total, totals })
        } else {
          res.render('../Views/user/shoping-cart', { user, cart, total, totals })
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
    res.render('../Views/user/addAddress', { total })
  },

  postAddaddress: async (req, res) => {
    const email = req.session.email
    // const address = req.body
    // const total = req.body.total
    // console.log(address, total);
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
}