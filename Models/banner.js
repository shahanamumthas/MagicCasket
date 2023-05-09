const mongoose= require('mongoose');
const bannerSchema = new mongoose.Schema({
    title : {
        type : String,
    },
    image:{
        type: Array,
        required: true,
    },
    description :{
        type : String,

    },
    imgUrl :{
        type : String
    }
});

const Banner = mongoose.model('Banner',bannerSchema);


module.exports = Banner;