'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')

const app = express()
const port = process.env.PORT || 8000
const idLen = 32 // id string length for hex MD5 hash 

// open database and collection (this must be done asyncronously)
let strings
require('./model/db').initialize(collection => {
  strings = collection
  
  // once db and collection is established, start listening
  app.listen(port, () => {
    console.log(`Server listening on port ${port}.`)
  })
})

// parse all application/x-www-form-urlencoded requests
app.use(bodyParser.urlencoded( { extended: true } ))

/*
* route for string insertion
*/ 
app.post('/messages/', (req, res) => {
  // extract the text from the post body
  const text = Object.getOwnPropertyNames(req.body)[0]

  // reject incredibly long strings
  if (text.length > 1000000) {
    res.end('Messages must be <1MB.\n')
  } else {
    // compute hash of text string
    const hash = crypto.createHash('md5').update(text).digest('hex')

    // define text document
    const doc = { _id: hash, text }

    // insert text doc into strings collection
    strings.insert(doc, {wtimeout: 1000}, (err, data) => {
      if (err) {
        // catch errors due to index duplication
        if (err.code === 11000) {
          // return duplicate id to user
          res.end(`${JSON.stringify( { id: hash } )}\n`)
        } else {
          // deal with other errors
          console.warn('Couldn\'t insert text string into database.\n')
          res.end('Couldn\'t insert text string into database.\n')
        }
      } else {
        // return id to user
        res.end(`${JSON.stringify( { id: data.ops[0]._id } )}\n`)
      }
    })
  }
})

/*
* route for string retrieval
*/
app.get('/messages/:id', (req, res) => {
  // extract id parameter from url
  const id = req.params.id

  // validate id length
  if (id.length !== idLen) {
    // reject incorrect length hashes
    res.end(`Id length should be ${idLen}.\n`)
  } else {
    // search for entry by index (binary tree search is very fast)
    strings.find( { _id: id } ).maxTimeMS(1000)
    // convert cursor to array
    .toArray((err, docs) => {
      if (err) {
        console.warn('Error finding text string.\n')
        res.end('Error finding text string.\n')
        return
      }

      // send text as response
      const doc = docs[0]
      if (doc) {
        res.end(`${doc.text}`)
      } else {
        // reject id if not found in collection
        res.end('Id not found.\n')
      }
    })
  }
})

// default response
app.use('/*', (req, res) => {
  res.end('Usage: curl $domain/messages/ -d "message"\nor:    curl $domain/messages/id\n')
})
