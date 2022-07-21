const mysqlConnect = require('../config/db');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse')

exports.signup = (req,res,next) => {
    console.log('in signup controller', req.body);
    const { email, password, name, department_id, job_id } = req.body;
    const users_query = `INSERT INTO users (email, password, name, department_id, job_id, create_time) VALUES(?,?,?,?,?,?)`;
  
    const createDate = new Date(Date.now());
    let mysqlDate = `${createDate.getFullYear()}-${createDate.getMonth()+1}-${createDate.getDate()} ${createDate.getHours()}:${createDate.getMinutes()}:${createDate.getSeconds()}`;

    mysqlConnect.then( connection => {
        bcrypt.hash(password,10)
        .then( hash => {
            connection.query(users_query, [email, hash, name, department_id, job_id, mysqlDate], (error, results, fields) => {
                if (error) {
                    return next(error)
                }
                console.log('insert to users results',results);
                res.status(201).json({ message:"Successfully Registered" })
            })

        })
        .catch( error => {
            console.log('error in hash', error);
            return next(error)
        })
    
    })
}

exports.login = (req,res,next) => {
    console.log('in login controller', req.body);
    const { email, password } = req.body;
    console.log(email);
    const users_query = `SELECT * FROM users WHERE email = ?`;
    mysqlConnect.then( connection => {
        connection.query(users_query,[email], (error, results, fields) => {
            if(error) {
                console.log('error in users_query', error);
                return next(error);
            }

            if(results.length === 0){
               return next( new ErrorResponse('user not exists', 404) )
            }

            bcrypt.compare(password,results[0].password)
            .then( valid => {
                if(!valid) {
                    return next( new ErrorResponse('unauthorized request', 401) )
                }
                // if admin , send token with admin true
                if(results[0].email === process.env.ADMIN){
                    const token = jwt.sign({ data: results[0].user_id, isAdmin:true }, process.env.TOKEN_KEY, { expiresIn: process.env.TOKEN_EXPIRE });
                    res.status(200).json({ userId:results[0].user_id, token })
                }else{
                // if normal user, send token with userId with admin false
                    const token = jwt.sign({ data: results[0].user_id, isAdmin:false }, process.env.TOKEN_KEY, { expiresIn: process.env.TOKEN_EXPIRE });
                    res.status(200).json({ userId:results[0].user_id, token })
                }
            })
            .catch( error => {
                console.log('bcrypt promise catch block error', error);
                next(error);
            })
        })
    })
}