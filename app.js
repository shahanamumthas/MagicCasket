const express = require ('express');
require('dotenv').config({path:".env"})
const path = require ('path');
const session = require ('express-session')
const nocache = require ('nocache')
const logger = require ('morgan')
const ejs = require('ejs');
const mongoose = require('mongoose');
const cookieParser = require ('cookie-parser')
const methodOverride = require('method-override')


const app = express();

const db = require('./Config/connection')
db.dbConnect()


const adminRouter = require('./Routes/admin')
const userRouter = require('./Routes/user')
const cartRouter = require('./Routes/cart')
const productRouter = require('./Routes/product')


app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
  secret:process.env.Session_Secret,
  saveUninitialized:true,
  cookie:{maxAge:oneDay},
  resave:false
}))

app.use(nocache())
app.use(methodOverride('_method'))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({
  extended:true
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname,'./Public')))

app.use('/admin',adminRouter)
app.use('/product',productRouter)
app.use('/',userRouter)
app.use('/cart',cartRouter)



app.listen(process.env.PORT,()=>{
    console.log(`PORT ${ process.env.PORT } is running...`);
  });