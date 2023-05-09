const mongoose = require ('mongoose')

const reviewSchema = new mongoose.Schema({

    head :{
        type:String,
    },
    description:{
        type:String
    },
    userId :{
        type : mongoose.SchemaTypes.ObjectId,
        ref : 'user'
    },
    productId : {
        type : mongoose.SchemaTypes.ObjectId,
        ref : 'product'
    },
    date :{
        type: Date,
        default: Date.now,
    }
})

const review = mongoose.model("Review", reviewSchema)
module.exports = review