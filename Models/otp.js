const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

mongoose.set('strictQuery', false);

const otpSchema = new Schema({
    otp:{ 
        type:Number, 
        required:true 
    },
    email:{ 
        type:String ,
        required:true  
    },
    expiration :{ 
        type:Date, 
        required:true  
    }
}); 

const otp = mongoose.model('otp',otpSchema)
module.exports = otp;