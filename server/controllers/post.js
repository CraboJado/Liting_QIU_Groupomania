const ErrorResponse = require('../utils/errorResponse');
const mysqlConnect = require('../config/db');
const getMysqlDate = require('../utils/getMysqlDate');
const uid = require('../utils/getUid');
const deleteFile = require('../utils/deleteFile')

exports.addPost = (req, res, next) => {
    const isFormData = req.get('content-type').includes('multipart/form-data');

    if(isFormData && (!req.body.post || !req.file)){
        if(req.file) deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400))
    }

    // user publish only text without file
    let { title, content } = req.body;
    let posts_query = 'INSERT INTO posts (id, user_id, title, content, create_time) VALUES (?, ?, ?, ?, ?)';
    let insert_values = [ uid(), req.params.userId, title, content, getMysqlDate() ];

    // user publish text with file
    if(isFormData) {
        title = JSON.parse(req.body.post).title;
        content = JSON.parse(req.body.post).content;
        const img_url = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        posts_query = 'INSERT INTO posts (id, user_id, title, content, img_url, create_time) VALUES (?, ?, ?, ?, ?, ?)';
        insert_values = [ uid(), req.params.userId, title, content, img_url, getMysqlDate() ];
    }

    mysqlConnect.then( connection => {
       connection.query(posts_query, insert_values, (error, results, fields) =>{
            if(error){
                if(req.file) deleteFile(req.file.filename,next);
                return next(error)
            }

            res.status(201).json({ message : 'publication ajouté' })
        })
    })
}

exports.modifyPost = (req, res, next) => {
    const isFormData = req.get('content-type').includes('multipart/form-data');

    if(isFormData && (!req.body.post || !req.file)){
        if(req.file) deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400))
    }

    // Check if post existe or not, then compare its user_id with the one of logined user
    const posts_query = 'SELECT user_id, img_url FROM posts WHERE id = ? AND delete_time IS ?';

    mysqlConnect.then( connection => {
        connection.query(posts_query ,[req.params.id, null] ,(error, results, fields) => {
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

            // when it comes to here, user and admin allow to modify the post.
            let update_obj = {
                title : req.body.title,
                content : req.body.content,
                update_time : getMysqlDate()
            };

            // if user want to delete the image in his post
            if(req.body.isDeleteImg === true){
                update_obj = {
                    ...update_obj,
                    img_url : null
                }
            }

            // if user want to modify the image in his post
            if(req.file){
                update_obj = {
                    title : JSON.parse(req.body.post).title,
                    content : JSON.parse(req.body.post).content,
                    img_url : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                    update_time : getMysqlDate()
                }
            }

            const update_query = 'UPDATE posts SET ? WHERE id = ?';

            const update_values = [ update_obj, req.params.id ];

            connection.query(update_query, update_values, (error, results, fields) => {
                if(error) {
                    if(req.file) deleteFile(req.file.filename,next);
                    return next(error)
                }

                // delete old img in the server 
                // if user modify the img OR user deletes the image in his post
                if((req.file && post.img_url !== null) || (req.body.isDeleteImg === true && post.img_url !== null) ) {
                    const filename = post.img_url.split('/images/')[1];
                    deleteFile(filename,next);
                }
    
                res.status(201).json({ message : 'publication modifié' })
            })
        })
    })
}

