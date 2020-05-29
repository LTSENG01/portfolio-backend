const mysql = require('mysql');
const pool = mysql.createPool({
    host: process.env.LT_DB_HOST,
    user: process.env.LT_DB_USER,
    password: process.env.LT_DB_PASSWORD,
    database: process.env.LT_DB_DATABASE
});

let runQuery = (query) => {
    return new Promise((resolve, reject) => {
        pool.query(query, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
};

runQuery("SELECT route FROM routes WHERE path = 'umass'")
    .then(console.log)
    .catch(console.error);

module.exports = {
    runQuery: runQuery
}
