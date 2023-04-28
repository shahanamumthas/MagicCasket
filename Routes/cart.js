const express = require('express')
const router = express.Router()
const cartController =require('../Controllers/cartController')
// const cartController = require('../Controllers/cartController')
const {userLoginVerify} = require('../Middlewares/session')



router.post('/addToCart',userLoginVerify,cartController.postAddToCart)

router.get('/cartPage', userLoginVerify, cartController.getCart)

router.post('/countInc', userLoginVerify, cartController.postCountIncrease)

router.post('/countDec', userLoginVerify, cartController.postCountDesrease)

router.get('/delCartItem/:id', userLoginVerify, cartController.getDelCartItem)

// router.post('/getProceedToBuy', userLoginVerify, cartController.PostProceedToBuy)

router.get('/checkout', userLoginVerify, cartController.getCheckout)

router.get('/addAddress', userLoginVerify, cartController.getAddAddress)

router.post('/addAddress', userLoginVerify, cartController.postAddaddress)

router.get('/deleteOrderAddress', userLoginVerify, cartController.getdeleteOrderAddress);

router.post('/postCheckout/:method',userLoginVerify,cartController.postCheckOut)

router.post('/verifyPayment', userLoginVerify,cartController.verifyPayment)

router.get('/buyNow',userLoginVerify,cartController.getBuyNow)

router.post('/postBuyNow/:method',userLoginVerify,cartController.postBuyNow)

router.post('/buyNowVerifyPayment', userLoginVerify,cartController.buyNowVerifyPayment)

module.exports = router;