const ErrorResponse = require('../utils/errorResponse');
const mysqlConnect = require('../config/db');
const getMysqlDate = require('../utils/getMysqlDate');
const uid = require('../utils/getUid');
const deleteFile = require('../utils/deleteFile');

/*
req.body = { content, postId, comment_id }
comment_id is null if it is a comment to a post
*/
exports.addComment = (req, res, next) => {
    const isFormData = req.get('content-type').includes('multipart/form-data');
    
    if(isFormData && (!req.body.comment || !req.file)){
        if(req.file) deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400));
    }

    //  when user publish only text
    let { content, postId, comment_id } = req.body;
    let comments_query = 'INSERT INTO comments (reply_id, user_id, comment_id, post_id, reply_content, create_time) VALUES (?, ?, ?, ?, ?,?)';
    let insert_values = [uid(), req.params.userId, comment_id, postId, content, getMysqlDate() ];

    // when user publish with a photo
    if(req.file){
        content = JSON.parse(req.body.comment).content;
        postId = JSON.parse(req.body.comment).postId;
        comment_id =  JSON.parse(req.body.comment).comment_id;
        const img_url = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        comments_query = 'INSERT INTO comments (reply_id, user_id, comment_id, post_id, reply_content, img_url, create_time) VALUES (?, ?, ?, ?, ?, ?, ?)';
        insert_values = [uid(), req.params.userId, comment_id, postId, content, img_url, getMysqlDate() ];
    }

    mysqlConnect.then( connection => {
       connection.query(comments_query, insert_values, (error, results, fields) =>{
            if(error){
                if(req.file) deleteFile(req.file.filename,next);
                return next(error)
            }
            res.status(201).json({message : 'commentaire ajouté'})
        })
    })
}

exports.modifyComment = (req, res, next) => {
    const isFormData = req.get('content-type').includes('multipart/form-data');

    if(isFormData && (!req.body.comment || !req.file)){
        if(req.file) deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400))
    }

    const comments_query = 'SELECT * FROM comments WHERE reply_id = ? AND delete_time IS ?';

    mysqlConnect.then( connection => {
        connection.query(comments_query, [req.params.id, null], (error, results, fields) => {
            if(error){
                if(req.file) deleteFile(req.file.filename, next);
                return next(error);
            }

            if(!results.length) {
                if(req.file) deleteFile(req.file.filename, next);
                return next( new ErrorResponse('la réponse ou commentaire n\'existe pas', 404) )
            }

            const reply = results[0];

            if(!req.auth.isAdmin && (reply.user_id !== req.params.userId)) {
                if(req.file) deleteFile(req.file.filename, next);
                return next( new ErrorResponse('requête non autorisée', 401) );
            }
            
            let update_obj = {
                reply_content: req.body.content,
                update_time : getMysqlDate()
            }

            if(req.body.img_url === null){
                update_obj = {
                    ...update_obj,
                    img_url : null
                }
            }

            if(req.file){
                update_obj = {
                    reply_content: JSON.parse(req.body.comment).content,
                    img_url:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                    update_time : getMysqlDate()
                }
            }

            const update_query = 'UPDATE comments SET ? WHERE reply_id = ?';

            const update_values = [update_obj,req.params.id];
            
            connection.query(update_query, update_values, (error,results,fields) => {
                if(error){
                    if(req.file) deleteFile(req.file.filename, next);
                    return next(error)
                }

                if((req.body.img_url === null && reply.img_url !== null) || (req.file && reply.img_url !== null)){
                    const filename = reply.img_url.split('/images/')[1];
                    deleteFile(filename, next);
                }

                res.status(201).json({ message: 'commentaire modifiée'})
            })
        })
    })
}

// delete also the replies related to the deleted comment
const deleteHandler = (results, connection, next) => {
    const reply_ids = results.map( ele => {
        if(ele.img_url !== null){
            const filename = ele.img_url.split('/images/')[1];
            deleteFile(filename,next)
        }
        return ele.reply_id
    });

    const update_query = `UPDATE comments SET ? WHERE reply_id IN (?)`;

    const update_obj = { img_url : null, delete_time : getMysqlDate() };

    connection.query(update_query,[update_obj, reply_ids],(error,results, fields) => {
        if(error) return next(error);

        const query = `SELECT * FROM comments WHERE comment_id IN (?) AND delete_time IS ?`;

        connection.query(query,[reply_ids, null ], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return 

            return deleteHandler(results, connection, next)
        })
    })
}

