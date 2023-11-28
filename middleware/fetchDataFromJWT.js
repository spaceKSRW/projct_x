const jwt = require('jsonwebtoken');

//verify token
function getData(token){
    try{
        const decoded = jwt.verify(token,process.env.secret_key);
        return decoded
    }catch(err){
        throw new Error("cannot fetch value from JWT");
    }
}

module.exports ={
    getData,
}