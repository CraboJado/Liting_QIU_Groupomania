const express = require('express');
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer_config');
const { addPost, modifyPost, deletePost, getPosts, getOnePost , likePost, getLikedPosts} = require('../controllers/post');

const router = express.Router();

// get posts
router.get('/', auth, getPosts) 

// get the post of id
router.get('/:id', auth, getOnePost)

// create post
router.post('/', auth, multer, addPost)

// modify the post of id
router.put('/:id',auth, multer, modifyPost)

// delete the post of id
router.delete('/:id',auth, deletePost)

// like the post of id
router.post('/:id/like',auth,likePost)

// get users who like the post of id
router.get('/:id/like',auth, getLikedPosts)

module.exports = router;