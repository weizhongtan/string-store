const express = require('express')
const app = module.exports = express()

// id string length for hex MD5 hash
const idLen = 32

module.exports = function(collection) {
  /*
  * route for string retrieval/deletion
  */
  app.use('/messages/:id', (req, res) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      // extract id parameter from url
      const id = req.params.id

      // validate id length
      if (id.length !== idLen) {
        // reject incorrect length hashes
        res.end(`Id length should be ${idLen}.\n`)
      } else {
        // process GET requests here
        if (req.method === 'GET') {
          // search for entry by index (binary tree search is very fast)
          collection.find({ _id: id }).toArray((err, docs) => {
            if (err) {
              console.error(err)
              res.end('Error finding text string.\n')
              return
            }

            // send text as response
            const doc = docs[0]
            if (doc) {
              res.end(`${doc.text}\n`)
            } else {
              // reject id if not found in collection
              res.end('Id not found.\n')
            }
          })
        } else {
          // process DELETE requests
          collection.deleteOne({ _id: req.params.id }, (err, data) => {
            if (err) {
              console.error(err)
              res.end(`Text string with id: ${req.params.id} could not be deleted. (it might not exist)`)
              return
            }

            res.end(`Text string with id: ${req.params.id} was deleted.\n`)
          })
        }
      }
    } else {
      res.end('Use GET or DELETE.\n')
    }
  })

  return app
}
