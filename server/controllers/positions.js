const mysqlConnect = require('../config/db');

exports.getPositions = (req, res, next) => {
    mysqlConnect.then( connection => {
        const positions_query = 'SELECT id, position FROM positions ';
        connection.query(positions_query, (error, results,fields) => {
            if(error) return next(error);

            res.status(200).json(results);
        })
    })
}