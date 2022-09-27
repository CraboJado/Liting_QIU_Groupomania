const jwt = require('jsonwebtoken');
const { ErrorResponse } = require('../utils/utils');

const auth = (req, res, next) => {
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token) return next( new ErrorResponse('non autorisée, identifiants valides manquants',401))
    
    const decodedToken = jwt.verify(token,process.env.TOKEN_KEY);
    const { data: userId, isAdmin } = decodedToken;
    req.auth = { isAdmin , userId };

    next();
} 

module.exports = auth;