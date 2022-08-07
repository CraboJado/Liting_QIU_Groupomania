const ErrorResponse = require('../utils/errorResponse');
const mysqlConnect = require('../config/db');
const getMysqlDate = require('../utils/getMysqlDate');
const uid = require('../utils/getUid');
const deleteFile = require('../utils/deleteFile');


exports.addComment = (req, res, next) => {
    const isFormData = req.get('content-type').includes('multipart/form-data');
    
    if(isFormData && (!req.body.comment || !req.file)){
        if(req.file) deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400));
    }

    //  when user publish only text
    let { comment_content , postId, flag } = req.body;
    let comments_query = 'INSERT INTO comments (comment_id, user_id, post_id, comment_content, flag, create_time) VALUES (?, ?, ?, ?, ?, ?)';
    let insert_values = [ uid(), req.params.userId, postId, comment_content, flag, getMysqlDate() ];

    // when user publish with a photo
    if(req.file) {
        comment_content = JSON.parse(req.body.comment).comment_content;
        postId = JSON.parse(req.body.comment).postId;
        flag = JSON.parse(req.body.comment).flag;
        const img_url = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        comments_query = 'INSERT INTO comments ( comment_id, user_id, post_id, comment_content, flag, img_url, create_time) VALUES (?, ?, ?, ?, ?, ?, ?)';
        insert_values = [ uid(), req.params.userId, postId, comment_content, flag, img_url, getMysqlDate() ];
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

    const comments_query = 'SELECT * FROM comments WHERE comment_id = ? AND delete_time IS ?';

    mysqlConnect.then( connection => {
        connection.query(comments_query, [req.params.id, null], (error, results, fields) => {
            if(error){
                if(req.file) deleteFile(req.file.filename, next);
                return next(error);
            }

            if(!results.length) {
                if(req.file) deleteFile(req.file.filename, next);
                return next( new ErrorResponse('commentaire n\'existe pas', 404) )
            }

            const comment = results[0];

            if(!req.auth.isAdmin && (comment.user_id !== req.params.userId)) {
                if(req.file) deleteFile(req.file.filename, next);
                return next( new ErrorResponse('requête non autorisée', 401) );
            }
            
            let update_obj = {
                comment_content: req.body.comment_content,
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
                    comment_content: JSON.parse(req.body.comment).comment_content,
                    img_url:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                    update_time : getMysqlDate()
                }
            }

            const update_query = 'UPDATE comments SET ? WHERE comment_id = ?';

            const update_values = [update_obj,req.params.id];
            
            connection.query(update_query,update_values,(error,results,fields) => {
                if(error){
                    if(req.file) deleteFile(req.file.filename, next);
                    return next(error)
                }

                if((req.body.img_url === null && comment.img_url !== null) || (req.file && comment.img_url !== null)){
                    const filename = comment.img_url.split('/images/')[1];
                    deleteFile(filename, next);
                }

                res.status(201).json({ message: 'commentaire modifiée'})
            })
        })
    })
}

exports.deleteComment = (req, res, next) => {
    const comments_query = 'SELECT * FROM comments WHERE comment_id = ? AND delete_time IS ?';

    mysqlConnect.then( connection => {
        connection.query(comments_query, [ req.params.id, null], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return next( new ErrorResponse('commentaire n\'existe pas', 404));

            if(!req.auth.isAdmin && (req.params.userId !== results[0].user_id)){
                return next( new ErrorResponse('requête non authorisée', 401))
            }

            const comment = results[0];

            const update_query = 'UPDATE comments SET ? WHERE comment_id = ?';

            const update_obj = { img_url : null, delete_time : getMysqlDate() };

            connection.query(update_query,[ update_obj, req.params.id ], (error, results, fields) => {
                if(error) return next(error);

                if(comment.img_url !== null) {
                    const filename = comment.img_url.split('/images/')[1];
                    deleteFile(filename,next);
                }

                res.status(200).json({ message: 'commentaire supprimé'})
            })
        })
    })
    
}

exports.getAllComments = (req, res, next) => {
    const comments_query = 'SELECT * FROM comments WHERE post_id = ? AND delete_time IS ?';

    mysqlConnect.then( connection => {
        connection.query(comments_query,[ req.body.postId, null ], (error, results, fields) => {
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