const path = require('path');
const fs = require('fs');

// for creating error instances with customized error message and statuscode
class ErrorResponse extends Error {
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode
    }
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const uid = () => {
    return Date.now().toString() + getRandomInt(1, 1000).toString();
}

const getMysqlDate = ()=>{
    const createDate = new Date(Date.now());
    const mysqlDate = `${createDate.getFullYear()}-${createDate.getMonth()+1}-${createDate.getDate()} ${createDate.getHours()}:${createDate.getMinutes()}:${createDate.getSeconds()}`;
    return mysqlDate
}

// To delete a comment in comments table, then check if any comment related to it
// function will stop until there is no comment related to the deleted comment
const deleteHandler = (results, connection, next) => {
    // the ids need to delete
    const ids = results.map( ele => {
        if(ele.img_url !== null){
            // const filename = ele.img_url.split('/images/')[1]; 
            deleteFile(ele.img_url,next)
        }
        return ele.id
    });

    const update_query = `UPDATE comments SET ? WHERE id IN (?)`;

    const update_obj = { img_url : null, delete_time : getMysqlDate() };

    connection.query(update_query,[update_obj, ids],(error,results, fields) => {
        if(error) return next(error);
        
        // check if any comments related to the deleted ids
        const query = `SELECT id, img_url FROM comments WHERE target_id IN (?) AND delete_time IS ?`;

        connection.query(query,[ids, null ], (error, results, fields) => {
            if(error) return next(error);

            if(!results.length) return 

            return deleteHandler(results, connection, next)
        })
    })
}

// delete the file uploaded in server for the request with file when there is error
const deleteFile = (filename,next) => {
    const filePath = path.join(__dirname,`../public/images/${filename}`);
    console.log('filePath',filePath)
    fs.unlink(filePath, err => {
        if(err){
            return next(err)
        }
    })
}

module.exports={
    ErrorResponse,
    uid,
    getMysqlDate,
    deleteHandler,
    deleteFile
}





