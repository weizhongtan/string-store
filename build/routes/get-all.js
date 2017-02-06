'use strict';

var express = require('express');
var app = express();

module.exports = function (collection) {
  /*
  * route for database id's retrieval
  */
  app.get('/messages/all', function (req, res) {
    collection.find({}).toArray(function (err, docs) {
      if (err) {
        console.error(err);
        res.end('Error retrieving text ids.\n');
        return;
      }

      // extract ids from all documents in the database and build response string
      var response = '';
      docs.forEach(function (doc) {
        response += doc._id + '\n';
      });

      res.end(response);
    });
  });

  return app;
};