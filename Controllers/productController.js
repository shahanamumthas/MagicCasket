const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../Models/category');
const multer = require('../Middlewares/multer');

let msg = ""

module.exports = {
  getProducts: async (req, res) => {

    const products = await Product.find();
    res.render('admin/products', { products })
},

getaddProduct: async (req, res) => {
    if (req.session.email) {
        const category = await Category.find()
        res.render('admin/addProduct', { category })
    }
    else {
        res.redirect('/admin')
    }
},


postaddProduct: async (req, res) => {

    const image = req.files.map(file =>
        ({ path: file.filename })
    )
    console.log(typeof (image));
    await Product.findOne({ name: req.body.name })
        .then(async (product) => {
            if (product) {
                res.redirect('/admin/addProduct')
            }
            else {
                let product = new Product({
                    name: req.body.name,
                    price: req.body.price,
                    category: req.body.category,
                    mrp: req.body.mrp,
                    stock: req.body.stock,
                    description: req.body.description,
                    images: image

                })
                product.save()
                res.redirect('/admin/Products')
            }
        })
    console.log(req.body.category);
    // Initialize Toastr
    // toastr.options = {
    // positionClass: 'toast-top-right', // Position of the toast message
    // closeButton: true, // Show close button
    // progressBar: true, // Show progress bar
    // preventDuplicates: true // Prevent duplicates
    // };


},


getaddCategory: async (req, res) => {
    if (req.session.email) {
        const category = await Category.find()
        res.render('admin/category', { category })
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
    await Category.findOne({
        category_name: req.body.category
    }).then((category) => {
        if (category || req.body.category == "") {
            res.redirect('/admin/addCategory')
        }
        else {
            let category = new Category({
                category_name: req.body.category,
                images: image

            })
            category.save()
            res.redirect('/admin/addCategory')
        }
    })



},

getDeleteCategory: async (req, res) => {
    const id = req.query.id
    await Category.findOneAndDelete(id)
    res.redirect('/admin/addCategory')

},

geteditProduct: async (req, res) => {

    const id = req.query.id;
    await Product.findById(id).then(async (product) => {
        const category = await Category.find()
        if (product) {
            res.render('admin/editProduct', { product, category })
        }
        else {
            res.redirect('/admin/404')
        }
    })
},
puteditProduct: async (req, res) => {
    const id = req.body.id
    await Product.findByIdAndUpdate(id, {
        $set: {
            name: req.body.name,
            price: req.body.price,
            mrp: req.body.mrp,
            stock: req.body.stock,
            description: req.body.description
        }
    }, { new: true }
    );
    res.redirect('/admin/products');


},

getdeleteProduct: async (req, res) => {
    const id = req.query.id;
    console.log(id);
    await Product.findByIdAndDelete(id)
    res.redirect('/admin/products')

},
}
