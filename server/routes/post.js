const express = require('express');
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer_config');
const {addPost, modifyPost, deletePost, getAllPosts, getPost , likePost} = require('../controllers/post');

const router = express.Router();

router.get('/:userId', auth, getAllPosts)

router.get('/:id/:userId', auth, getPost)

router.post('/:userId', auth, multer, addPost)

router.put('/:id/:userId',auth, multer, modifyPost)

router.delete('/:id/:userId',auth, deletePost)

router.post('/:id/:userId/like',auth,likePost)

module.exports = router;