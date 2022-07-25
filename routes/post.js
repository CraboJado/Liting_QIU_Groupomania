const express = require('express');
const router = express.Router();
const {addPost, modifyPost, deletePost, getAllPosts} = require('../controllers/post');
const multer = require('../middlewares/multer_config');
const auth = require('../middlewares/auth');

router.get('/:userId', auth, getAllPosts)

router.get('/:id/:userId',(req,res,next)=>{
    res.status(200).json({message : 'get one post route'})
})

router.post('/:userId', auth, multer, addPost)

router.put('/:id/:userId',auth, multer, modifyPost)

router.delete('/:id/:userId',auth, deletePost)

router.post('/:id/:userId/like',(req,res,next)=>{
    res.status(201).json({message : 'like or dislike post route'})
})

// router.put('/:id',(req,res,next)=>{
//     res.status(201).json({message : 'modify post route'})
// })

// router.delete('/:id',(req,res,next)=>{
//     res.status(201).json({message : 'delete post route'})
// })

// router.post('/:id/like',(req,res,next)=>{
//     res.status(201).json({message : 'like or dislike post route'})
// })

module.exports = router;