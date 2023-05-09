const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },
    product: [{
        productId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'product'
        },
        quantity: Number,
        total:Number
    }],
})

const cart = mongoose.model("cart", cartSchema)
module.exports = cart