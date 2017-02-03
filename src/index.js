const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const crypto = require('crypto')

const app = express()
const port = process.env.PORT || 8000
const idLen = 32 // hash length for hex MD5 hash

// set mongodb url for heroku/c9.io running environments
const mongoUrl = process.env.MONGODB_URI || `mongodb://${process.env.IP}/local` || null

// parse application/x-www-form-urlencoded requests
app.use(bodyParser.urlencoded( { extended: true } ))

// router for string creation
app.post('/messages/', (req, res) => {
  // extract the text from the post body
  const text = Object.getOwnPropertyNames(req.body)[0]

  // reject incredibly long strings
  if (text.length > 1000000) {
    res.end('Messages must be <1MB.\n')
  } else {
    // compute hash of text string
    const hash = crypto.createHash('md5').update(text).digest('hex')

    // open database
    MongoClient.connect(mongoUrl, (err, db) => {
      if (err) throw err

      // open collection
      const strings = db.collection("strings")

      // define text document
      const doc = { _id: hash, text }

      // insert text doc into strings collection
      strings.insert(doc, (err, data) => {
        if (err) {
          // catch errors due to index duplication
          if (err.code === 11000) {
            // return duplicate id to user
            res.end(`${JSON.stringify( { id: hash } )}\n`)
          } else {
            // throw other errors
            throw err
          }
        } else {
          // return id to user
          res.end(`${JSON.stringify( { id: data.ops[0]._id } )}\n`)
        }

        // close database
        db.close()
      })
    })
  }
})

// router for string retrieval
app.get('/messages/:id', (req, res) => {
  // extract id parameter from url
  const id = req.params.id

  // validate id length
  if (id.length !== idLen) {
    // reject incorrect length hashes
    res.end(`Id length should be ${idLen}.\n`)
  } else {
    // open database
    MongoClient.connect(mongoUrl, (err, db) => {
      if (err) throw err

      // open collection
      const strings = db.collection('strings')

      // search for entry by index (binary tree search is very fast)
      strings.find( { _id: id } )
      // convert cursor to array
      .toArray((err, docs) => {
        if (err) throw err

        // send text as response
        const doc = docs[0]
        if (doc) {
          res.end(`${doc.text}\n`)
        } else {
          // reject id if not found in collection
          res.end('Id not found.\n')
        }
      })

      // close database
      db.close()
    })
  }
})

// default response
app.use('/*', (req, res) => {
  res.end('Usage: curl $domain/messages/ -d "message"\nor:    curl $domain/messages/id\n')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`)
})
