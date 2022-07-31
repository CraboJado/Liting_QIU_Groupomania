const express = require('express');
const router = express.Router();
const multer = require('../middlewares/multer_config');
const {addComment} = require('../controllers/comments')

router.get('/:userId/:postId',(req,res,next) => {
    res.status(200).json({ message: 'get all comments'})
})

router.post('/:userId/:postId',multer,addComment)

router.put('/:id/:userId',(req,res,next) => {
    res.status(200).json({ message: 'modify comment_id : aaa'})
})

router.delete('/:id/:userId',(req,res,next) => {
    res.status(200).json({ message: 'delete comment_id : bbb'})
})

router.post('/:userId/like',(req,res,next) => {
    res.status(200).json({ message: 'like one comment'})
})

router.post('/:userId/:id/reply',(req,res,next) => {
    res.status(200).json({ message: 'reply at one comment'})
})

module.exports = router