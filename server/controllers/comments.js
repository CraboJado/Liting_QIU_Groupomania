const mysqlConnect = require('../config/db');
const { ErrorResponse, getMysqlDate, uid, deleteFile, deleteHandler } = require('../utils/utils');


exports.getComments =(req, res, next)=> {   
    let comments_query = `SELECT c.id, c.user_id, c.target_id, c.content, c.img_url, CAST(c.create_time AS CHAR) create_time, 
                users.name, users.avatar, 
                positions.position
                FROM comments c JOIN users 
                ON c.user_id = users.id
                JOIN positions
                ON users.position_id = positions.id
                WHERE c.target_id = ? AND c.delete_time IS ?
                ORDER BY c.create_time DESC 
                LIMIT ? OFFSET 0
                `;
    let query_values = [req.query.targetId, null, + req.query.count];

    // 
    if(!req.query.count){
        comments_query = `SELECT COUNT(*) AS total
                         FROM comments
                         WHERE target_id = ?
                        `;
        query_values = [req.query.targetId];
    }


    mysqlConnect.then( connection => {
        connection.query(comments_query, query_values, (error, results, fields) => {
            if(error) return next(error);

            if(!req.query.count){
                res.status(200).json(results);
                
            }else{
                const commentArr = results.map( comment => {
                    if(comment.img_url !== null ) return {...comment, img_url :`${req.protocol}://${req.get('host')}/images/${comment.img_url}`}
                    return {...comment}
                })
                res.status(200).json(commentArr);
            }

        })
    })   
}

exports.addComment =(req, res, next)=> {

    // ensure user request format is valid
    if(!req.file && req.body.comment ){
        return next( new ErrorResponse('mauvaise requête555', 400) )
    }

    if(req.file && !req.body.comment ){
        deleteFile( req.file.filename, next );
        return next( new ErrorResponse('mauvaise requête', 400) )
    }

    //  when user publish comment with only text
    let { content, targetId } = req.body;
    let comments_query = 'INSERT INTO comments (id, user_id, target_id, content, create_time) VALUES (?, ?, ?, ?, ?)';
    let insert_values = [uid(), req.auth.userId, targetId, content, getMysqlDate() ];

    //  when user publish comment with image
    if(req.file){
        content = JSON.parse(req.body.comment).content;
        targetId = JSON.parse(req.body.comment).targetId
        // const img_url = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        const img_url = req.file.filename;
        comments_query = 'INSERT INTO comments (id, user_id, target_id, content, img_url, create_time) VALUES (?, ?, ?, ?, ?, ?)';
        insert_values = [uid(), req.auth.userId, targetId, content, img_url, getMysqlDate() ];
    }

    mysqlConnect.then( connection => {
        // check if targetId existes or not
        const selectQry = `SELECT id FROM posts WHERE id = ? AND delete_time IS ?; 
                        SELECT id FROM comments WHERE id = ? AND delete_time IS ?`;

        connection.query(selectQry, [targetId, null, targetId, null] , (error, results, fields) => {
            if (error) next(error);

            if(!results[0].length && !results[1].length){
                return next( new ErrorResponse('le target n\'existe pas', 404) )
            }

            // add comment to target feed
            connection.query(comments_query, insert_values, (error, results, fields) =>{
                if(error){
                    if(req.file) deleteFile(req.file.filename,next);
                    return next(error)
                }
                res.status(201).json({message : 'commentaire ajouté'})
            })
        })
    })
}


exports.modifyComment =(req, res, next)=> {
    // ensure user request format is valid
    if(!req.file && req.body.comment ){
        return next( new ErrorResponse('mauvaise requête555', 400) )
    }

    if(req.file && !req.body.comment ){
        deleteFile( req.file.filename, next );
        return next( new ErrorResponse('mauvaise requête', 400) )
    }

    // check if comment exists or not, then compare its user_id with logined user 
    const comments_query = 'SELECT user_id, img_url FROM comments WHERE id = ? AND delete_time IS ?';

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

            const comment = results[0];

            if(!req.auth.isAdmin && (comment.user_id !== req.auth.userId)) {
                if(req.file) deleteFile(req.file.filename, next);
                return next( new ErrorResponse('requête non autorisée', 401) );
            }

            //From here, user and admin allow to modify the reply.
            // user modify comment without file(not FormData)
            let update_obj = {
                content: req.body.content,
                update_time : getMysqlDate()
            }

            // if there is already an image before modification, update the img_url filed as null
            if(comment.img_url !== null){
                update_obj = {
                    ...update_obj,
                    img_url : null
                }
            }

            // user modify his comment with file (FormData)
            if(req.file){
                update_obj = {
                    content: JSON.parse(req.body.comment).content,
                    img_url:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                    update_time : getMysqlDate()
                }
            }

            const update_query = 'UPDATE comments SET ? WHERE id = ?';

            const update_values = [update_obj,req.params.id];
            
            connection.query(update_query, update_values, (error,results,fields) => {
                if(error){
                    if(req.file) deleteFile(req.file.filename, next);
                    return next(error)
                }

                // if the comment has an image before modification,need to delete the old image in the server
                if(comment.img_url !== null){
                    const filename = comment.img_url.split('/images/')[1];
                    deleteFile(filename, next);
                }

                res.status(201).json({ message: 'la commentaire est modifiée'})
            })
        })
    })
}

exports.deleteComment =(req, res, next)=> {
    // check if comment exists , then compare its user_id with logined user
    mysqlConnect.then( connection => {
        const comments_query = 'SELECT id, user_id, img_url FROM comments WHERE id = ? AND delete_time IS ?';

        connection.query(comments_query, [ req.params.id, null ], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return next( new ErrorResponse('la commentaire n\'existe pas', 404));

            const comment = results[0];

            if(!req.auth.isAdmin && (req.auth.userId !== comment.user_id)){
                return next( new ErrorResponse('requête non authorisée', 401))
            }

            // From here, user and admin allow to delete the comment
            deleteHandler(results, connection, next);

            res.status(200).json({ message: 'La commentaire est supprimée'});
        })
    })
}

exports.likeComment =(req, res, next)=> {
    // ensure user request format is valid
    if(!Number.isInteger(req.body.like) || req.body.like > 1 || req.body.like < -1) {
        return next( new ErrorResponse('mauvaise requête',400));
    }

    mysqlConnect.then( connection => {
        // check if comment exists or not 
        const comments_query = 'SELECT id FROM comments WHERE id = ? AND delete_time IS ?';

        connection.query(comments_query,[ req.params.id, null], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return next( new ErrorResponse('la commentaire n\'existe pas',404));

            // when comment exists, check if user has any reactions to this target comment ( like or dislike reactions)
            const reactions_query = 'SELECT reaction FROM reactions WHERE target_id = ? AND user_id = ?';

            connection.query(reactions_query,[req.params.id, req.auth.userId],(error, results, fields) => {
                if(error) return next(error);
                
                // if no reactions to the target comment, 
                // do insert query directly for valid user request
                if(!results.length) {
                    if(req.body.like === 0) return next( new ErrorResponse('mauvaise requête',400));
    
                    const insert_query = 'INSERT INTO reactions(user_id, target_id, reaction, create_time) VALUES(?,?,?,?)';

                    return connection.query(insert_query,[req.auth.userId, req.params.id, req.body.like , getMysqlDate() ], (error, results, fields) => {
                        if(error) return next(error);
    
                        if(req.body.like === 1) return res.status(201).json({ message: 'like réussie' });
        
                        res.status(201).json({ message: 'dislike réussie' });
                    })
                }

                // if user has already reactions to the target comment, 
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

