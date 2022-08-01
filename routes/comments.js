const express = require('express');
const router = express.Router();
const multer = require('../middlewares/multer_config');
const auth = require('../middlewares/auth')
const { addComment, modifyComment, deleteComment, getAllComments, likeComment} = require('../controllers/comments')

router.get('/:userId/:postId', auth, getAllComments)

router.post('/:userId/:postId',auth, multer,addComment)

router.put('/:id/:userId',auth,multer,modifyComment)

router.delete('/:id/:userId',auth, deleteComment)

router.post('/:id/:userId/like', auth, likeComment)

router.post('/:userId/:id/reply',(req,res,next) => {
    res.status(200).json({ message: 'reply at one comment'})
})

module.exports = router