exports.deleteComment = (req, res, next) => {
    mysqlConnect.then( connection => {
        const comments_query = 'SELECT * FROM comments WHERE reply_id = ? AND delete_time IS ?';

        connection.query(comments_query, [ req.params.id, null ], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return next( new ErrorResponse('la réponse ou commentaire n\'existe pas', 404));

            if(!req.auth.isAdmin && (req.params.userId !== results[0].user_id)){
                return next( new ErrorResponse('requête non authorisée', 401))
            }

            const reply = results[0];

            const update_query = 'UPDATE comments SET ? WHERE reply_id = ?';

            const update_obj = { img_url : null, delete_time : getMysqlDate() };

            connection.query(update_query,[ update_obj, req.params.id ], (error, results, fields) => {
                if(error) return next(error);

                if(reply.img_url !== null) {
                    const filename = reply.img_url.split('/images/')[1];
                    deleteFile(filename,next);
                }
                // check if there is any replies related to the deleted reply_id
                const query = `SELECT * FROM comments WHERE comment_id = ? AND delete_time IS ?`;

                connection.query (query, [ req.params.id, null ],(error , results, fields) => {
                    if(error) return next(error);

                    if(!results.length) return res.status(200).json({ message: 'la réponse ou commentaire supprimé'});

                    deleteHandler(results,connection,next);

                    res.status(200).json({ message: 'La réponse ou commentaire est supprimée'});
                })
            })
        })
    })
}

/*
req.body {
    id:
    flag : 
}
*/
exports.getAllComments = (req, res, next) => {
    let comments_query = `SELECT t.*, CAST(create_time AS CHAR) as create_timeJS FROM comments t 
                        WHERE comment_id = ? AND delete_time IS ? 
                        ORDER BY create_time DESC 
                        LIMIT 0,3`;

    let query_values = [req.body.id, null]

    if(req.body.flag === 0){
        comments_query =`SELECT t.*, CAST(create_time AS CHAR) as create_timeJS FROM comments t 
                        WHERE post_id = ? AND comment_id IS ? AND delete_time IS ? 
                        ORDER BY create_time DESC 
                        LIMIT 0,3`;
        query_values = [req.body.id, null, null]
    }
    
    mysqlConnect.then( connection => {
        connection.query(comments_query, query_values, (error, results, fields) => {
            if(error) return next(error);

            res.status(200).json(results);
        })
    })
    
}

exports.likeComment = (req, res, next) => {
    if(!Number.isInteger(req.body.like) || req.body.like > 1 || req.body.like < -1) {
        return next( new ErrorResponse('mauvaise requête',400));
    }

    const comments_query = 'SELECT comment_id FROM comments WHERE comment_id = ? AND delete_time IS ?';

    mysqlConnect.then( connection => {
        connection.query(comments_query,[ req.params.id, null], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return next( new ErrorResponse('la commentaire n\'existe pas',404));

            const reactions_query = 'SELECT * FROM reactions WHERE comment_id = ? AND user_id = ?';

            connection.query(reactions_query,[req.params.id, req.params.userId],(error, results, fields) => {
                if(error) return next(error);
    
                if(!results.length) {
                    if(req.body.like === 0) return next( new ErrorResponse('mauvaise requête',400));
    
                    const insert_query = 'INSERT INTO reactions(user_id, comment_id, reaction, create_time) VALUES(?,?,?,?)';

                    return connection.query(insert_query,[req.params.userId, req.params.id, req.body.like , getMysqlDate() ], (error, results, fields) => {
                        if(error) return next(error);
    
                        if(req.body.like === 1) return res.status(201).json({ message: 'like réussie' });
        
                        res.status(201).json({ message: 'dislike réussie' });
                    })
                }
    
                if((results[0].reaction !== 0 && req.body.like !== 0) || (results[0].reaction === 0 && req.body.like === 0)){
                    return next( new ErrorResponse('mauvaise requête',400))
                }
    
                const update_query = 'UPDATE reactions SET ? WHERE comment_id = ? AND user_id = ?';
    
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