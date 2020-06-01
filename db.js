const express = require('express');
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
 * @param {string} query
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
 * This function should not interfere with the routing and redirecting features of the server. The user should not be
 * aware or alerted of any errors.
 *
 * @param {string} route
 * @param {string} [referrer]
 * @param {Object<express.Request>} req
 * @return {Promise<string>}
 */
let logQuery = async (route, referrer, req) => {
    try {
        let location = await getLocation(req.ip);
        console.log(location);
        const query = "INSERT INTO log (route_id, referrer_id, request, ip, location, useragent) " +
                        `VALUES ((SELECT id FROM routes WHERE route = '${route}'), ` +
                        `(SELECT id FROM referrers WHERE ref_string = '${referrer}'), ` +
                        `'${req.originalUrl}', '${req.ip}', '${location}', ` +
                        `'${req.get('User-Agent').substring(0, 511)}')`;
        await runQuery(query);
    } catch (err) {
        console.error(err);
    }
    return route;
};

/**
 * This callback is for handling routes after being resolved as used in routeResolver and referrerResolver.
 *
 * @callback routerCallback
 * @param {string|number} [route]
 * @param {Error} [err]
 */

/**
 *
 * @param {string} path
 * @param {Object<express.Request>} req
 * @param {routerCallback} callback
 */
let routeResolver = (path, req, callback) => {
    const query = `SELECT route FROM routes WHERE path = '${path}'`;
    runQuery(query)
        .then(routeCheckerExtractor)
        .then(route => logQuery(route, undefined, req))
        .then(callback)
        .catch(err => callback(404, err));
};

/**
 *
 * @param {string} refID
 * @param {Object<express.Request>} req
 * @param {routerCallback} callback
 */
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
 * @param {RowDataPacket[]} rows
 * @return {string}
 */
let routeCheckerExtractor = rows => {
    if (rows.length > 1 || rows[0].route === undefined) {
        throw new Error("Invalid number of rows for such path");
    }
    return rows[0].route.toString();    // guarantees that it's a string
}

/**
 *
 * @param {string} ip
 * @return {Promise<string>}
 */
let getLocation = async ip => {
    let location = "no location available";
    if (ip !== '::1') {
        try {
            location = (await axios.get(ipstackUrl + ip + "?access_key=" + ipstackKey)).data;
            location = location["city"].concat(", ", location["region_name"], ", ", location["country_code"]);
        } catch (err) {
            console.error(err);
            location = "unable to decode location from ip";
        }
    }
    return location;
}

// routeResolver('umass', undefined, console.log);
// referrerResolver('8f760259f7a44c2d', undefined, console.log)

module.exports = {
    routeResolver: routeResolver,
    referrerResolver: referrerResolver
}
