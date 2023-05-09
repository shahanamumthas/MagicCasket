const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    lname : String,
    fname : String,
    email :{
        type :String,
        require : true,
        unique :true
    },
    password : String,
    cpassword : String,
    number : Number,
    status : Boolean,
    address:[{
        fname:String,
        lname:String,
        housename:String,
        city:String,
        state:String,
        pin:Number,
        country:String
    }],
    resetToken:String,
    resetTokenExpiration:Date,
    access:{
        type:Boolean,
        default:true 
    }
})

const User = mongoose.model('User',userSchema);
module.exports = User;
