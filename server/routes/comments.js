const express = require('express');
const auth = require('../middlewares/auth')
const multer = require('../middlewares/multer_config');
const { getComments, addComment, modifyComment, likeComment, deleteComment } = require('../controllers/comments')

const router = express.Router();

router.get('/', auth, getComments)

router.post('/',auth, multer,addComment)

router.put('/:id',auth,multer,modifyComment)

router.delete('/:id',auth, deleteComment)

router.post('/:id/like', auth, likeComment)

module.exports = router