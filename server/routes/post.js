const express = require('express');
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer_config');
const {addPost, modifyPost, deletePost, getPosts, getOnePost , likePost, getLikedPosts} = require('../controllers/post');

const router = express.Router();

router.get('/', auth, getPosts) 

router.get('/:id', auth, getOnePost)

router.post('/', auth, multer, addPost)

router.put('/:id',auth, multer, modifyPost)

router.delete('/:id',auth, deletePost)

router.post('/:id/like',auth,likePost)

router.get('/:id/like',auth, getLikedPosts)

module.exports = router;