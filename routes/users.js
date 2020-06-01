const express = require('express');
const db = require('../db.js');

const router = express.Router();

// to generate referrers: hexdump -n 8 -e '2/4 "%04X" 1 "\n"' /dev/random | tr '[:upper:]' '[:lower:]'

/* GET users listing. */
router.get('/*', function(req, res, next) {
    // get the referrerID from the request
    let referrerID = req.query.ref;
    if (referrerID.match("^[a-f0-9]{16}$")) {
        // referrer passed the regex, lookup referrer
        db.referrerResolver(referrerID, req, (route, err=false) => {
            if (route === 404) {
                if (err) {
                    console.error(err);
                }
                res.sendStatus(404);
            } else {
                console.log("Route: " + route);
                res.redirect(302, route);
            }
        });

    } else {
        // send resolved route
        db.routeResolver(req.path, req, (route, err=false) => {
            if (route === 404) {
                if (err) {
                    console.error(err);
                }
                res.sendStatus(404);
            } else {
                console.log("Route: " + route);
                res.redirect(302, route);
            }
        });
    }
});

module.exports = router;
