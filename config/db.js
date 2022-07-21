const mysql = require('mysql2');
const ErrorResponse = require('../utils/errorResponse');

const dbConfig = {
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
	database:process.env.DB_DATABASE
}

const mysqlConnect = (config) => {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(config);
        connection.connect( (err) => {
            if(err) {
                reject(err);
                console.log( err + 'connection au mysql échoué');
            }else {
                resolve(connection); 
				console.log('connection au mysql réussie');
            }
        })
    })
}

module.exports = mysqlConnect(dbConfig);