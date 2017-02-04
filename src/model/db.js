'use strict'

const MongoClient = require('mongodb').MongoClient
// set mongodb url for heroku/c9.io running environments
const mongoUrl = process.env.MONGODB_URI || `mongodb://${process.env.IP}/local` || null

module.exports = {
  initialize: function(callback) {
    // attempt to open database
    MongoClient.connect(mongoUrl, (err, database) => {
      if (err) throw err
      // once database has been opened, callback
      callback(database)
    })
  }
}