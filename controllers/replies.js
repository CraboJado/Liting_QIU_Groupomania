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

exports.addReply = (req, res, next) => {
    console.log('in addReply controller');

    const isFormData = req.get('content-type').includes('multipart/form-data');

    if(isFormData && (!req.body.reply || !req.file)){
        if(req.file) deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400))
    }

    //  when user publish only text
    let body = req.body;
    let { reply_content } = body;
    const user_id = req.params.userId
    const post_id = req.params.id
    let replies_query = 'INSERT INTO replies (reply_id, user_id, comment_id, reply_content, `like`, dislike, create_time) VALUES (?, ?, ?, ?, ?, ?, ?)';
    let insert_values = [ uid(), req.params.userId, req.params.commentId, reply_content, '[]', '[]', getMysqlDate() ];

    // when user publish text and photo
    if(req.file) {
        body = JSON.parse(req.body.reply);
        reply_content = body.reply_content;
        const img_url = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        replies_query = 'INSERT INTO replies (reply_id, user_id, comment_id, reply_content, img_url, `like`, dislike, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        insert_values = [ uid(), req.params.userId, req.params.commentId, reply_content, img_url, '[]', '[]', getMysqlDate() ];
    }

    mysqlConnect.then( connection => {
       connection.query(replies_query, insert_values, (error, results, fields) =>{
            if(error){
                if(req.file) deleteFile(req.file.filename,next);
                return next(error)
            }
            res.status(201).json({message : 'réponse ajouté'})
        })
    })
}

exports.modifyReply = (req, res, next) => {
    console.log("in modify reply")
    console.log(req.body)
    console.log(req.body.reply)
    console.log(req.get('content-type').includes('multipart/form-data'));
    const isFormData = req.get('content-type').includes('multipart/form-data');

    if(isFormData && (!req.body.reply || !req.file)){
        if(req.file) deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400))
    }
   
    const replies_query = 'SELECT * FROM replies WHERE reply_id = ? '
    mysqlConnect.then( connection => {
        connection.query(replies_query, [req.params.id], (error, results, fields) => {
            if(error){
                if(req.file) deleteFile(req.file.filename, next);
                return next(error);
            }

            if(!results.length) {
                if(req.file) deleteFile(req.file.filename, next);
                return next( new ErrorResponse('commentaire n\'existe pas',404) )
            }

            const reply = results[0];

            if(!req.auth.isAdmin && (reply.user_id !== req.params.userId)) {
                if(req.file) deleteFile(req.file.filename, next);
                return next( new ErrorResponse('requête non autorisée',401) );
            }
            
            let update_obj = {
                reply_content: req.body.reply_content,
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
                    reply_content: JSON.parse(req.body.reply).reply_content,
                    img_url:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                    update_time : getMysqlDate()
                }
            }

            const update_query = 'UPDATE replies SET ? WHERE reply_id = ?';
            const update_values = [update_obj,req.params.id];
            connection.query(update_query,update_values,(error,results,fields) => {
                if(error){
                    if(req.file) deleteFile(req.file.filename, next);
                    return next(error)
                }

                if((req.body.img_url === null && reply.img_url !== null) || (req.file && reply.img_url !== null)){
                    const filename = reply.img_url.split('/images/')[1];
                    deleteFile(filename, next);
                }

                res.status(201).json({ message: 'réponse modifiée'})
            })
        })
    })
}

exports.deleteReply = (req, res, next) => {
    const replies_query = 'SELECT * FROM replies WHERE reply_id = ?';
    mysqlConnect.then( connection => {
        connection.query(replies_query, [ req.params.id ], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return next( new ErrorResponse('réponse n\'existe pas', 404));

            if(!req.auth.isAdmin && (req.params.userId !== results[0].user_id)){
                return next( new ErrorResponse('requête non authorisée', 401))
            }

            const reply = results[0];
            const update_query = 'UPDATE replies SET ? WHERE reply_id = ?';
            const update_obj = { delete_time : getMysqlDate() };
            connection.query(update_query,[ update_obj, req.params.id ], (error, results, fields) => {
                if(error) return next(error);

                if(reply.img_url !== null) {
                    const filename = reply.img_url.split('/images/')[1];
                    deleteFile(filename,next);
                }

                res.status(200).json({ message: 'réponse supprimé'})
            })
        })
    }) 
}

exports.getAllReplies = (req, res, next) => {
    const replies_query = 'SELECT * FROM replies WHERE comment_id = ? AND delete_time IS ?'
    mysqlConnect.then( connection => {
        connection.query(replies_query,[ req.params.commentId, null ], (error, results, fields) => {
            if(error) return next(error);
            res.status(200).json(results);
        })
    })
    
}

exports.likeReply = (req, res, next) => {
    const replies_query = 'SELECT * FROM replies WHERE reply_id = ?';
    mysqlConnect.then( connection => {
        connection.query(replies_query,[ req.params.id ], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return next( new ErrorResponse('commentaire n\'existe pas', 404));

            const reply = results[0];
            const foundLike = reply.like.find(element => element === req.params.userId);
            const foundDislike = reply.dislike.find(element => element === req.params.userId);

            if(req.body.like === 0 && (!foundLike && !foundDislike)){
                return next( new ErrorResponse('la requête ne peut pas etre traité 0', 400))
            }

            if(req.body.like !== 0 && ( foundLike || foundDislike)){
                return next( new ErrorResponse('la requête ne peut pas etre traité', 400))
            }

            
            let update_obj = {
                update_time : getMysqlDate()
            }

            if(req.body.like === 1){
                reply.like.push(req.params.userId);
                update_obj = {
                    ...update_obj,
                    like : JSON.stringify(reply.like)
                }
            }

            if(req.body.like === -1){
                reply.dislike.push(req.params.userId);
                update_obj = {
                    ...update_obj,
                    dislike : JSON.stringify(reply.dislike)
                }
            }

            if(foundLike){
                const newLike = reply.like.filter(element => element !== req.params.userId);
                update_obj = {
                    ...update_obj,
                    like : JSON.stringify(newLike)
                }
            }

            if(foundDislike){
                const newDislike = reply.dislike.filter(element => element !== req.params.userId)
                update_obj = {
                    ...update_obj,
                    dislike : JSON.stringify(newDislike)
                }
            }

            const update_query = 'UPDATE replies SET ? WHERE reply_id = ?';
            connection.query(update_query,[ update_obj,req.params.id ], (error, results, fields) => {
                if(error) return next(error);

                if(req.body.like === 0){
                    return  res.status(200).json({ message: 'anulation effectué'})
                }

                if(req.body.like === 1){
                    return  res.status(200).json({ message: 'like ajouté'})
                }

                res.status(200).json({ message: 'dislike ajouté'})
            })
        })
    })
}