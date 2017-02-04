'use strict';

var MongoClient = require('mongodb').MongoClient;
// set mongodb url for heroku/c9.io/local running environments
var mongoUrl = process.env.MONGODB_URI || 'mongodb://' + (process.env.IP || 'localhost') + '/local';

module.exports = {
  initialize: function initialize(callback) {
    // attempt to open database
    MongoClient.connect(mongoUrl, {
      // if the connection with the database is lost, attempt to reconnect forever
      reconnectTries: Number.POSITIVE_INFINITY,
      reconnectInterval: 1000
    }, function (err, db) {
      if (err) throw err;

      // open collection in database
      var strings = db.collection("strings");

      // callback to set the strings collection
      callback(strings);
    });
  }
};