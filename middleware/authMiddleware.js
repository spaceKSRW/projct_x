const jwt = require('jsonwebtoken');
require('dotenv').config();

const requireAuth =(req,res,next)=>{
    const token =req.cookies.jwt;
    if(token){
      jwt.verify(token,process.env.secret_key,(err,decodedToken)=>{
      if(err){
        res.redirect('/portal')
      }
      else{
        next();
      }
      })
    }else{
        res.redirect('/portal');
    }
}

module.exports = {
    requireAuth,
}