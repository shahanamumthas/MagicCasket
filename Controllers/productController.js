const express = require('express');
const router = express.Router();
const Product = require('../Models/product');
const Category = require('../Models/category');
const multer = require('../Middlewares/multer');

let msg = ""

module.exports = {
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
        res.redirect('/admin/')
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
    await Product.findById(id).then(async (product) => {
        const category = await Category.find()
        if (product) {
            res.render('../Views/admin/editProduct', { product, category })
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
    res.redirect('/product/products');


},

getdeleteProduct: async (req, res) => {
    const id = req.query.id;
    console.log(id);
    await Product.findByIdAndDelete(id)
    res.redirect('/product/products')

},
}
