const mongoose=require('mongoose');
const { array } = require('../Middlewares/multer');

const categorySchema = new mongoose.Schema({
    category_name: { 
        type: String, 
        uppercase: true,
        required : true
    },
    images :{
        type :Array
    }
    
    
})

const category = mongoose.model('category', categorySchema);

module.exports = category;

