const { default: mongoose } = require('mongoose')
const mongoode =require ('mongoose')


const contactSchema = mongoose.Schema({
    email :{
        type : String
    },
    message :{
        type : String
    }
})

const Contact = mongoose.model('Contact',contactSchema)

module.exports = Contact;