exports.deletePost = (req, res, next) => {

    mysqlConnect.then( connection => {
        // check if post existes or not, then compare its user_id to the logined user
        const posts_query = 'SELECT * FROM posts WHERE id = ? AND delete_time IS ?';
        // const posts_query = 'SELECT user_id, img_url FROM posts WHERE id = ? AND delete_time IS ?';

        connection.query(posts_query, [req.params.id,null], (error, results, fields) => {
            if(error) return next(error)
            
            if(!results.length) return next( new ErrorResponse('publication n\'existe pas',404))
            
            if(!req.auth.isAdmin && req.params.userId !== results[0].user_id){
                return next( new ErrorResponse('requête non autorisée',401))
            }

            const post = results[0];

            // soft delete, set delete_time and img_url to null
            const update_query = 'UPDATE posts SET ? WHERE id = ?';

            const update_obj = { img_url: null, delete_time : getMysqlDate() };

            connection.query(update_query, [ update_obj, req.params.id ], (error, results, fields) => {
                if(error) return next(error)
    
                // delete img in server if there is one
                if(post.img_url !== null){
                    const filename = post.img_url.split('/images/')[1];
                    deleteFile(filename,next)
                }
                
                // after delete the post, check if any comments and subcomments related to it in tbl replies
                // if there is any,delete them 
                // if not, send message to user
                const replies_query = 'SELECT id, img_url FROM replies WHERE post_id = ? AND delete_time IS ?'

                connection.query(replies_query, [ req.params.id, null ],(error, results) => {
                    if(error) return next(error);

                    if(!results.length) return res.status(201).json({ message : 'publication supprimé' });

                    // get reply ids related to the deleted post
                    // delete img in the server for the reply with img
                    const ids = results.map ( ele => {
                        if( ele.img_url !== null ){
                            const filename = ele.img_url.split('/images/')[1];
                            deleteFile(filename,next)
                        }
                        return ele.id
                    })

                    const update_query = `update replies set ? where id IN (?)`;

                    const update_obj = { img_url: null, delete_time : getMysqlDate() };

                    connection.query(update_query, [ update_obj, ids ], (error, results) => {
                        if(error) next(error);

                        res.status(201).json({ message : 'publication supprimé' })
                    })
                })
            })
        })
    })
}

exports.getPosts = (req, res, next) => {
    const posts_query = `SELECT t.*, CAST(create_time AS CHAR) as create_timeJS FROM posts t 
                        WHERE delete_time IS ? 
                        ORDER BY create_time DESC 
                        LIMIT ?,10`;
    
    mysqlConnect.then( connection => {
        connection.query(posts_query,[ null, req.body.number ],(error, results, fields) => {
            if(error) return next(error);

            res.status(201).json(results);
        })
    })
}

exports.getPost = (req, res, next) => {
    const posts_query = 'SELECT * FROM posts WHERE delete_time IS ? AND post_id = ?';
    mysqlConnect.then( connection => {
        connection.query(posts_query,[ null, req.params.id ],(error, results, fields) => {
            if(error) return next(error)

            res.status(201).json(results);
        })
    })
}

exports.likePost = (req, res, next) => {
    if(!Number.isInteger(req.body.like) || req.body.like > 1 || req.body.like < -1) {
        return next( new ErrorResponse('mauvaise requête',400));
    }

    const posts_query = 'SELECT post_id FROM posts WHERE post_id = ? AND delete_time IS ?';

    mysqlConnect.then( connection => {
        connection.query(posts_query,[ req.params.id, null], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return next( new ErrorResponse('la publication n\'existe pas',404));

            const reactions_query = 'SELECT * FROM reactions WHERE post_id = ? AND user_id = ?';

            connection.query(reactions_query,[req.params.id, req.params.userId],(error, results, fields) => {
                if(error) return next(error);
    
                if(!results.length) {
                    if(req.body.like === 0) return next( new ErrorResponse('mauvaise requête',400));
    
                    const insert_query = 'INSERT INTO reactions(user_id, post_id, reaction, create_time) VALUES(?,?,?,?)';

                    return connection.query(insert_query,[req.params.userId, req.params.id, req.body.like , getMysqlDate() ], (error, results, fields) => {
                        if(error) return next(error);
    
                        if(req.body.like === 1) return res.status(201).json({ message: 'like réussie' });
        
                        res.status(201).json({ message: 'dislike réussie' });
                    })
                }
    
                if((results[0].reaction !== 0 && req.body.like !== 0) || (results[0].reaction === 0 && req.body.like === 0)){
                    return next( new ErrorResponse('mauvaise requête',400))
                }
    
                const update_query = 'UPDATE reactions SET ? WHERE post_id = ? AND user_id = ?';
    
                const update_values = [ { reaction: req.body.like, update_time: getMysqlDate() }, req.params.id, req.params.userId ];
    
                connection.query(update_query, update_values, (error, results, fields) => {
                    if(error) return next(error);
    
                    if(req.body.like === 1) return res.status(201).json({ message: 'like réussie' });
    
                    if(req.body.like === -1) return res.status(201).json({ message: 'dislike réussie' });
    
                    res.status(201).json({ message: 'annulation réussie' });
                })
            })
        })
    })
}



