const mysql = require('mysql');
const pool = mysql.createPool({
    host: process.env.LT_DB_HOST,
    user: process.env.LT_DB_USER,
    password: process.env.LT_DB_PASSWORD,
    database: process.env.LT_DB_DATABASE
});

/**
 *
 * @param query
 * @return {Promise<RowDataPacket[]>}
 */
let runQuery = query => {
    return new Promise((resolve, reject) => {
        pool.query(query, (err, rows) => {
            if (err || rows.length === 0) {
                reject(err);
            }
            resolve(rows);
        });
    });
};

let logQuery = () => {

};

let routeResolver = (path, callback) => {
    const query = "SELECT route FROM routes WHERE path = " + path;
    runQuery(query)
        .then(rowCheckerUtil)
        .then()     // update log   todo
        .then(rows => callback(rows[0].route))
        .catch(callback(404));
};

let referrerResolver = (refID, callback) => {
    const query = "SELECT route_id FROM referrers WHERE ref_string = " + refID;     // Todo: NOT VALID
    runQuery(query)
        .then(rowCheckerUtil)
        .then(rows => callback(rows[0].route))
        .catch(callback(404));
};

// todo test
let rowCheckerUtil = rows => {
    if (rows.length > 1 || rows[0].route === undefined) {
        throw new Error("Invalid number of rows for such path");
    }
}

runQuery("SELECT route FROM routes WHERE path = 'umass'")
    .then(r => console.log(r[0].route))
    .catch(console.error);

module.exports = {
    routeResolver: routeResolver,
    referrerResolver: referrerResolver
}
