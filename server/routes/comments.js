const express = require('express');
const auth = require('../middlewares/auth')
const multer = require('../middlewares/multer_config');
const { getComments, addComment, modifyComment, likeComment, deleteComment } = require('../controllers/comments')

const router = express.Router();

// get comments
router.get('/', auth, getComments)

// creat comment
router.post('/',auth, multer,addComment)

// modify the comment of id
router.put('/:id',auth,multer,modifyComment)

// delete the comment of id
router.delete('/:id',auth, deleteComment)

// like the comment of id 
router.post('/:id/like', auth, likeComment)

module.exports = router