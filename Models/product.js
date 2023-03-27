const mongoose = require('mongoose');
const { array } = require('../Middlewares/multer');

const productSchema = new mongoose.Schema({
    name: String,
    category: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'category'
    },
    price: {
        type: Number,
    },
    mrp: {
        type: Number,
    },
    stock: {
        type: Number,
    },
    description: {
        type: String,
    },
   
    images: [{
        path: { 
            type: String, 
        },
    }]
})


const product = mongoose.model("product", productSchema);
module.exports = product;