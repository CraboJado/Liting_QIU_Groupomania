const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    console.log('in error middleware')
    let error = {...err};
    error.message = err.message 
    
    if(error.errno) {
        error = new ErrorResponse(error.sqlMessage,400);
    }

    res.status(error.statusCode || 500).json({ errorInMiddle: error.message || "Server Error"})
}

module.exports = errorHandler;