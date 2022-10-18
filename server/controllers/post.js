const mysqlConnect = require('../config/db');
const { ErrorResponse, getMysqlDate, uid, deleteFile, deleteHandler } = require('../utils/utils');


exports.addPost = (req, res, next) => {
    // ensure user request format is valid
    if(!req.file && req.body.post ){
        return next( new ErrorResponse('mauvaise requête', 400) )
    }

    if(req.file && !req.body.post ){
        deleteFile( req.file.filename, next );
        return next( new ErrorResponse('mauvaise requête', 400) )
    }

    // user publish only text without file
    let { title, content } = req.body;
    let posts_query = 'INSERT INTO posts (id, user_id, title, content, create_time) VALUES (?, ?, ?, ?, ?)';
    let insert_values = [ uid(), req.auth.userId, title, content, getMysqlDate() ];

    // user publish with file 
    if(req.file) {
        const img_url = req.file.filename;
        title = JSON.parse(req.body.post).title;
        content = JSON.parse(req.body.post).content;
        posts_query = 'INSERT INTO posts (id, user_id, title, content, img_url, create_time) VALUES (?, ?, ?, ?, ?, ?)';
        insert_values = [ uid(), req.auth.userId, title, content, img_url, getMysqlDate() ];
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
    // ensure user request is valid
    if(!req.file && req.body.post ){
        return next( new ErrorResponse('mauvaise requête', 400) )
    }

    if(req.file && !req.body.post ){
        deleteFile( req.file.filename, next );
        return next( new ErrorResponse('mauvaise requête', 400) )
    }

    // Check if post existe or not, then compare its user_id with the one of logined user
    const posts_query = 'SELECT user_id, img_url FROM posts WHERE id = ? AND delete_time IS ?';

    mysqlConnect.then( connection => {
        connection.query(posts_query ,[req.params.id, null] ,(error, results, fields) => {
            if(error) {
                if(req.file) deleteFile(req.file.filename, next);
                return next(error)
            }
            
            if(!results.length){
                if(req.file) deleteFile(req.file.filename, next);
                return next( new ErrorResponse('publication n\'existe pas',404))
            }

            const post = results[0];
        
            if(!req.auth.isAdmin && post.user_id !== req.auth.userId ){
                if(req.file) deleteFile (req.file.filename,next);
                return next( new ErrorResponse('requête non autorisée', 401) )
            }

        // From here, user and admin allow to modify the post.
            // user modify post with only text , but there is image in the post, only update the title and content filed
            let update_obj = {
                title : req.body.title,
                content : req.body.content,
                update_time : getMysqlDate()
            };

            // user modify post with only text, 
            // need to update img_url filed to cover the case when user delete the image in his post
            if(req.body.fileUrl === "" ){
                update_obj = {
                    ...update_obj,
                    img_url : null
                }
            }

            // user modify the post with text and file
            if(req.file){
                update_obj = {
                    title : JSON.parse(req.body.post).title,
                    content : JSON.parse(req.body.post).content,
                    img_url :req.file.filename,
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

                // if the post has an image before modification,need to delete the old image in the server
                if(req.body.fileUrl ==="" && post.img_url !== null) {
                    deleteFile(post.img_url,next);
                }
    
                res.status(201).json({ message : 'publication modifié' })
            })
        })
    })
}

exports.deletePost = (req, res, next) => {
    mysqlConnect.then( connection => {
        // check if post existes or not, then compare its user_id to the logined user
        const posts_query = 'SELECT user_id, img_url FROM posts WHERE id = ? AND delete_time IS ?';

        connection.query(posts_query, [req.params.id,null], (error, results, fields) => {
            if(error) return next(error)
            
            if(!results.length) return next( new ErrorResponse('la publication n\'existe pas',404));

            const post = results[0];
            
            if(!req.auth.isAdmin && req.auth.userId !== post.user_id){
                return next( new ErrorResponse('requête non autorisée',401))
            }

            // From here, user and admin allow to delete the post
            const update_query = 'UPDATE posts SET ? WHERE id = ?';

            const update_obj = { img_url: null, delete_time : getMysqlDate() };

            connection.query(update_query, [ update_obj, req.params.id ], (error, results, fields) => {
                if(error) return next(error)
    
                // delete img in server if there is one
                if(post.img_url !== null){ 
                    deleteFile(post.img_url,next);
                }
                
                // after delete the post, 
                // check if any comments and subcomments related to it in tbl comments
                // if there is any,delete them ,if not, send message to user
                const comments_query = 'SELECT id, img_url FROM comments WHERE target_id = ? AND delete_time IS ?'

                connection.query(comments_query, [ req.params.id, null ],(error, results) => {
                    if(error) return next(error);

                    if(!results.length) return res.status(201).json({ message : 'publication supprimé' });

                    deleteHandler(results, connection, next);

                    res.status(200).json({ message: 'La publication est supprimée'});
                })
            })

            
        })
    })
}

exports.getPosts = (req, res, next) => {
    const posts_query = `SELECT 
                        p.id, p.user_id, p.title, p.content, p.img_url, p.create_time, 
                        users.name, users.avatar, 
                        positions.position
                        FROM posts p JOIN users 
                        ON p.user_id = users.id
                        JOIN positions 
                        ON users.position_id = positions.id
                        WHERE p.delete_time IS ? 
                        ORDER BY p.create_time DESC 
                        LIMIT ? OFFSET 0
                        `;

    mysqlConnect.then( connection => {
        connection.query(posts_query,[ null, + req.query.count ],(error, results, fields) => {
            if(error) return next(error);
            
            const postArr = results.map( post => {
                if(post.img_url !==null ) return {...post, img_url :`${req.protocol}://${req.get('host')}/images/${post.img_url}`}
                return {...post}
            })
            res.status(200).json(postArr);
        })
    })
}

exports.getOnePost = (req, res, next) => {
    const posts_query = 'SELECT * FROM posts WHERE delete_time IS ? AND id = ?';

    mysqlConnect.then( connection => {
        connection.query(posts_query,[ null, req.params.id ],(error, results, fields) => {
            if(error) return next(error)

            res.status(200).json(results);
        })
    })
}

exports.likePost = (req, res, next) => {
    // ensure user request is valid
    if(!Number.isInteger(req.body.like) || req.body.like > 1 || req.body.like < -1) {
        return next( new ErrorResponse('mauvaise requête',400));
    }

    mysqlConnect.then( connection => {
        // check if post exsite 
        const posts_query = 'SELECT id FROM posts WHERE id = ? AND delete_time IS ?';

        connection.query(posts_query,[ req.params.id, null], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return next( new ErrorResponse('la publication n\'existe pas',404));

            // when post exists, check if user has reactions to this target post ( like or dislike reactions)
            const reactions_query = 'SELECT reaction FROM reactions WHERE target_id = ? AND user_id = ?';

            connection.query(reactions_query,[req.params.id, req.auth.userId],(error, results, fields) => {
                if(error) return next(error);
                
                // if no reactions related the target post, 
                // do insert query directly for valid user request
                if(!results.length) {
                    if(req.body.like === 0) return next( new ErrorResponse('mauvaise requête',400));
    
                    const insert_query = 'INSERT INTO reactions(user_id, target_id, reaction, create_time) VALUES(?,?,?,?)';

                    const insert_values = [req.auth.userId, req.params.id, req.body.like , getMysqlDate() ];

                    return connection.query(insert_query, insert_values, (error, results, fields) => {
                        if(error) return next(error);
    
                        if(req.body.like === 1) return res.status(201).json({ message: 'like réussie' });
        
                        res.status(201).json({ message: 'dislike réussie' });
                    })
                }
                
                // if user has already reactions related to the post, 
               // do update query in tbl reactions for valid user request  
                if((results[0].reaction !== 0 && req.body.like !== 0) || (results[0].reaction === 0 && req.body.like === 0)){
                    return next( new ErrorResponse('mauvaise requête',400))
                }
    
                const update_query = 'UPDATE reactions SET ? WHERE target_id = ? AND user_id = ?';
    
                const update_values = [ { reaction: req.body.like, update_time: getMysqlDate() }, req.params.id, req.auth.userId ];
    
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

exports.getUsersLikedPost = (req, res, next) => {
    mysqlConnect.then( connection => {
        const reactions_query = 'SELECT user_id FROM reactions WHERE reaction = ? AND target_id = ?'
        
        connection.query(reactions_query,[1,req.params.id], (error, results, fields) =>{
            if(error) return next(error);
            res.status(200).json(results);

        })
    })

}



