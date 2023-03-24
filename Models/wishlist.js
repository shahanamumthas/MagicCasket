const mongoose = require('mongoose') 

const wishlistScheama =new mongoose.Schema ({
    userId :{
        type : mongoose.SchemaTypes.ObjectId,
        ref :'user'
    },
    productId :[{
        type : mongoose.SchemaTypes.ObjectId,
        ref : 'product'
    }]    
})

    const Wishlist = mongoose.model('Wishlist',wishlistScheama);

    module.exports = Wishlist;