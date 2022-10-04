const mysqlConnect = require('../config/db');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { ErrorResponse, getMysqlDate } = require('../utils/utils');

exports.signup = (req,res,next) => {
    const { email, password, name, department, position } = req.body;
    // sign up a super admin with an environment variable (fixed email),
    // this account can set other users as subAdmin with isAdmin = 1 if need more admin accounts
    let isAdmin;
    email === process.env.SUPERADMIN ? isAdmin = 2 : isAdmin = 0;
    
    mysqlConnect.then( connection => {
        // hash user password
        bcrypt.hash(password,10)
        .then( hash => {
            const users_query = `INSERT INTO users (id, email, password, name, department_id, position_id, isAdmin, create_time) VALUES(?,?,?,?,?,?,?,?)`;

            const insert_values = [uuidv4(),email, hash, name, department, position, isAdmin, getMysqlDate()]; 

            connection.query(users_query, insert_values, (error, results, fields) => {
                if (error) return next(error);
    
                res.status(201).json({ message:"utilisateur créé" })
            })
        })
        .catch( error => next(error) )
    })
}

exports.login = (req, res, next) => {

    const { email, password } = req.body;

    const users_query = `SELECT id, isAdmin, password, name, avatar, department_id, position_id FROM users WHERE email = ?`;
    
    mysqlConnect.then( connection => {
        connection.query(users_query, [email], (error, results, fields) => {
            if(error) return next(error);
    
            if(!results.length) return next( new ErrorResponse('utilisateur n\'existe pas', 404) );

            // verify password
            bcrypt.compare(password,results[0].password)
            .then( valid => {
                if(!valid) return next( new ErrorResponse('non autorisée, mot de pass incorrect', 401) );

                // generate token with userId and isAdmin
                const token = results[0].isAdmin ? 
                jwt.sign({ data: results[0].id, isAdmin:true }, process.env.TOKEN_KEY, { expiresIn: process.env.TOKEN_EXPIRE })
                :
                jwt.sign({ data: results[0].id, isAdmin:false }, process.env.TOKEN_KEY, { expiresIn: process.env.TOKEN_EXPIRE });

                const user = { userId: results[0].id,
                               isAdmin:results[0].isAdmin,
                               name : results[0].name,
                               avatar : results[0].avatar,
                               departmentId : results[0].department_id,
                               jobId : results[0].job_id,
                               token 
                 }

                // logined sucessfully , send token , userId and isAdmin to front
                res.status(200).json(user)
            })
            .catch( error => next(error) )
        })
    })
}