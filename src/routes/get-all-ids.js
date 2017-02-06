const express = require('express')
const app = express()

module.exports = function(collection) {
  /*
  * route for database id's retrieval
  */
  app.get('/messages/all', (req, res) => {
    collection.find({}).toArray((err, docs) => {
      if (err) {
        console.error(err)
        res.end('Error retrieving text ids.\n')
        return
      }

      // extract ids from all documents in the database and build response string
      let response = ''
      docs.forEach((doc) => {
        response += `${doc._id}\n`
      })

      res.end(response)
    })
  })

  return app
}
