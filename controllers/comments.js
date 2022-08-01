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

exports.addComment = (req, res, next) => {
    console.log('in addComment controller');
    console.log(req.query)
    if(req.body.comment && !req.file){
        return next( new ErrorResponse('mauvaise requête',400))
    }

    if(!req.body.comment && req.file){
        deleteFile(req.file.filename,next);
        return next( new ErrorResponse('mauvaise requête',400))
    }
    //  when user publish only text
    let body = req.body;
    let { comment_content } = body;
    const user_id = req.params.userId
    const post_id = req.params.id
    let comments_query = 'INSERT INTO comments (comment_id, user_id, post_id, comment_content, `like`, dislike, create_time) VALUES (?, ?, ?, ?, ?, ?, ?)';
    let insert_values = [ uid(), req.params.userId, req.params.postId, comment_content, '[]', '[]', getMysqlDate() ];

    // when user publish text and photo
    if(req.file) {
        body = JSON.parse(req.body.comment);
        comment_content = body.comment_content;
        const img_url = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        comments_query = 'INSERT INTO comments ( comment_id, user_id, post_id, comment_content, img_url, `like`, dislike, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        insert_values = [ uid(), req.params.userId, req.params.postId, comment_content, img_url, '[]', '[]', getMysqlDate() ];
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
    if(req.body.comment && !req.file) {
        return next ( new ErrorResponse('mauvaise requête', 400))
    }

    if(!req.body.comment && req.file) {
        deleteFile (req.file.filename,next);
        return next ( new ErrorResponse('mauvaise requête', 400))
    }
    
    const comments_query = 'SELECT * FROM comments WHERE comment_id = ? '
    mysqlConnect.then( connection => {
        connection.query(comments_query, [req.params.id], (error, results, fields) => {
            if(error){
                if(req.file) deleteFile(req.file.filename, next);
                return next(error);
            }

            if(!results.length) {
                if(req.file) deleteFile(req.file.filename, next);
                return next( new ErrorResponse('commentaire n\'existe pas',404) )
            }

            const comment = results[0];

            if(!req.auth.isAdmin && (comment.user_id !== req.auth.userId)) {
                if(req.file) deleteFile(req.file.filename, next);
                return next( new ErrorResponse('requête non autorisée',401) );
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