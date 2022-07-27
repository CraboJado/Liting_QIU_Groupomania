const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');

const auth = (req, res, next) => {
    console.log('in auth controller');
    // console.log('req.params.userId',req.params.userId);


    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token){
        return next( new ErrorResponse('unauthorized request, missing valid credentials',401))
    }

    const decodedToken = jwt.verify(token,process.env.TOKEN_KEY);
    const { data: userId, isAdmin } = decodedToken;
    req.auth = { userId, isAdmin };

    if( userId !== req.params.userId ){
       return next( new ErrorResponse('unauthorized request, invalid credentials',401))
    }
    
    next();
} 

module.exports = auth;