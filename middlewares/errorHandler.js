const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    console.log('in error middleware')
    let error = {...err};
    error.message = err.message 
    console.log(error);

    // check mysql error Only populated from MySQL server error.
    if(error.errno) {
        error = new ErrorResponse(error.sqlMessage,400);
    }

    res.status(error.statusCode || 500).json({ errorInErrorHandler: error.message || "Server Error"})
}

module.exports = errorHandler;