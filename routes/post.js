const express = require('express');
const router = express.Router();

router.get('/',(req,res,next)=>{
    res.status(200).json({message : 'get all posts route'})
})

router.get('/:id',(req,res,next)=>{
    res.status(200).json({message : 'get one post route'})
})

// send userID in body
router.post('/',(req,res,next)=>{
    res.status(201).json({message : 'add post route'})
})

router.put('/:id',(req,res,next)=>{
    res.status(201).json({message : 'modify post route'})
})

router.delete('/:id',(req,res,next)=>{
    res.status(201).json({message : 'delete post route'})
})

router.post('/:id/like',(req,res,next)=>{
    res.status(201).json({message : 'like or dislike post route'})
})

// send userID in param
// router.post('/:userId',(req,res,next)=>{
//     res.status(201).json({message : 'add post route'})
// })

// router.put('/:id/:userId',(req,res,next)=>{
//     res.status(201).json({message : 'modify post route'})
// })

// router.delete('/:id/:userId',(req,res,next)=>{
//     res.status(201).json({message : 'delete post route'})
// })

// router.post('/:id/:userId/like',(req,res,next)=>{
//     res.status(201).json({message : 'like or dislike post route'})
// })

module.exports = router;