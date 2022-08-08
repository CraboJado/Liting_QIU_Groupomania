const path = require('path');
const fs = require('fs');
const ErrorResponse = require('./errorResponse');

const deleteFile = (filename,next) => {
    const filePath = path.join(__dirname,`../public/images/${filename}`);
    console.log('filePath',filePath)
    fs.unlink(filePath, err => {
        if(err){
            return next(new ErrorResponse ('requête échoué AA', 500))
        }
    })
}

module.exports = deleteFile;