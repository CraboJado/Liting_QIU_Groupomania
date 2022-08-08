const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');

const auth = (req, res, next) => {
    console.log('in auth controller');

    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token) return next( new ErrorResponse('non autorisée, identifiants valides manquants',401))
    
    const decodedToken = jwt.verify(token,process.env.TOKEN_KEY);
    const { data: userId, isAdmin } = decodedToken;
    req.auth = { isAdmin };

    if( userId !== req.params.userId ){
       return next( new ErrorResponse('non autorisée, identifiants invalides',401))
    }
    
    next();
} 

module.exports = auth;