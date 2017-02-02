const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const crypto = require('crypto')

const app = express()
const port = process.env.PORT || 8000
const mongoUrl = process.env.MONGODB_URI || `mongodb://${ip}/local`

// apply body parser middleware to post requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// router for string creation
app.post('/messages/', (req, res) => {
  // extract the text from the post body
  const text = Object.getOwnPropertyNames(req.body)[0]

  // reject incredibly long strings
  if (text.length > 1000) {
    res.end('String must be less than 1000 characters long.')
  } else {
    // compute hash of text string
    const hash = crypto.createHash('md5').update(text).digest('hex');

    // open database
    MongoClient.connect(mongoUrl, (err, db) => {
      if (err) throw err

      // open collection
      const strings = db.collection("strings")

      // define text document
      const doc = { _id: hash, text }

      strings.insert(doc, (err, data) => {
        if (err) {
          // catch errors due to index duplication
          if (err.code === 11000) {
            // return duplicate id to user
            res.end(JSON.stringify( { id: hash } ))
          } else {
            // otherwise throw other errors
            throw err
          }
        } else {
          // return id to user
          res.end(JSON.stringify({ id: data.ops[0]._id }))
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
  if (id.length > 0) {
    // open database
    MongoClient.connect(mongoUrl, (err, db) => {
      if (err) throw err

      // open collection
      const strings = db.collection("strings")

      // search for entry by index (binary tree search is very fast)
      strings.find( { _id: id } )
      // convert cursor to array
      .toArray((err, docs) => {
        const doc = docs[0]

        // send text as response
        if (doc) {
          res.end(doc.text)
        } else {
          // reject id
          res.end('Invalid id.')
        }
      })

      // close database
      db.close()
    })

  } else {
    // reject id
    res.end(`Invalid id.`)
  }
})

// default response
app.use('/*', (req, res) => {
  res.end('Usage: $domain/messages/ -d "message"\nor:    $domain/messages/id')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`)
})
