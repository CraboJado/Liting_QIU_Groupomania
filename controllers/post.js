const ErrorResponse = require('../utils/errorResponse');
const mysqlConnect = require('../config/db');
const getMysqlDate = require('../utils/getMysqlDate');
const uid = require('../utils/getUid');
const fs = require('fs');
const path = require('path');

const deleteFile = (filename,next) => {
    const filePath = path.join(__dirname,`../public/images/${filename}`);
    console.log('filePath',filePath)
    fs.unlink(filePath, err => {
        if(err){
            return next(new ErrorResponse ('requête échoué AA', 500))
        }
    })
}

exports.addPost = (req, res, next) => {
    console.log('in addPost controller');
    const isFormData = req.get('content-type').includes('multipart/form-data');

    if(isFormData && (!req.body.post || !req.file)){
        if(req.file) deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400))
    }

    //  when user publish only text
    let { post_title, post_content } = req.body;
    let posts_query = 'INSERT INTO posts (post_id, user_id, post_title, post_content, `like`, dislike, create_time) VALUES (?, ?, ?, ?, ?, ?, ?)';
    let insert_values = [ uid(), req.params.userId, post_title, post_content, '[]', '[]', getMysqlDate() ];

    // when user publish text and photo
    if(isFormData) {
        post_title = JSON.parse(req.body.post).post_title;
        post_content = JSON.parse(req.body.post).post_content;
        const img_url = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        posts_query = 'INSERT INTO posts ( post_id, user_id, post_title, post_content, img_url, `like`, dislike, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        insert_values = [ uid(), req.params.userId, post_title, post_content, img_url, '[]', '[]', getMysqlDate() ];
    }

    mysqlConnect.then( connection => {
       connection.query(posts_query, insert_values, (error, results, fields) =>{
            if(error){
                if(req.file) deleteFile(req.file.filename,next);
                return next(error)
            }
            res.status(201).json({message : 'publication ajouté'})
        })
    })
}

    /* 
    si img display none : means user want to delete the photo in his publication, otherwise, means user modify only the text content
    frontend : img display none ? img_url === null : img_url === "http://localhost:3000/images/hellboy_sauce_hellfire_jpg_1658700756357.jpg"
        req.body = {
                "post_title": "post title1 MODI 121",
        "post_content": "121 a long textssssssssssss"
        "img_url" : "http://localhost:3000/images/hellboy_sauce_hellfire_jpg_1658700756357.jpg" or null
        } 
    */


exports.modifyPost = (req, res, next) => {
    console.log('in modifypost req.params', req.params)
    const isFormData = req.get('content-type').includes('multipart/form-data');

    if(isFormData && (!req.body.post || !req.file)){
        if(req.file) deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400))
    }
    
    const posts_query = 'SELECT * FROM posts WHERE post_id = ?';
    mysqlConnect.then( connection => {
        connection.query(posts_query ,[req.params.id] ,(error, results, fields) => {
            if(error) {
                if(req.file) deleteFile(req.file.filename,next);
                return next(error)
            }
            
            if(!results.length){
                if(req.file) deleteFile(req.file.filename,next);
                return next( new ErrorResponse('publication n\'existe pas',404))
            }

            const post = results[0];
        
            if(!req.auth.isAdmin && post.user_id !== req.params.userId ){
                if(req.file) deleteFile (req.file.filename,next);
                return next( new ErrorResponse('requête non autorisée', 401) )
            }

            let update_obj = {
                post_title : req.body.post_title,
                post_content : req.body.post_content,
                update_time : getMysqlDate()
            };

            if(req.body.img_url === null){
                update_obj = {
                    ...update_obj,
                    img_url : null
                }
            }

            if(req.file){
                update_obj = {
                    post_title : JSON.parse(req.body.post).post_title,
                    post_content : JSON.parse(req.body.post).post_content,
                    img_url : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                    update_time : getMysqlDate()
                }
            }
            console.log(update_obj)
            const update_query = 'UPDATE posts SET ? WHERE post_id = ?';
            const update_values = [ update_obj, req.params.id ];
            connection.query(update_query, update_values, (error, results, fields) => {
                if(error) {
                    if(req.file) deleteFile(req.file.filename,next);
                    return next(error)
                }

                if((req.file && post.img_url !== null) || (req.body.img_url === null && post.img_url !== null) ) {
                    const filename = post.img_url.split('/images/')[1];
                    deleteFile(filename,next);
                }
    
                res.status(201).json({message : 'publication modifié'})
            })
        })
    })
}

