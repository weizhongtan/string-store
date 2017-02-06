'use strict';

var express = require('express');
var app = module.exports = express();

// id string length for hex MD5 hash
var idLen = 32;

module.exports = function (collection) {
  /*
  * route for string retrieval/deletion
  */
  app.use('/messages/:id', function (req, res) {
    if (req.method === 'GET' || req.method === 'DELETE') {
      // extract id parameter from url
      var id = req.params.id;

      // validate id length
      if (id.length !== idLen) {
        // reject incorrect length hashes
        res.end('Id length should be ' + idLen + '.\n');
      } else {
        // process GET requests here
        if (req.method === 'GET') {
          // search for entry by index (binary tree search is very fast)
          collection.find({ _id: id }).toArray(function (err, docs) {
            if (err) {
              console.error(err);
              res.end('Error finding text string.\n');
              return;
            }

            // send text as response
            var doc = docs[0];
            if (doc) {
              res.end(doc.text + '\n');
            } else {
              // reject id if not found in collection
              res.end('Id not found.\n');
            }
          });
        } else {
          // process DELETE requests
          collection.deleteOne({ _id: req.params.id }, function (err, data) {
            if (err) {
              console.error(err);
              res.end('Text string with id: ' + req.params.id + ' could not be deleted. (it might not exist)');
              return;
            }

            res.end('Text string with id: ' + req.params.id + ' was deleted.\n');
          });
        }
      }
    } else {
      res.end('Use GET or DELETE.\n');
    }
  });

  return app;
};