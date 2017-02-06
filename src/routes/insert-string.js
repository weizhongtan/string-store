const express = require('express')
const app = express()
const crypto = require('crypto')

module.exports = function(collection) {
  /*
  * route for string insertion
  */
  app.post('/messages/', (req, res) => {
    // extract the text from the post body
    const text = req.body

    // reject invalid strings (eg empty)
    if (!text) {
      res.end('Invalid string.\n')
      // reject incredibly long strings
    } else if (text.length > 1000000) {
      res.end('Messages must be <1MB.\n')
    } else {
      // compute hash of text string
      const hash = crypto.createHash('md5').update(text).digest('hex')

      // define text document
      const doc = { _id: hash, text }

      // insert text doc into collection
      collection.insert(doc, {wtimeout: 1000}, (err, data) => {
        if (err) {
          // catch errors due to index duplication
          if (err.code === 11000) {
            // return duplicate id to user
            res.end(`${JSON.stringify( { id: hash } )}\n`)
          } else {
            // deal with other errors
            console.error(err)
            res.end('Couldn\'t insert text string into database.\n')
          }
        } else {
          // return id to user
          res.end(`${JSON.stringify( { id: data.ops[0]._id } )}\n`)
        }
      })
    }
  })

  return app
}
