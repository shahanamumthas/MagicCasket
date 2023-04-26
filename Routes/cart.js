const express = require('express')
const router = express.Router()
const userController =require('../Controllers/userController')
// const cartController = require('../Controllers/cartController')
const {userLoginVerify} = require('../Middlewares/session')



router.post('/addToCart',userController.postAddToCart)

router.get('/cart', userLoginVerify, userController.getCart)

router.post('/countInc', userLoginVerify, userController.postCountIncrease)

router.post('/countDec', userLoginVerify, userController.postCountDesrease)

router.get('/delCartItem/:id', userLoginVerify, userController.getDelCartItem)

router.post('/getProceedToBuy', userLoginVerify, userController.PostProceedToBuy)

router.get('/checkout', userLoginVerify, userController.getCheckout)

router.get('/addAddress', userLoginVerify, userController.getAddAddress)

router.post('/addAddress', userLoginVerify, userController.postAddaddress)

router.get('/deleteOrderAddress', userLoginVerify, userController.getdeleteOrderAddress);

router.post('/postCheckout/:method',userLoginVerify,userController.postCheckOut)

router.post('/verifyPayment', userLoginVerify,userController.verifyPayment)

router.get('/orderSuccess',userLoginVerify,userController.getOrderSuccess)

router.get('/buyNow',userLoginVerify,userController.getBuyNow)

router.post('/postBuyNow/:method',userLoginVerify,userController.postBuyNow)

router.post('/buyNowVerifyPayment', userLoginVerify,userController.buyNowVerifyPayment)

module.exports = router;