exports.deletePost = (req, res, next) => {
    mysqlConnect.then( connection => {
        const posts_query = 'SELECT * FROM posts WHERE post_id = ? AND delete_time IS ?';
        connection.query(posts_query, [req.params.id,null], (error, results, fields) => {
            if(error) {
                return next(error)
            }

            if(!results.length) return next( new ErrorResponse('publication n\'existe pas',404))
            
            if(!req.auth.isAdmin && req.auth.userId !== results[0].user_id){
                return next( new ErrorResponse('requête non autorisée',401))
            }

            const post = results[0];
            const query = 'UPDATE posts SET ? WHERE post_id = ?'
            const query_value = { 
                    img_url: null, 
                    delete_time : getMysqlDate() 
                };
            connection.query(query, [query_value,req.params.id], (error, results, fields) => {
                if(error){
                    return next(error)
                }
                // soft delete, only delete img in disk 
                if(post.img_url !== null){
                    const filename = post.img_url.split('/images/')[1];
                    deleteFile(filename,next)
                }

                res.status(201).json({message : 'publication supprimé'})
            })
        })
    })
}

exports.getAllPosts = (req, res, next) => {
    const posts_query = 'SELECT * FROM posts WHERE delete_time IS ?';
    mysqlConnect.then( connection => {
        connection.query(posts_query,[null],(error, results,fields) => {
            if(error){
                return next(error)
            }
            res.status(201).json(results);
        })
    })
}

exports.getPost = (req, res, next) => {
    const posts_query = 'SELECT * FROM posts WHERE delete_time IS ? AND post_id = ?';
    const values = [ null, req.params.id]
    mysqlConnect.then( connection => {
        connection.query(posts_query,values,(error, results, fields) => {
            if(error) {
                return next(error)
            }
            console.log(results);
            res.status(201).json(results);
        })
    })
}

const getUpdateValues = (req,post) => {
    const {like, dislike} = post;
    const foundDislike = dislike.find(element => element === req.auth.userId);
    const foundLike = like.find(element => element === req.auth.userId);
    const values = [req.params.id]
    let update_values

    if(req.body.like === -1) {
        dislike.push(req.auth.userId);
        update_values = [{ dislike : JSON.stringify(dislike) },values];
    }

    if(req.body.like === 1) {
        like.push(req.auth.userId);
        update_values = [{ like : JSON.stringify(like) },values];
    }

    if(req.body.like === 0) {
        if(foundLike) {
            const newLike = like.filter( element => element !== req.auth.userId );
            update_values = [{ like : JSON.stringify(newLike) },values];
        }

        if(foundDislike) {
            const newDislike = dislike.filter( element => element !== req.auth.userId );
            update_values = [{ dislike : JSON.stringify(newDislike) },values];
        }
    }

    return update_values
}

exports.likePost = (req, res, next) => {
    console.log('in likePost controller', req.body.like)
    const posts_query = 'SELECT * FROM posts WHERE post_id = ?'
    const values = [req.params.id]

    mysqlConnect.then( connection => {
        connection.query(posts_query,values,(error, results, fields) => {
            if(error){
                return next(error)
            }
            const { like, dislike } = results[0];
            const foundDislike = dislike.find(element => element === req.auth.userId);
            const foundLike = like.find(element => element === req.auth.userId);

            // user can't like or dislike twice the same post or like a disliked-post or dislike a liked-post
            if((foundLike || foundDislike) && req.body.like != 0 ) {
                return next( new ErrorResponse('mauvaise requête',400) )
            }
            // user can't cancle if he doesn't like nor dislike a post 
            if((!foundLike && !foundDislike) && req.body.like === 0) {
                return next( new ErrorResponse('mauvaise requête',400) )
            }

            const posts_update = 'UPDATE posts SET ? WHERE post_id = ?';
            const update_values = getUpdateValues(req,results[0]);
            connection.query(posts_update,update_values,(error,results,fields) => {
                if(error){
                    return next(error)
                }
                if(req.body.like === 0){
                    res.status(201).json({message : 'annulation réussie'})
                }
                if(req.body.like === 1){
                    res.status(201).json({message : 'like réussie'})
                }
                if(req.body.like === -1){
                    res.status(201).json({message : 'dislike réussie'})
                } 
            })

        })
    })
    
}



