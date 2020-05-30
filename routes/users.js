const express = require('express');
const db = require('../db.js');

const router = express.Router();

/* GET users listing. */
router.get('/*', function(req, res, next) {
  db.routeResolver(req.path, req, (route, err=false) => {
    if (err) {
      console.log(err);
      // res.status(404);
    } else {
      console.log("Route: " + route);
    }
    res.redirect(302, route);
  })
});

module.exports = router;
