const ErrorResponse = require('../utils/errorResponse');
const mysqlConnect = require('../config/db');
const getMysqlDate = require('../utils/getMysqlDate');
const fs = require('fs');
const path = require('path');


exports.addPost = (req, res, next) => {
    console.log('in addPost controller');
    if(req.body.post && !req.file){
        return next( new ErrorResponse('bad request',400))
    }

    if(!req.body.post && req.file){
        // const filePath = path.join(__dirname,`../public/images/${req.file.filename}`);
        const filePath = `./public/images/${req.file.filename}`;
        console.log(filePath);
        fs.unlink(filePath, err => {
            if(err) {
                return next(new ErrorResponse ('delete file failed', 400))
            }
            console.log('delete file ok');
            return next( new ErrorResponse('bad request',400))
        })
    }

    let body, posts_query, insert_values;

    const mysqlDate = getMysqlDate();

    const user_id = req.params.userId;

    if(req.body.post) {
        body = JSON.parse(req.body.post);
        const { post_title, post_content } = body; 
        const fileUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        posts_query = 'INSERT INTO posts (user_id, post_title, post_content, img_url, `like`, dislike, create_time) VALUES (?, ?, ?, ?, ?, ?,?)';
        insert_values = [ user_id, post_title, post_content,fileUrl, '[]', '[]', mysqlDate];

    }else {
        body = req.body;
        const { post_title, post_content } = body;
        posts_query = 'INSERT INTO posts (user_id, post_title, post_content, `like`, dislike, create_time) VALUES (?, ?, ?, ?, ?, ?)';
        insert_values = [ user_id, post_title, post_content, '[]', '[]', mysqlDate];
    }
    
    mysqlConnect.then( connection => {
       connection.query(posts_query, insert_values, (error, results, fields) =>{
            if(error){
                return next(error)
            }
            res.status(201).json({message : 'add post route'})
        })
    })
}

const deleteFile = (req,next) => {
    const filePath = path.join(__dirname,`../public/images/${req.file.filename}`);
    console.log('filePath',filePath)
    fs.unlink(filePath, err => {
        if(err){
            return next(new ErrorResponse ('delete file failed', 500))
        }
    })
}

exports.modifyPost = (req, res, next) => {
    if(req.body.post && !req.file) {
        return next ( new ErrorResponse('bad request,must provide a file', 400))
    }

    if(!req.body.post && req.file) {
        deleteFile (req,next);
        return next ( new ErrorResponse('bad request', 400))
    }

    const posts_query = 'SELECT * FROM posts WHERE ?';
    const posts_updateQuery = 'UPDATE posts SET ? WHERE ?'
    const values = { post_id : req.params.id };

    let update_obj = {
        ...req.body,
        update_time : getMysqlDate()
    }

    if(req.file){
        update_obj = {
            ...JSON.parse(req.body.post),
            img_url : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            update_time : getMysqlDate()
        }
    }

    mysqlConnect.then( connection => {
        connection.query(posts_query ,values ,(error, results, fields) => {
            if(error) {
                return next(error)
            }
            console.log('results',results);
            if(!req.auth.isAdmin && results[0].user_id !== + req.params.userId ){
                if(!req.file){
                    return next ( new ErrorResponse('1you are trying to modify a unauthoriezd post', 401))
                }
                deleteFile (req,next);
                return next ( new ErrorResponse('2you are trying to modify a unauthoriezd post', 401))
            }

            if(req.file && results[0].img_url !== null) {
                req.file.filename = results[0].img_url.split('/images/')[1];
                deleteFile(req,next);
            }

            connection.query(posts_updateQuery,[update_obj,values], (error, results, fields) => {
                if(error) {
                    return next(error)
                }
                res.status(201).json({message : 'modify post sucessfully'})
            })
        })
    })
}

