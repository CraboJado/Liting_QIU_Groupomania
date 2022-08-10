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

// delete also the comments related to the deleted comments ?


const handler = (reply_idArr,connection,results) => {
    let reply_ids = reply_idArr;
    const update_query = `UPDATE comments2
                          SET ?
                          WHERE reply_id IN (${reply_ids})`;
    const update_obj = { img_url : null, delete_time : getMysqlDate() };

    connection.query(update_query,update_obj,(error,results) => {
        if(error) return
        const query = `SELECT reply_id FROM comments2 WHERE comment_id IN (${reply_ids})' AND delete_time IS NULL`;
        connection.query(query,(error,results) => {
            if(error) return
            if(!results.length) return res.status(200).json({ message: 'commentaire supprimé'})
            reply_ids = results.map(ele => ele.reply_id);
            return handler(reply_ids,connection)
        })
    })
}

const deleteCommentHandler = (connection,req) => {
    // const query = `SELECT reply_id FROM comments2 WHERE comment_id = '123' AND delete_time IS NULL`;
    // delete reply=id 123 ( we get the id also from req.params.id), which is a comment, then we need to delete all replies relate to this comment ( reply_id 123)
    // after that, need to check if there is replies relate to it reply=id 123
    // so we do select replies of a comment 
    const query = `SELECT reply_id FROM comments2 WHERE comment_id = ${req.params.id}' AND delete_time IS NULL`;
    connection.query (query, (error , results) => {
        if(error) return
        if(!results.length) return res.status(200).json({ message: 'commentaire supprimé'})
        // there is replies of comment 123, we map into a new arry ['125','126']
        const reply_idArr = results.map(ele => ele.reply_id)

        handler(reply_idArr,connection);

    })
}

exports.deleteComment = (req, res, next) => {
    // const comments_query = 'SELECT * FROM comments WHERE comment_id = ? AND delete_time IS ?';
    const comments2_query = 'SELECT * FROM comments2 WHERE reply_id = ? AND delete_time IS ?';

    mysqlConnect.then( connection => {
        connection.query(comments2_query, [ req.params.id, null], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return next( new ErrorResponse('commentaire n\'existe pas', 404));

            if(!req.auth.isAdmin && (req.params.userId !== results[0].user_id)){
                return next( new ErrorResponse('requête non authorisée', 401))
            }

            const comment = results[0];

            // const update_query = 'UPDATE comments SET ? WHERE comment_id = ?';
            const update_query = 'UPDATE comments2 SET ? WHERE reply_id = ?';

            const update_obj = { img_url : null, delete_time : getMysqlDate() };

            connection.query(update_query,[ update_obj, req.params.id ], (error, results, fields) => {
                if(error) return next(error);

                if(comment.img_url !== null) {
                    const filename = comment.img_url.split('/images/')[1];
                    deleteFile(filename,next);
                }

                const query = `SELECT reply_id FROM comments2 WHERE comment_id = ${req.params.id}' AND delete_time IS NULL`;
                connection.query (query, (error , results) => {
                    if(error) return
                    if(!results.length) return
                    // there is replies of comment 123, we map into a new arry ['125','126']
                    const reply_idArr = results.map(ele => ele.reply_id)
            
                    handler(reply_idArr,connection);
            
                })


                
            })

        })
    })
    
}

exports.getAllComments = (req, res, next) => {
    const comments_query = 'SELECT * FROM comments WHERE post_id = ? AND flag = ? AND delete_time IS ?';

    mysqlConnect.then( connection => {
        connection.query(comments_query,[ req.body.postId, req.body.flag, null ], (error, results, fields) => {
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