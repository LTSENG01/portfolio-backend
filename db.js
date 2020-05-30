const mysql = require('mysql');
const axios = require('axios').default;

const pool = mysql.createPool({
    host: process.env.LT_DB_HOST,
    user: process.env.LT_DB_USER,
    password: process.env.LT_DB_PASSWORD,
    database: process.env.LT_DB_DATABASE
});

const ipstackUrl = "http://api.ipstack.com/";
const ipstackKey = process.env.IPSTACK_API;

/**
 *
 * @param query
 * @return {Promise<RowDataPacket[]>}
 */
let runQuery = async query => {
    return new Promise((resolve, reject) => {
        pool.query(query, (err, rows) => {
            if (err || rows.length === 0) {
                reject(err);
            }
            resolve(rows);
        });
    });
};

/**
 * Non-blocking?
 *
 * @param route
 * @param referrer
 * @param req
 * @return {Promise<*>}
 */
let logQuery = async (route, referrer, req) => {
    try {
        let location;

        try {
            if (req.ip !== '::1') {
                location = (await axios.get(ipstackUrl + req.ip + "?access_key=" + ipstackKey)).data;
                location = location["city"].concat(", ", location["region_name"], ", ", location["country_code"]);
            }
        } catch (err) {
            console.error(err);
        }

        const query = "INSERT INTO log (route_id, referrer_id, request, ip, location, useragent, referer) " +
                        `VALUES ((SELECT id FROM routes WHERE route = '${route}'), ` +
                        `(SELECT id FROM referrers WHERE ref_string = '${referrer}'), ` +
                        `'${req.originalUrl}', '${req.ip}', '${location}', ` +
                        `'${req.get('User-Agent').substring(0, 511)}', '${req.get('Referer')}')`;

        await runQuery(query)
    } catch (err) {
        console.error(err);
    }

    return route;
};

let routeResolver = (path, req, callback) => {
    const query = `SELECT route FROM routes WHERE path = '${path}'`;
    runQuery(query)
        .then(routeCheckerExtractor)
        .then(route => logQuery(route, undefined, req))
        .then(callback)
        .catch(err => callback(404, err));
};

let referrerResolver = (refID, req, callback) => {
    const query = "SELECT routes.route FROM referrers INNER JOIN routes " +
        `WHERE routes.id = referrers.route_id AND referrers.ref_string = '${refID}'`;
    runQuery(query)
        .then(routeCheckerExtractor)
        .then(route => logQuery(route, refID, req))
        .then(callback)
        .catch(err => callback(404, err));
};

/**
 *
 * @param rows
 * @return {string}
 */
let routeCheckerExtractor = rows => {
    if (rows.length > 1 || rows[0].route === undefined) {
        throw new Error("Invalid number of rows for such path");
    }
    return rows[0].route;
}

// routeResolver('umass', undefined, console.log);
// referrerResolver('8f760259f7a44c2d', undefined, console.log)

module.exports = {
    routeResolver: routeResolver,
    referrerResolver: referrerResolver
}
