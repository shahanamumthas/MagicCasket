const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    orderDetail: [{
        productDetail: [{
            productId: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'product',
            },
            quantity: Number,
            total:Number,
            orderStatus: {
                type: String,
                default: 'Pending'
            },
        }],
        total: Number,
        address: {
            type: Object
        },
        transactionId: {
            type: String
        },
        paymentStatus: {
            type: String,
            default: 'Pending'
        },
        time: {
            type: Date,
            default: Date.now,
        }
    }],
})


const order = mongoose.model("order", orderSchema)
module.exports = order;