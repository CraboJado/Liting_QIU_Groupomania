const ErrorResponse = require('../utils/errorResponse');
const mysqlConnect = require('../config/db');
const getMysqlDate = require('../utils/getMysqlDate');
const uid = require('../utils/getUid');
const deleteFile = require('../utils/deleteFile');


exports.addReply = (req, res, next) => {
    const isFormData = req.get('content-type').includes('multipart/form-data');
    
    if(isFormData && (!req.body.reply || !req.file)){
        if(req.file) deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400));
    }

    //  when user publish only text
    let { content, postId, commentId } = req.body;
    let replies_query = 'INSERT INTO replies (id, user_id, comment_id, post_id, content, create_time) VALUES (?, ?, ?, ?, ?,?)';
    let insert_values = [uid(), req.params.userId, commentId, postId, content, getMysqlDate() ];

    // when user publish with a photo
    if(req.file){
        content = JSON.parse(req.body.reply).content;
        postId = JSON.parse(req.body.reply).postId;
        commentId =  JSON.parse(req.body.reply).commentId;
        const img_url = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        replies_query = 'INSERT INTO replies (id, user_id, comment_id, post_id, content, img_url, create_time) VALUES (?, ?, ?, ?, ?, ?, ?)';
        insert_values = [uid(), req.params.userId, commentId, postId, content, img_url, getMysqlDate() ];
    }

    mysqlConnect.then( connection => {
       connection.query(replies_query, insert_values, (error, results, fields) =>{
            if(error){
                if(req.file) deleteFile(req.file.filename,next);
                return next(error)
            }
            res.status(201).json({message : 'commentaire ajouté'})
        })
    })
}

exports.modifyReply = (req, res, next) => {
    const isFormData = req.get('content-type').includes('multipart/form-data');

    if(isFormData && (!req.body.reply || !req.file)){
        if(req.file) deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400))
    }

    // check if reply exists or not, then compare its user_id with logined user 
    const replies_query = 'SELECT user_id, img_url FROM replies WHERE id = ? AND delete_time IS ?';

    mysqlConnect.then( connection => {
        connection.query(replies_query, [req.params.id, null], (error, results, fields) => {
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

            // when it comes to here, user and admin allow to modify the reply.
            let update_obj = {
                content: req.body.content,
                update_time : getMysqlDate()
            }

            // if user want to delete the image in his reply
            if(req.body.isDeleteImg === true){
                update_obj = {
                    ...update_obj,
                    img_url : null
                }
            }

            // if user modify his reply with file
            if(req.file){
                update_obj = {
                    content: JSON.parse(req.body.reply).content,
                    img_url:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                    update_time : getMysqlDate()
                }
            }

            const update_query = 'UPDATE replies SET ? WHERE id = ?';

            const update_values = [update_obj,req.params.id];
            
            connection.query(update_query, update_values, (error,results,fields) => {
                if(error){
                    if(req.file) deleteFile(req.file.filename, next);
                    return next(error)
                }

                // delete old img in the server 
                // if user modify reply with file OR user deletes the image in the reply
                if((req.body.isDeleteImg === true && reply.img_url !== null) || (req.file && reply.img_url !== null)){
                    const filename = reply.img_url.split('/images/')[1];
                    deleteFile(filename, next);
                }

                res.status(201).json({ message: 'la réponse ou commentaire modifiée'})
            })
        })
    })
}

// To delete a reply, then check if any replies related to it
// function will stop until there is no reply related to the deleted reply
const deleteHandler = (results, connection, next) => {
    // the reply ids need to delete
    const ids = results.map( ele => {
        if(ele.img_url !== null){
            const filename = ele.img_url.split('/images/')[1];
            deleteFile(filename,next)
        }
        return ele.id
    });

    const update_query = `UPDATE replies SET ? WHERE id IN (?)`;

    const update_obj = { img_url : null, delete_time : getMysqlDate() };

    connection.query(update_query,[update_obj, ids],(error,results, fields) => {
        if(error) return next(error);
        
        // check if any replies related to the deleted reply ids
        const query = `SELECT id, img_url FROM replies WHERE comment_id IN (?) AND delete_time IS ?`;

        connection.query(query,[ids, null ], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return 

            return deleteHandler(results, connection, next)
        })
    })
}

