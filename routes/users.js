const express = require('express');
const db = require('../db.js');

const router = express.Router();

// to generate referrers:   hexdump -n 8 -e '2/4 "%04X" 1 "\n"' /dev/random | tr '[:upper:]' '[:lower:]'

/* GET users listing. */
router.get('/*', function(req, res, next) {
    // get the referrerID from the request
    let referrerID = req.query.ref;
    if (referrerID !== undefined && referrerID.match("^[a-f0-9]{16}$")) {
        // referrer passed the regex, lookup referrer
        db.referrerResolver(referrerID, req, routerCallback);
    } else {
        // lookup route
        db.routeResolver(req.path, req, routerCallback);
    }

    /**
     * This callback is for handling routes after being resolved as used in routeResolver and referrerResolver.
     *
     * @callback routerCallback
     * @param {string|number} [route]
     * @param {Error} [err]
     */
    function routerCallback(route, err) {
        if (route === 404) {
            if (err) {
                console.error(err);
            }
            res.sendStatus(404);    // 404 on failure
        } else {
            console.log(req.ip + " Route: " + route);
            res.redirect(302, route);   // 302 redirect on success
        }
    }
});

module.exports = router;
