const mysqlConnect = require('../config/db');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const getMysqlDate = require('../utils/getMysqlDate');
const { v4: uuidv4 } = require('uuid');

exports.signup = (req,res,next) => {
    console.log('in signup controller', req.body);
    const { email, password, name, department_id, job_id } = req.body;
    // signup a superadmin with a fixied email, 
    // this account can set other users as subAdmin with isAdmin = 1 if we need more admin accounts
    let isAdmin;
    email === process.env.SUPERADMIN ? isAdmin = 2 : isAdmin = 0;
    
    mysqlConnect.then( connection => {
        bcrypt.hash(password,10)
        .then( hash => {
            const users_query = `INSERT INTO users (user_id, email, password, name, department_id, job_id, isAdmin, create_time) VALUES(?,?,?,?,?,?,?,?)`;
            const insert_values = [uuidv4(),email, hash, name, department_id, job_id, isAdmin, getMysqlDate()]; // ajouter userid

            connection.query(users_query, insert_values, (error, results, fields) => {
                if (error) {
                    return next(error)
                }
                res.status(201).json({ message:"utilisateur créé" })
            })
        })
        .catch( error => {
            console.log('error in hash', error);
            next(error)
        })
    })
}

exports.login = (req,res,next) => {
    console.log('in login controller', req.body);
    const { email, password } = req.body;

    const users_query = `SELECT * FROM users WHERE email = ?`;
    mysqlConnect.then( connection => {
        connection.query(users_query,[email], (error, results, fields) => {
            if(error) {
                console.log('error in users_query', error);
                return next(error);
            }

            if(results.length === 0){
               return next( new ErrorResponse('utilisateur n\'existe pas', 404) )
            }

            bcrypt.compare(password,results[0].password)
            .then( valid => {
                if(!valid) {
                    return next( new ErrorResponse('requête non autorisée', 401) )
                }
                // if admin , send token with admin true ( plusieur admin ? ajoute isAdmin dans table user)
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