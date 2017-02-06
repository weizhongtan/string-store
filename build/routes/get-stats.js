'use strict';

var express = require('express');
var app = express();

module.exports = function (collection) {
  /*
  * route for database stats retrieval
  */
  app.get('/messages/stats', function (req, res) {
    collection.count({}, function (err, num) {
      if (err) {
        console.error(err);
        res.end('Could not retrieve stats.\n');
        return;
      }

      // return stats string
      res.end('There ' + (num === 1 ? 'is' : 'are') + ' ' + num + ' string' + (num === 1 ? '' : 's') + ' in the database.\n');
    });
  });

  return app;
};