exports.deleteReply = (req, res, next) => {
    // check if reply exists , then compare its user_id with logined user
    mysqlConnect.then( connection => {
        const replies_query = 'SELECT id, user_id, img_url FROM replies WHERE id = ? AND delete_time IS ?';

        connection.query(replies_query, [ req.params.id, null ], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return next( new ErrorResponse('la réponse ou commentaire n\'existe pas', 404));

            if(!req.auth.isAdmin && (req.params.userId !== results[0].user_id)){
                return next( new ErrorResponse('requête non authorisée', 401))
            }

            // user and admin allow to delete the reply
            deleteHandler(results,connection,next);

            res.status(200).json({ message: 'La réponse ou commentaire est supprimée'});
        })
    })
}

exports.getReplies = (req, res, next) => {
    // req.body.id refers to the colum comment_id in DB 
    let replies_query = `SELECT t.*, CAST(create_time AS CHAR) as create_timeJS FROM replies t 
                        WHERE comment_id = ? AND delete_time IS ? 
                        ORDER BY create_time DESC 
                        LIMIT ?,3`; // variable enyé par front

    let query_values = [req.body.id, null, req.body.startNbr]

    // if isComment, req.body.id refers to the colum post_id in DB
    if(req.body.isComment === true){
        replies_query =`SELECT t.*, CAST(create_time AS CHAR) as create_timeJS FROM replies t 
                        WHERE post_id = ? AND comment_id IS ? AND delete_time IS ? 
                        ORDER BY create_time DESC 
                        LIMIT ?,3`;
        query_values = [req.body.id, null, null,req.body.startNbr]
    }
    
    mysqlConnect.then( connection => {
        connection.query(replies_query, query_values, (error, results, fields) => {
            if(error) return next(error);

            res.status(200).json(results);
        })
    })
}

exports.likeReply = (req, res, next) => {
    // ensure user request is valid
    if(!Number.isInteger(req.body.like) || req.body.like > 1 || req.body.like < -1) {
        return next( new ErrorResponse('mauvaise requête',400));
    }

    mysqlConnect.then( connection => {
        // check if reply exists or not 
        const replies_query = 'SELECT id FROM replies WHERE id = ? AND delete_time IS ?';

        connection.query(replies_query,[ req.params.id, null], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return next( new ErrorResponse('la réponse ou commentaire n\'existe pas',404));

            // when reply exists, check if user has reactions to this reply ( like or dislike reactions)
            const reactions_query = 'SELECT * FROM reactions WHERE reply_id = ? AND user_id = ?';

            connection.query(reactions_query,[req.params.id, req.params.userId],(error, results, fields) => {
                if(error) return next(error);
                
                // if no reactions related the reply, 
                // do insert query directly for valid user request
                if(!results.length) {
                    if(req.body.like === 0) return next( new ErrorResponse('mauvaise requête',400));
    
                    const insert_query = 'INSERT INTO reactions(user_id, reply_id, reaction, create_time) VALUES(?,?,?,?)';

                    return connection.query(insert_query,[req.params.userId, req.params.id, req.body.like , getMysqlDate() ], (error, results, fields) => {
                        if(error) return next(error);
    
                        if(req.body.like === 1) return res.status(201).json({ message: 'like réussie' });
        
                        res.status(201).json({ message: 'dislike réussie' });
                    })
                }
                
                // if user has already reactions related to the reply, 
                // do update query in tbl reactions for valid user request  
                if((results[0].reaction !== 0 && req.body.like !== 0) || (results[0].reaction === 0 && req.body.like === 0)){
                    return next( new ErrorResponse('mauvaise requête',400))
                }
    
                const update_query = 'UPDATE reactions SET ? WHERE reply_id = ? AND user_id = ?';
    
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