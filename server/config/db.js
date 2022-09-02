const mysql = require('mysql2');

const dbConfig = {
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
	database:process.env.DB_DATABASE,
    port:process.env.DB_PORT,
    multipleStatements: true
}

const mysqlConnect = (config) => {
    return new Promise((resolve, reject) => {
        // create connection obj for mysql DB
        const connection = mysql.createConnection(config);
        
        // connect with mysql DB, return out connection obj when connected successfully
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