let msg="";

module.exports = {

    adminLoginVerify :(req,res,next)=>{
        if(req.session.email){
            next();
        }
        else{
            res.redirect('/admin')
        }
    },
    userLoginVerify:(req,res,next)=>{
        if(req.session.email){
            next();
        }
        else{
            res.redirect('/profile')
        }
    },
    verifyUserLogout :(req,res,next)=>{
        if(req.session.email){
            res.redirect('/profile')
        
        }
        else{
            next();
        }
    }
}