const { ErrorResponse } = require('../utils/utils');

const errorHandler = (err, req, res, next) => {
    console.log('in error middleware')
    // copy err obj then assign to error Obj
    let error = {...err};
    error.message = err.message 
    console.log(error);

    // if error is populated from MySQL server error, response MySQL server error symbol (error.code)
    if(error.errno) {
        error = new ErrorResponse(error.code,400);
    }

    // if error is from JsonWebToken, customize error response
    if(error.name === 'JsonWebTokenError' || 'TokenExpiredError') {
        error = new ErrorResponse(error.message,400);
    }

    res.status(error.statusCode || 500).json({ errorMsg: error.message || "Server Error"})
}

module.exports = errorHandler;