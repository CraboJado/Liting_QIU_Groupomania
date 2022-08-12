const express = require('express');
const auth = require('../middlewares/auth')
const multer = require('../middlewares/multer_config');
const { addReply, modifyReply, deleteReply, getReplies, likeReply} = require('../controllers/replies')

const router = express.Router();

router.get('/:userId', auth, getReplies)

router.post('/:userId',auth, multer,addReply)

router.put('/:id/:userId',auth,multer,modifyReply)

router.delete('/:id/:userId',auth, deleteReply)

router.post('/:id/:userId/like', auth, likeReply)

module.exports = router