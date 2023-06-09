const express = require('express');
const router = express.Router();
const Admin = require('../Models/admin')
const Product = require('../Models/product');
const Category = require('../Models/category');
const multer = require('../Middlewares/multer');
const Banner = require("../Models/banner");
const Contact = require('../Models/contact');
const Users = require('../Models/user');
const order = require('../Models/orders')
const { findOne, findOneAndUpdate } = require('../Models/product');
require('dotenv').config({ path : '.env' })

let msg = "";

module.exports = {

    getLogin: (req, res, next) => {
        if (req.session.email) {
            res.redirect('/admin/home')
        }
        else {
            res.render('../Views/admin/login', { msg });
        }
    },

    postLogin: (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        if (process.env.Admin_Username == email && process.env.Admin_Password == password) {
            req.session.email = email;
            res.redirect('/admin/home');
        }
        else {
            msg = "Invalid user"
            res.redirect('/admin/')
        }
    },

    getHome: async (req, res) => {
        const message = await Contact.find();
        res.render('../Views/admin/index', { message })
    },

    getUsers: async (req, res) => {
        const users = await Users.find();
        res.render('../Views/admin/users', { users })
    },

    blockUser: async (req, res) => {
        const id = req.body.userId
        await Users.findByIdAndUpdate({ _id: id }, { $set: { status: false } })
        res.json({ success: true })
    },

    unBlockUser: async (req, res) => {
        const id = req.body.userId
        await Users.findByIdAndUpdate({ _id: id }, { $set: { status: true } })
        res.json({ success: true })
    },


    getaddCategory: async (req, res) => {
        if (req.session.email) {
            const category = await Category.find()
            res.render('../Views/admin/category', { category })
        }
        else {
            res.redirect('/admin')
        }
    },
    postaddCategory: async (req, res) => {
        const image = req.files.map(image => {
            return image?.filename
        })
        console.log(image);
        const category = await Category.findOne({
            category_name: req.body.category
        })
        if (category || req.body.category == "") {
            res.redirect('/admin/addCategory')
        }
        else {
            let category = new Category({
                category_name: req.body.category,
                images: image

            })
            category.save()
            res.redirect('/admin/home')
        }

    },

    getDeleteCategory: async (req, res) => {
        const id = req.query.id
        await Category.findOneAndDelete(id)
        res.redirect('/admin/addCategory')

    },

    unBlockUser: async (req, res) => {
        const id = req.body.userId
        await Users.findByIdAndUpdate({ _id: id }, { $set: { status: true } })
        res.json({ success: true })
    },

    getProducts: async (req, res) => {

        const products = await Product.find();
        res.render('../Views/admin/products', { products })
    },

    getaddProduct: async (req, res) => {
        if (req.session.email) {
            const category = await Category.find()
            res.render('../Views/admin/addProduct', { category })
        }
        else {
            res.redirect('/admin')
        }
    },

    postaddProduct: async (req, res) => {

        const image = req.files.map(file =>
            ({ path: file.filename })
        )
        const newProduct = req.body
        const product = await Product.findOne({ name: req.body.name })

        if (product) {
            res.redirect('/product/addProduct')
        }
        else {
            let product = new Product({
                name: newProduct.name,
                price: newProduct.price,
                category: newProduct.category,
                mrp: newProduct.mrp,
                stock: newProduct.stock,
                description: newProduct.description,
                images: image

            })
            product.save()
            res.redirect('/product/Products')
        }

    },




    geteditProduct: async (req, res) => {

        const id = req.query.id;
        const product = await Product.findById(id)
        const category = await Category.find()
        if (product) {
            res.render('../Views/admin/editProduct', { product, category })
        }
        else {
            res.redirect('/404')
        }

    },
    puteditProduct: async (req, res) => {
        const product = req.body
        const id = product.id
        await Product.findByIdAndUpdate(id, {
            $set: {
                name: product.name,
                price: product.price,
                mrp: product.mrp,
                stock: product.stock,
                description: product.description
            }
        }, { new: true }
        );
        res.redirect('/product/products');


    },

    getdeleteProduct: async (req, res) => {
        const id = req.query.id;
        console.log(id);
        await Product.findByIdAndDelete(id)
        res.redirect('/product/products')

    },

    getAdminSearch: async (req, res) => {
        let name = req.query.name;
        console.log(name);
        await Product.find({ name: new RegExp(name) }).toArray();
    },

    getaddBanner: (req, res) => {
        res.render('../Views/admin/addBanner')
    },

    postaddBanner: async (req, res) => {
        const newBanner = req.body
        const image = req.files.map((image) => {
            return image?.filename
        })
        const banner = await Product.findOne({
            title: req.body.title
        })
        if (banner) {
            res.redirect('/admin/addBanner')
            res.json({ success: false })

        }
        else {
            let banner = new Banner({
                title: newBanner.title,
                description: newBanner.description,
                image: image,
                imgUrl: newBanner.imgUrl
            })
            banner.save()
            res.redirect('/admin/home')
            res.json({ success: true })

        }
    },

    getOrder: async (req, res) => {
        console.log('orders');
        const orders = await order.find().populate('userId')
            .populate({
                path: 'orderDetail.productDetail.productId',
                model: 'product',
                populate: 'category'
            }).sort({ 'orderDetail.time': -1 })
            orders.forEach(data => {
                data.orderDetail.forEach(datas => {
                    datas.productDetail.forEach(product => {
                        console.log(product);
                    })
                })
            })
        res.render('../Views/admin/order', { orders })
    },

    viewOrder: async (req, res) => {
        const productId = req.query.productId
        const orderId = req.query.orderId;
        const userId = req.query.userId;
        try {
            const data = await order.findOne({ userId: userId }).populate('userId')
                .populate({
                    path: 'orderDetail.productDetail.productId',
                    model: 'product',
                    populate: 'category'
                })

            const orderData = data.orderDetail.find(obj => obj._id.toString() === orderId);
            const productData = orderData.productDetail.find(obj => obj.productId._id.toString() === productId)
            res.render('../Views/admin/orderDetail', { data, orderData, productData })
        } catch (error) {
            console.log(error);
            redirect('/admin/404')
        }
    },

    changeOrderStatus: async (req, res) => {
        const productId = req.body.productId
        const orderId = req.body.orderId;
        const userId = req.body.userId;
        const orderStatus = req.body.orderStatus;
        console.log(productId);
        console.log(orderId);
        console.log(orderStatus);

        const pro = await order.findOne({
            userId: userId,
            'orderDetail._id': orderId,
            'orderDetail.productDetail.productId': productId
        })
        try {
            const result = await order.updateOne(
                {

                    'orderDetail._id': orderId,
                    'orderDetail.productDetail.productId': productId
                },
                {
                    $set: {
                        'orderDetail.$.productDetail.$[prod].orderStatus': orderStatus
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
                .then((data) => {
                    console.log(`order updated succesfully${JSON.stringify(data)}`);
                })
                .catch((error) => {
                    console.error(error);
                })

            res.redirect('/admin/orders')
        } catch (err) {
            console.log(err)
        }
    },

    getInvoice: async (req, res) => {
        const id = req.query.id
        const name = req.query.name
        console.log(name);
        const Order = await order.findOne({ 'orderDetail._id': id })
        const address = Order.orderDetail[0].address
        console.log(address);
        res.render('../Views/admin/invoice', { address, Order, name })
    },

    getBanner: async (req, res) => {
        const banners = await Banner.find();
        console.log(banners)
        res.render('../Views/admin/banner', { banners })

    },

    geteditBanner: async (req, res) => {

        const id = req.query.id;
        const banner = await Banner.findById(id)
        if (banner) {
            res.render('../Views/admin/editBanner', { banner })
        }
        else {
            res.redirect('/404')
        }
    },

    puteditBanner: async (req, res) => {
        const id = req.body.id

        const banner = req.body
        await Banner.findByIdAndUpdate(id, {
            $set: {
                title: banner.title,
                description: banner.description,
                imgUrl: banner.imgUrl
            }
        }, { new: true }
        ).then(banner => {
            console.log(banner);
        });
        res.redirect('/admin/banner');


    },

    getDeleteBanner: async (req, res) => {
        const id = req.query.id;
        await Banner.findByIdAndDelete(id)
        res.redirect('/admin/Banner')
    },

    get404: (req, res) => {
        res.render('../Views/404')
    },

    getSignout: (req, res) => {
        req.session.email = null;
        res.redirect('/admin')

    }

}