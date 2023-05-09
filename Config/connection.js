//  connect to db
const mongoose = require('mongoose');
require('dotenv').config({path:'.env'});

mongoose.set('strictQuery',false);

module.exports = {
    dbConnect:() => {
        mongoose.connect(process.env.MONGODB_URL,{
            useNewUrlParser: true, 
            useUnifiedTopology: true
        })
        .then(()=>
            console.log('Database connected')
        )
        .catch((err) =>
            console.log("error"+err)
        )
        mongoose.connection.on('connected',()=>{
            console.log('MongoDB connected')
        })
        mongoose.connection.on('disconnected',()=>{
            console.log('MongoDB Disconnected')
        });
    }
};