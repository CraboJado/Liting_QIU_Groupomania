const mysqlConnect = require('../config/db');

exports.getDpts = (req, res, next) => {
    mysqlConnect.then( connection => {
        const dpt_query = 'SELECT id, name FROM departments ';
        connection.query(dpt_query, (error, results,fields) => {
            if(error) return next(error);

            res.status(200).json(results);
        })
    })
}