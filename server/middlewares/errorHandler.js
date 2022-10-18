const { ErrorResponse } = require('../utils/utils');

const errorHandler = (err, req, res, next) => {

    // copy err obj then assign to error Obj
    let error = {...err};
    error.message = err.message 

    // if error is populated from MySQL server error, response MySQL server error symbol (error.code)
    if(error.errno) {
        error = new ErrorResponse(error.code,400);
    }

    // if error is from JsonWebToken, customize error response
    if(error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        error = new ErrorResponse(error.message,401);
    }

    res.status(error.statusCode || 500).json({ errorMsg: error.message || "Server Error"})
}

module.exports = errorHandler;