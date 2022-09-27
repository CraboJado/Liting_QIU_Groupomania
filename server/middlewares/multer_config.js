const multer = require('multer');

const MIME_TYPES = {
    'image/jpg' :'jpg',
    'image/jpeg' :'jpg',
    'image/png' :'jpg'
}

const storage = multer.diskStorage({
    destination : (req, file, callback) => {
        callback(null, './public/images');
    },
    filename : (req, file, callback) => {
        const regEx = /[\.\s-]/g;
        const name = file.originalname.replace(regEx,'_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name +'_'+ Date.now() +'.'+ extension);
    }
})

const fileFilter = (req, file, callback) => {
    if((file.mimetype).includes('jpeg') || (file.mimetype).includes('png') || (file.mimetype).includes('jpg')){
        callback(null, true);
    }else {
        callback(null, false);
    }
}

const upload = multer({ storage , fileFilter, limits:{fieldSize: 25 * 1024 * 1024} })

module.exports = upload.single('image');