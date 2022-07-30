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
    if(req.body.post && !req.file){
        return next( new ErrorResponse('mauvaise requête',400))
    }

    if(!req.body.post && req.file){
        deleteFile(req.file.filename,next);
        return next( new ErrorResponse('mauvaise requête',400))
    }
    //  when user publish only text
    let body = req.body;
    let { post_title, post_content } = body;
    let posts_query = 'INSERT INTO posts (post_id, user_id, post_title, post_content, `like`, dislike, create_time) VALUES (?, ?, ?, ?, ?, ?, ?)';
    let insert_values = [ uid(), req.params.userId, post_title, post_content, '[]', '[]', getMysqlDate() ];

    // when user publish text and photo
    if(req.file) {
        body = JSON.parse(req.body.post);
        post_title = body.post_title;
        post_content = body.post_content;
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

exports.modifyPost = (req, res, next) => {
    if(req.body.post && !req.file) {
        return next ( new ErrorResponse('mauvaise requête', 400))
    }

    if(!req.body.post && req.file) {
        deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400))
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

    let update_obj = {
        ...req.body,
        update_time : getMysqlDate()
    };

    if(req.file){
        update_obj = {
            ...JSON.parse(req.body.post),
            img_url : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            update_time : getMysqlDate()
        }
    }
    console.log(update_obj);
    const posts_query = 'SELECT * FROM posts WHERE ?';
    const posts_updateQuery = 'UPDATE posts SET ? WHERE ?';
    const values = { post_id : req.params.id };

    mysqlConnect.then( connection => {
        connection.query(posts_query ,values ,(error, results, fields) => {
            if(error) {
                if(req.file) deleteFile(req.file.filename,next);
                return next(error)
            }
            console.log('results',results);
        
            if(!req.auth.isAdmin && results[0].user_id !== req.auth.userId ){
                if(req.file) deleteFile (req.file.filename,next);
                return next( new ErrorResponse('requête non autorisée', 401) )
            }

            const result = results[0];
            connection.query(posts_updateQuery,[update_obj,values], (error, results, fields) => {
                if(error) {
                    if(req.file) deleteFile(req.file.filename,next);
                    return next(error)
                }

                // delete old file in the disk
                if(req.file && result.img_url !== null) {
                    const filename = result.img_url.split('/images/')[1];
                    deleteFile(filename,next);
                }
    
                // if !req.file, need to delete the file in the disk for cases when user want to delete the photo
                if(req.body.img_url === null && result.img_url !== null) {
                    const filename = result.img_url.split('/images/')[1];
                    deleteFile(filename,next);
                }

                res.status(201).json({message : 'publication modifié'})
            })
        })
    })
}

exports.deletePost = (req, res, next) => {
    mysqlConnect.then( connection => {
        const posts_query = 'SELECT * FROM posts WHERE ?';
        const values = {post_id : req.params.id};

        connection.query(posts_query, values, (error, results, fields) => {
            if(error) {
                return next(error)
            }

            if(!req.auth.isAdmin && req.auth.userId !== results[0].user_id){
                return next( new ErrorResponse('requête non autorisée',401))
            }

            const result = results[0];
            const query = 'UPDATE posts SET ? WHERE ?'
            const query_value = { delete_time : getMysqlDate() };

            connection.query(query, [query_value,values], (error, results, fields) => {
                if(error){
                    return next(error)
                }
                // soft delete, delete img in disk ?
                if(result.img_url !== null){
                    const filename = result.img_url.split('/images/')[1];
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



